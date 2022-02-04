/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  HttpStatus,
  ForbiddenException,
  Logger,
  Inject,
} from "@nestjs/common";
import { join } from "path";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, Balance } from "./user.interface";
import { LoginUserDto } from "./dto/user.dto";
import { HelperService } from "src/helper/helper.service";
import { ResponseHandlerService } from "src/helper/response-handler.service";
import { JwtService } from "@nestjs/jwt";
import * as appleSignin from "apple-signin-auth";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Onfido, Region, Applicant, OnfidoApiError } from "@onfido/api";
import { Role } from "../guards/role.enum";
import { AdminServiceClientOptions } from "./svc.options";
import { ClientGrpc, Client } from "@nestjs/microservices";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";

@Injectable()
export class UserService {
  private onfido: any;
  private sentryService: any;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectModel("User") private userModel: Model<User>,
    private readonly helperService: HelperService,
    private readonly responseHandlerService: ResponseHandlerService,
    private jwtService: JwtService,
    @InjectSentry() private readonly sentryClient: SentryService
  ) {
    this.sentryService = sentryClient.instance();
    this.onfido = new Onfido({
      apiToken: process.env.ONFIDO_API_TOKEN,
      // Supports Region.EU, Region.US and Region.CA
      region: Region.EU,
    });
  }

  // declaring client variables for gRPC client
  @Client(AdminServiceClientOptions)
  private readonly adminServiceClient: ClientGrpc;

  private adminService: any;
  onModuleInit() {
    // Injecting the gRPC clients in this service
    this.adminService = this.adminServiceClient.getService<any>("AdminService");
  }
  //GOOGLE SIGNIN
  async googleLogin(gUser: any) {
    try {
      // check if user is using gmail or not
      if (!gUser) {
        return "No user from google";
      }
      this.logger.log("info", `USER_SVC - googleLogin - for ${gUser}`);

      const gEmail = gUser.email;
      let gFirstName = null;
      let gLastName = null;
      if (gUser.name.split().length > 1) {
        gFirstName = gUser.name.split()[0];
        gLastName = gUser.name.split()[1];
      } else {
        gFirstName = gUser.name;
        gLastName = null;
      }

      const token = gUser.accessToken;
      const imageUrl = gUser.imageUrl;
      // fetching user via email
      let user = await this.userModel.findOne({ email: gEmail });
      // check if user exists
      if (!user) {
        this.logger.log(
          "info",
          `USER_SVC - googleLogin - user with email ${gEmail} not found`
        );
        // creating new user if no user exists
        const createdUser = await this.create({
          email: gEmail,
          first_name: gFirstName,
          last_name: gLastName,
          password: null,
          isEmailVerified: true,
          profileImageUrl: imageUrl,
          //username: gName + (Math.random() * 1000000).toString(),
        });
        user = createdUser;
        this.logger.log(
          "info",
          `USER_SVC - googleLogin - user ${createdUser} created`
        );
      }
      user = await this.helperService.serializeUser(user);
      user["token"] = token;
      return {
        message: "User information from google",
        user,
        token,
        expiresIn: 3600,
      };
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(
        e,
        HttpStatus.UNAUTHORIZED,
        null
      );
    }
  }

  // Apple Login
  public async appleLogin(payload: any): Promise<any> {
    try {
      const key_name = join(
        __dirname,
        `../../../../secrets/${process.env.APPLE_RSA_KEY_NAME}`
      );

      // creating clientSecret
      const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyIdentifier: process.env.APPLE_KEY_IDENTIFIER || "eXaunmL",
        privateKeyPath: join(
          __dirname,
          `../../../../secrets/${process.env.APPLE_RSA_KEY_NAME}`
        ),
      });

      // creating token using clientId, clientSecret
      const tokens = await appleSignin.getAuthorizationToken(payload.code, {
        clientID: process.env.APPLE_CLIENT_ID,
        clientSecret: clientSecret,
        redirectUri: process.env.APPLE_REDIRECT_URL,
      });

      // check if the token is valid
      if (!tokens.id_token) {
        await this.responseHandlerService.response(
          "FORBIDDEN",
          HttpStatus.FORBIDDEN,
          null
        );
      }

      // TODO: AFTER THE FIRST LOGIN APPLE WON'T SEND THE USERDATA ( FIRST NAME AND LASTNAME, ETC.) THIS SHOULD BE SAVED ANYWHERE

      const data: any = await appleSignin.verifyIdToken(
        tokens.id_token,
        process.env.APPLE_CLIENT_ID
      );
      this.logger.log("error", `data - ${JSON.stringify(data)}`);
      let gEmail = data.email ? data.email : null;
      if (gEmail && gEmail.includes("@privaterelay.appleid.com")) {
        gEmail = null;
      }
      let gFirstName = null;
      let gLastName = null;
      if (data.name.split().length > 1) {
        gFirstName = data.name.split()[0];
        gLastName = data.name.split()[1];
      } else {
        gFirstName = data.name;
        gLastName = null;
      }
      //const gName = data.name ? data.name : null; // gUser.name
      const appleId = data.sub;
      const token = tokens.id_token;
      const refreshToken = tokens.refresh_token;
      let user = await this.userModel.findOne({ appleId });
      if (gEmail && !user) {
        user = await this.userModel.findOne({ email: gEmail });
      }

      // check if user exists and if not creating a new user and saving it to db
      if (!user) {
        const createdUser = await this.create({
          email: gEmail,
          first_name: gFirstName,
          last_name: gLastName,
          appleId,
          password: null,
          isEmailVerified: gEmail ? true : false,
        });

        user = createdUser;
      } else {
        user.appleId = appleId;
        await user.save();
      }

      user = await this.helperService.serializeUser(user);
      user["token"] = token;
      return {
        message: "User information from apple",
        user,
        token,
        refreshToken,
        expiresIn: data.exp,
      };
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(
        e,
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }
  }

  //CREATE USER
  async create(createUserDto): Promise<User> {
    try {
      // fetching global variables from platformConstant
      const { platformConstant } = await this.adminService
        .getPlatformConstant({})
        .toPromise();
      // checking whether the user can createcollection or not
      createUserDto.canCreateCollection =
        platformConstant.AllowedCollectionCreation || false;
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();
      return await this.helperService.serializeUser(user);
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(
        e,
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }
  }

  // SignUp
  async signup(createUserDto) {
    createUserDto.email = createUserDto.email.toLowerCase();
    // fetching user via email
    let user = await this.findOneByEmail(createUserDto.email);
    // check whether email already exists
    if (user) {
      await this.responseHandlerService.response(
        "account with this email already exists!",
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }
    // creating user
    user = await this.create(createUserDto);
    user = await this.helperService.serializeUser(user);
    const { token } = await this.createJwtpayload(user);
    return {
      message: "User information from google",
      user,
      token,
      expiresIn: 3600,
    };
  }

  // Find user by email
  async findOneByEmail(email) {
    return await this.userModel.findOne({ email: email });
  }

  // Find user by id
  async findOneById(id) {
    return await this.userModel.findOne({ _id: id });
  }

  // Find user by appleid
  async findOneByAppleId(appleId) {
    return await this.userModel.findOne({ appleId });
  }

  // Find user by email or username
  async findOneByEmailOrUsername(attempt) {
    if (await this.helperService.isValidUsername(attempt)) {
      return await this.userModel.findOne({ username: attempt });
    } else {
      return await this.findOneByEmail(attempt.toLowerCase());
    }
  }

  // validate user by password
  async validateUserByPassword(loginAttempt: LoginUserDto) {
    const userToAttempt = await this.findOneByEmailOrUsername(
      loginAttempt.emailOrUsername
    );
    // to check if user exists
    if (!userToAttempt) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    const isMatch = await userToAttempt.checkPassword(loginAttempt.password);

    // check if account is blocked
    if (isMatch) {
      const result: any = {};
      if (userToAttempt.isBlocked === true) {
        await this.responseHandlerService.response(
          "your account is suspended, contact admin",
          HttpStatus.FORBIDDEN,
          null
        );
      }
      // authentication user
      const user = await this.helperService.serializeUser(userToAttempt);
      result.user = user;
      result.message = "Authenticated";
      if (!userToAttempt.twoFactorAuth) {
        const token = await this.createJwtpayload(userToAttempt);
        result.token = token.token;
        result.expiresIn = token.expiresIn;
      }
      return result;
    } else {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }
  }

  // two factor auth
  async twoFactorOtp(email) {
    const user = await this.findOneByEmail(email);
    // check if the user exists or not
    if (!user) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    //check to verify email of the user
    if (!user.isEmailVerified) {
      await this.responseHandlerService.response(
        "email not verified",
        HttpStatus.FORBIDDEN,
        null
      );
    }

    return await this.sendOtp(user, user.email, "two-factor-auth");
  }

  async twoFactorVerify(twoFactorOtpDto) {
    const { otp: attemptOtp, email } = twoFactorOtpDto;
    let user = await this.findOneByEmail(email);
    // check if the user exists
    if (!user) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    // check if there are any active
    if (!user.otp || user.otp.forTask !== "two-factor-auth") {
      await this.responseHandlerService.response(
        "No active otp found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    // verifying otp
    const verified = await this.helperService.checkOtp(attemptOtp, user.otp);

    // after successfull verification of otp,
    if (verified.success) {
      user.otp = null;
      await user.save();
      const { token, expiresIn } = await this.createJwtpayload(user);
      user = await this.helperService.serializeUser(user);
      return {
        message: "Authenticated",
        user,
        token,
        expiresIn,
      };
    }

    if (verified.message === "otp has expired") {
      user.otp = null;
      await user.save();
    }
    await this.responseHandlerService.response(verified.message, 406, null);
  }

  // validate user via token
  async validateUserByJwt(payload) {
    // fetching user via email
    const user = await this.findOneByEmail(payload.email);
    if (user) {
      let result = await this.createJwtpayload(user);

      result = Object.assign(result, JSON.parse(JSON.stringify(user)));
      return result;
    } else {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }
  }

  // create jwt token
  async createJwtpayload(user) {
    const data = {
      email: user.email,
    };
    const expiresIn = user.email === "demo@gmail.com" ? 31536000 : 3600 * 24;
    const jwt = this.jwtService.sign(data, { expiresIn });
    return {
      expiresIn,
      token: jwt,
    };
  }

  // check user email
  async sendEmailOtp(user, email) {
    if (user.email !== email) {
      const userAttempt = await this.userModel.findOne({ email });
      // users email validation
      if (userAttempt) {
        await this.responseHandlerService.response(
          "user with this email already exists",
          HttpStatus.NOT_ACCEPTABLE,
          null
        );
      }
    }
    return await this.sendOtp(user, email, "email-verification");
  }

  // send otp
  async sendOtp(user2, email, forTask) {
    const user = await this.userModel.findOne({ _id: user2._id });
    // check if user exists or not
    if (!user) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    // generating otp and saving the data for the user in db
    const otp = await this.helperService.generateOtp(forTask);
    user.otp = otp;
    await user.save();
    await this.helperService.sendEmail(
      email,
      forTask,
      "",
      `Your OTP for ${forTask} is <b>${otp.otp}</b>. It is valid for next 10 minutes`
    );
    return {
      message: `OTP sent successfully to ${email}`,
      expiresIn: "10 minutes",
      forTask,
    };
  }
  // verify otp
  async verifyEmailOtp(user, otp, email) {
    // fetching user via userId and checking for any active valid otp
    user = await this.userModel.findOne({ _id: user._id });
    if (!user.otp || user.otp.forTask !== "email-verification") {
      await this.responseHandlerService.response(
        "No active OTP found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    const attemptOtp = otp;
    const verified = await this.helperService.checkOtp(attemptOtp, user.otp);

    // saving data for the user in db after successful otp verification
    if (verified.success) {
      user.otp = null;
      user.email = email;
      user.isEmailVerified = true;
      await user.save();
      const { token, expiresIn } = await this.createJwtpayload(user);
      user = await this.helperService.serializeUser(user);
      return { message: verified.message, token, expiresIn, user };
    }

    // check if otp is already expired and saving the otp to null in db
    if (verified.message === "otp has expired") {
      user.otp = null;
      await user.save();
    }

    await this.responseHandlerService.response(verified.message, 406, null);
  }

  // Forgot password otp
  async forgotPasswordOtp(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    return await this.sendOtp(user, email, "forget-password");
  }

  // forgot password
  async forgotPasswordVerify(forgotPasswordDto) {
    const { otp: attemptOtp, email, password: newPassword } = forgotPasswordDto;
    const user = await this.findOneByEmail(email);
    // check if user exists
    if (!user) {
      await this.responseHandlerService.response(
        "User Not Found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    // check if there are any active otp
    if (!user.otp || user.otp.forTask !== "forget-password") {
      await this.responseHandlerService.response(
        "No active OTP found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    const verified = await this.helperService.checkOtp(attemptOtp, user.otp);

    // check if otp verified and saving it to db
    if (verified.success) {
      user.otp = null;
      user.password = newPassword;
      await user.save();
      return { message: verified.message };
    }

    if (verified.message === "otp has expired") {
      user.otp = null;
      await user.save();
    }

    if (verified.success) {
      verified.message += ", password reset successfully";
    }
    await this.responseHandlerService.response(verified.message, 406, null);
  }

  // reset pssword
  async resetPassword(user, resetPasswordDto) {
    user = await this.findOneByEmail(user.email);
    const { newPassword, currentPassword } = resetPasswordDto;
    // check for users password
    if (!user.password) {
      await this.responseHandlerService.response(
        "Incorrect Password",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }

    const isMatch = await user.checkPassword(currentPassword);

    // check to validate password using ismatch
    if (!isMatch) {
      await this.responseHandlerService.response(
        "Incorrect Password",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }

    user.password = newPassword;
    await user.save();
    return {
      message: "password reset successfully",
    };
  }

  async updateProfileinactive(user, updateProfileDto) {
    //user = await this.findOneByEmail(user.email);

    // check for users password and
    if (updateProfileDto.newPassword && updateProfileDto.currentPassword) {
      if (
        !updateProfileDto.isAdmin &&
        updateProfileDto.newPassword &&
        updateProfileDto.currentPassword
      ) {
        const { newPassword, currentPassword } = updateProfileDto;
        await this.resetPassword(user, { newPassword, currentPassword });
      }

      // fetching user via userid
      user = await this.userModel.findOne({ _id: user._id });
      // users profile related filters
      if (updateProfileDto.isBlocked !== null) {
        user.isBlocked = updateProfileDto.isBlocked === true ? true : false;
      }

      if (updateProfileDto.status !== null) {
        user.status = updateProfileDto.status;
      }

      if (updateProfileDto.mobile) {
        user.mobile = updateProfileDto.mobile;
      }

      if (updateProfileDto.username) {
        user.username = updateProfileDto.username;
      }

      if (updateProfileDto.last_name !== null) {
        user.last_name = updateProfileDto.last_name;
      }

      if (updateProfileDto.first_name !== null) {
        user.first_name = updateProfileDto.first_name;
      }

      if (updateProfileDto.email) {
        user.email = updateProfileDto.email;
      }

      if (updateProfileDto.socialTelegram !== null) {
        user.socialTelegram = updateProfileDto.socialTelegram;
      }

      if (updateProfileDto.socialDiscord !== null) {
        user.socialDiscord = updateProfileDto.socialDiscord;
      }

      if (updateProfileDto.socialTwitter !== null) {
        user.socialTwitter = updateProfileDto.socialTwitter;
      }

      if (updateProfileDto.socialInstagram !== null) {
        user.socialInstagram = updateProfileDto.socialInstagram;
      }

      if (updateProfileDto.socialYoutube !== null) {
        user.socialYoutube = updateProfileDto.socialYoutube;
      }

      if (updateProfileDto.socialTiktok !== null) {
        user.socialTiktok = updateProfileDto.socialTiktok;
      }

      if (updateProfileDto.socialTwitch !== null) {
        user.socialTwitch = updateProfileDto.socialTwitch;
      }

      if (updateProfileDto.canCreateCollection !== null) {
        user.canCreateCollection = updateProfileDto.canCreateCollection;
      }

      if (updateProfileDto.profileImageUrl !== null) {
        user.profileImageUrl = updateProfileDto.profileImageUrl;
      }

      if (updateProfileDto.stripe_account_id !== null) {
        user.stripe_account_id = updateProfileDto.stripe_account_id;
      }

      if (
        updateProfileDto.twoFactorAuth !== null ||
        updateProfileDto.twoFactorAuth !== undefined
      ) {
        user.twoFactorAuth = updateProfileDto.twoFactorAuth;
      }
      try {
        // check if user profile updated successfully and after confirmation saving data to db
        user.isProfileUpdated = true;
        await user.save();
        return {
          user,
          message: "profile updated successfully",
        };
      } catch (error) {}
    }
  }

  // function to update profile
  async updateProfile(user, updateProfileDto) {
    if (updateProfileDto.newPassword && updateProfileDto.currentPassword) {
      //check to resetpassword and also checking that user should not be admin
      if (
        !updateProfileDto.isAdmin &&
        updateProfileDto.newPassword &&
        updateProfileDto.currentPassword
      ) {
        const { newPassword, currentPassword } = updateProfileDto;
        await this.resetPassword(user, { newPassword, currentPassword });
      }
    }
    user = await this.userModel.findOne({ _id: user._id });
    // check to disallow any changes if users role is "Admin"
    if (user.role == "admin") {
      await this.responseHandlerService.response(
        "forbidden",
        HttpStatus.FORBIDDEN,
        null
      );
    }
    // filters for users profile
    if (updateProfileDto.isBlocked !== null) {
      user.isBlocked = updateProfileDto.isBlocked === true ? true : false;
    }
    if (updateProfileDto.status !== null) {
      user.status = updateProfileDto.status;
    }
    if (updateProfileDto.mobile) {
      user.mobile = updateProfileDto.mobile;
    }
    if (updateProfileDto.username) {
      user.username = updateProfileDto.username;
    }
    if (updateProfileDto.first_name) {
      user.first_name = updateProfileDto.first_name;
    }
    if (updateProfileDto.last_name) {
      user.last_name = updateProfileDto.last_name;
    }

    if (updateProfileDto.role) {
      user.role = updateProfileDto.role;
    }

    if (updateProfileDto.email) {
      user.email = updateProfileDto.email;
    }
    if (updateProfileDto.socialTelegram) {
      user.socialTelegram = updateProfileDto.socialTelegram;
    }
    if (updateProfileDto.socialDiscord) {
      user.socialDiscord = updateProfileDto.socialDiscord;
    }
    if (updateProfileDto.socialTwitter) {
      user.socialTwitter = updateProfileDto.socialTwitter;
    }
    if (updateProfileDto.socialInstagram) {
      user.socialInstagram = updateProfileDto.socialInstagram;
    }
    if (updateProfileDto.socialYoutube) {
      user.socialYoutube = updateProfileDto.socialYoutube;
    }
    if (updateProfileDto.socialTiktok) {
      user.socialTiktok = updateProfileDto.socialTiktok;
    }
    if (updateProfileDto.socialTwitch) {
      user.socialTwitch = updateProfileDto.socialTwitch;
    }
    if (updateProfileDto.profileImageUrl) {
      user.profileImageUrl = updateProfileDto.profileImageUrl;
    }

    if (updateProfileDto.stripe_account_id) {
      user.stripe_account_id = updateProfileDto.stripe_account_id;
    }

    if (
      updateProfileDto.twoFactorAuth !== null ||
      updateProfileDto.twoFactorAuth !== undefined
    ) {
      user.twoFactorAuth = updateProfileDto.twoFactorAuth;
    }
    if (user.role === Role.Superadmin) {
      user.twoFactorAuth = true;
    }
    if (
      [
        "61c0d407e2592d1aaac26b24",
        "61c16ba983689bda6a7bcf4f",
        "61c16c1b83689bda6a7c3772",
        "61c16c4b83689bda6a7c69bb",
        "61c16cb283689bda6a7cd010",
      ].includes(user._id.toString())
    ) {
      //temp changes
      user.twoFactorAuth = false;
    }
    try {
      // check if user profile updated successfully and after confirmation saving data to db
      user.isProfileUpdated = true;
      await user.save();
      return {
        user,
        message: "profile updated successfully",
      };
    } catch (error) {
      await this.sentryService.captureException(error); // sentry for logging
      console.log(error);
      await this.responseHandlerService.response(error, 500, null);
    }
  }

  // check email
  async checkEmail({ newEmail, userId }) {
    let user = null;
    try {
      // fetching user via userid
      user = await this.userModel.findOne({ _id: userId });
    } catch (e) {
      await this.sentryService.captureException(e);
      console.log(e);
      this.logger.log(
        "error",
        `#USER-MSC - checkEmail called with ${JSON.stringify(e)}`
      );
      user = null;
    }

    // check for email
    if (user && newEmail === user.email) {
      return {
        message: "available",
      };
    }

    // check for fetching user via email
    user = await this.findOneByEmail(newEmail);
    if (user) {
      await this.responseHandlerService.response(
        "unavailable",
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }

    return {
      message: "available",
    };
  }

  // check username
  async checkUsername({ username }) {
    const user = await this.userModel.findOne({ username });
    if (user) {
      await this.responseHandlerService.response(
        "unavailable",
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }

    return {
      message: "available",
    };
  }

  // function to upload picture
  async uploadProfilePicture(user, profilePicDto) {
    user = await this.findOneByEmail(user.email);

    // checking fileurl with profileimage url
    user.profileImageUrl = profilePicDto.fileUrl;
    await user.save();
    return {
      message: "file uploaded",
    };
  }

  // List users
  async listUsers(listUsersDto) {
    const matches: any = {};

    // users profile related filters
    if (listUsersDto.userId) {
      matches.userId = listUsersDto.userId;
    }

    if (listUsersDto.status) {
      matches.status = listUsersDto.status;
    }

    if (
      listUsersDto.canCreateCollection !== null &&
      listUsersDto.canCreateCollection !== undefined
    ) {
      matches.canCreateCollection =
        listUsersDto.canCreateCollection === true ? true : false;
    }

    if (
      listUsersDto.isBlocked !== null &&
      listUsersDto.isBlocked !== undefined
    ) {
      matches.isBlocked = listUsersDto.isBlocked === true ? true : false;
    }

    if (listUsersDto.role !== null && listUsersDto.role !== undefined) {
      matches.role = listUsersDto.role;
    }

    if (
      listUsersDto.twoFactorAuth !== null &&
      listUsersDto.twoFactorAuth !== undefined
    ) {
      matches.twoFactorAuth =
        listUsersDto.twoFactorAuth === true ? true : false;
    }

    if (
      listUsersDto.isProfileUpdated !== null &&
      listUsersDto.isProfileUpdated !== undefined
    ) {
      matches.isProfileUpdated =
        listUsersDto.isProfileUpdated === true ? true : false;
    }

    if (
      listUsersDto.isEmailVerified !== null &&
      listUsersDto.isEmailVerified !== undefined
    ) {
      matches.isEmailVerified =
        listUsersDto.isEmailVerified === true ? true : false;
    }

    if (listUsersDto.name) {
      matches.first_name = new RegExp(
        "^" + listUsersDto.name.split(" ")[0],
        "i"
      );
      //matches.last_name = searchUsersDto.name.split(' ')[1];
    }

    if (listUsersDto.email) {
      matches.email = new RegExp("^" + listUsersDto.email, "i");
    }

    if (listUsersDto.username) {
      matches.username = new RegExp("^" + listUsersDto.username, "i");
    }

    if (listUsersDto.mobile) {
      matches.mobile = new RegExp("^" + listUsersDto.mobile, "i");
    }

    // sorting
    const sort: any = {};

    if (listUsersDto.sortBy) {
      sort[listUsersDto.sortBy] = listUsersDto.sortOrder || -1;
    } else {
      sort["createdAt"] = -1;
    }

    const limit = parseInt(listUsersDto.limit || 10);
    let offset = parseInt(listUsersDto.offset || 10) - limit;
    if (offset < 0) {
      offset = 0;
    }

    try {
      // fetching totalusers
      var totalUsers = await this.userModel.count(matches);
      var users = await this.userModel
        .find(matches)
        .sort(sort)
        .skip(offset)
        .limit(limit);
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(e, HttpStatus.NOT_FOUND, null);
    }

    // check if user exists
    if (users.length === 0) {
      await this.responseHandlerService.response(
        "no users found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    users = await Promise.all(
      users.map(async (user) => {
        return await this.helperService.serializeUser(user);
      })
    );
    return { totalUsers, users: users };
  }

  //Default Admin
  async createAdmin() {
    try {
      // fetching superadmin user
      const email = process.env.ADMIN_EMAIL;
      const username = process.env.ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD;
      const first_name = process.env.ADMIN_FIRST_NAME;
      const last_name = process.env.ADMIN_LAST_NAME;
      const userResponse = await this.findOneByEmail(email);

      // if it doesn't exist, assigning a new superadmin and saving it to the db
      if (userResponse === null) {
        const user = await this.userModel.create({
          email: email,
          first_name,
          last_name,
          password: password,
          isEmailVerified: true,
          username: username,
          role: Role.Superadmin,
        });
        await user.save();
      } else {
      }
    } catch (error) {}
  }

  // function to create Kyc
  async kycCreateApplicant(kycApplicantDto) {
    const userId = kycApplicantDto.userId;
    const user = await this.findOneById(userId);
    // check if kyc exists and created a new one if not
    if (!user.kyc_applicant_id) {
      const applicant = await this.onfido.applicant.create({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // dob: kycApplicantDto.dob,
        // address: {
        //   town: user.town,
        //   country: user.country,
        //   postcode: user.postcode,
        //   street: user.street,
        // }
      });
      user.kyc_applicant_id = applicant.id;
      await user.save();
      return {
        user,
        message: "kyc applicant created",
      };
    } else {
      await this.responseHandlerService.response(
        "kyc account already exists",
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }
  }

  // function to fetch kyc by id and update
  async findByKycIdAndUpdate({
    kyc_applicant_id,
    kyc_status,
    incrementKycCounter,
  }) {
    let user = await this.userModel.findOne({ kyc_applicant_id });
    user.kyc_status = kyc_status;
    if (incrementKycCounter) {
      user.kyc_counter = user.kyc_counter + 1;
    }
    user = await user.save();
    return {
      message: "kyc status updated",
    };
  }

  // health function
  async healthCheck(healthCheckDto) {
    return {
      message: "User service up and running!",
    };
  }

  // function to update balance
  async balanceUpdate(balanceUpdateDto) {
    try {
      // fetching user via userid
      const user = await this.findOneById(balanceUpdateDto.userId);
      // check is user exists
      if (!user) {
        await this.responseHandlerService.response(
          "user not found",
          HttpStatus.NOT_FOUND,
          null
        );
      }
      // fetching balance for the user and pushing newbalance if there is no balance and saving it to the db
      const newBalance: Balance = {
        assetCode: balanceUpdateDto.assetCode,
        amount: balanceUpdateDto.amount,
        withheldAmount: balanceUpdateDto.withheldAmount,
      };
      if (user.balance === null) {
        user.balance.push(newBalance);
      } else {
        const found = user.balance.find(
          (element) => element.assetCode === balanceUpdateDto.assetCode
        );
        if (!found) {
          user.balance.push(newBalance);
        } else {
          found.amount = balanceUpdateDto.amount
            ? balanceUpdateDto.amount
            : found.amount;
          found.withheldAmount = balanceUpdateDto.withheldAmount
            ? balanceUpdateDto.withheldAmount
            : found.withheldAmount;
        }
      }
      await user.save();

      return { message: `Balance updated successfully` };
    } catch (error) {
      await this.sentryService.captureException(error);
      await this.responseHandlerService.response(
        error,
        HttpStatus.BAD_REQUEST,
        null
      );
    }
  }

  // function to fetch balance
  async getBalance(getBalanceDto) {
    const user = await this.findOneById(getBalanceDto.userId);
    // check to verify if user has balance and if not then assigning newbalance and savind it to the db
    if (!user.balance || user.balance.length === 0) {
      const newBalance: Balance = {
        assetCode: "VPC",
        amount: 0,
        withheldAmount: 0,
      };
      user.balance.push(newBalance);
      await user.save();
    }
    return { balance: user.balance };
  }

  // function to filter user
  async getUsersByFilters(getUsersDto) {
    const matches: any = {};
    const orQuery = [];
    if (getUsersDto.userIds != null && getUsersDto.userIds.length !== 0) {
      orQuery.push({
        _id: {
          $in: getUsersDto.userIds,
        },
      });
    }

    if (getUsersDto.names != null && getUsersDto.names.length !== 0) {
      orQuery.push({
        first_name: {
          $in: getUsersDto.names,
        },
      });
    }

    if (orQuery.length !== 0) {
      matches["$or"] = orQuery;
    }

    if (
      getUsersDto.canCreateCollection !== null &&
      getUsersDto.canCreateCollection !== undefined
    ) {
      matches.canCreateCollection =
        getUsersDto.canCreateCollection === true ? true : false;
    }

    if (getUsersDto.isBlocked !== null && getUsersDto.isBlocked !== undefined) {
      matches.isBlocked = getUsersDto.isBlocked === true ? true : false;
    }

    if (getUsersDto.role !== null && getUsersDto.role !== undefined) {
      matches.role = getUsersDto.role;
    }

    if (
      getUsersDto.twoFactorAuth !== null &&
      getUsersDto.twoFactorAuth !== undefined
    ) {
      matches.twoFactorAuth = getUsersDto.twoFactorAuth === true ? true : false;
    }

    const sort: any = {};

    if (getUsersDto.sortBy) {
      sort[getUsersDto.sortBy] = getUsersDto.sortOrder || -1;
    } else {
      sort["createdAt"] = -1;
    }

    const limit = parseInt(getUsersDto.limit || 10);
    let offset = parseInt(getUsersDto.offset || 10) - limit;
    if (offset < 0) {
      offset = 0;
    }
    try {
      // fetching users and applying pagination
      var totalUsers = await this.userModel.count(matches);
      var users = await this.userModel
        .find(matches, { password: false })
        .sort(sort)
        .skip(offset)
        .limit(limit);
    } catch (e) {
      await this.sentryService.captureException(e);
      await this.responseHandlerService.response(e, HttpStatus.NOT_FOUND, null);
    }

    // check if user exists
    if (users.length === 0) {
      await this.responseHandlerService.response(
        "no users found",
        HttpStatus.NOT_FOUND,
        null
      );
    }

    users = await Promise.all(
      users.map(async (user) => {
        return await this.helperService.serializeUser(user);
      })
    );

    return { totalUsers, users: users };
  }

  // function to get user by id
  async getUserById(getUserByIdDto) {
    let getUser = null;
    try {
      // fetching user via userid
      getUser = await this.userModel.findOne({
        _id: getUserByIdDto.id,
      });
    } catch (err) {
      await this.sentryService.captureException(err);
      await this.responseHandlerService.response(
        "user not found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    // check if user exists
    if (!getUser) {
      await this.responseHandlerService.response(
        "user not found",
        HttpStatus.NOT_FOUND,
        null
      );
    }
    return (getUser = await this.helperService.serializeUser(getUser));
  }

  // function to update withheld balance
  async updateWithheldBalance(updateWithheldBalanceDto) {
    const { balance } = await this.getBalance({
      userId: updateWithheldBalanceDto.userId,
    });
    const balanceObj = balance.find(
      (el) => el.assetCode === updateWithheldBalanceDto.assetCode
    );

    let amount: any =
      Number(balanceObj.amount ? balanceObj.amount : 0) -
      Number(updateWithheldBalanceDto.withheldAmount);

    let withheldAmount: any =
      Number(balanceObj.withheldAmount ? balanceObj.withheldAmount : 0) +
      Number(updateWithheldBalanceDto.withheldAmount);
    // check if the user has enough balance
    if (amount < 0) {
      await this.responseHandlerService.response(
        "not enough amount in your wallet",
        HttpStatus.NOT_ACCEPTABLE,
        null
      );
    }
    amount = amount.toFixed(2);
    withheldAmount = withheldAmount.toFixed(2);

    const updateBalance = await this.balanceUpdate({
      userId: updateWithheldBalanceDto.userId,
      assetCode: updateWithheldBalanceDto.assetCode,
      amount,
      withheldAmount,
    });
    return { message: "withheld Balance updated successfully" };
  }
}
