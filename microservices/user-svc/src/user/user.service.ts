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
import { User, Balance, GalleryCollection } from "./user.interface";
import { LoginUserDto } from "./dto/user.dto";
import { HelperService } from "src/helper/helper.service";
import { ResponseHandlerService } from "src/helper/response-handler.service";
import { JwtService } from "@nestjs/jwt";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Role } from "../guards/role.enum";
import { AdminServiceClientOptions } from "./svc.options";
import { ClientGrpc, Client } from "@nestjs/microservices";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";

@Injectable()
export class UserService {
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
  }

  // declaring client variables for gRPC client
  @Client(AdminServiceClientOptions)
  private readonly adminServiceClient: ClientGrpc;

  private adminService: any;
  onModuleInit() {
    // Injecting the gRPC clients in this service
    this.adminService = this.adminServiceClient.getService<any>("AdminService");
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
          username: username,
          role: Role.Superadmin,
        });
        await user.save();
      } else {
      }
    } catch (error) {}
  }
  // Find user by email
  async findOneByEmail(email) {
    return await this.userModel.findOne({ email: email });
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

  async findOneByEmailOrUsername(attempt) {
    if (await this.helperService.isValidUsername(attempt)) {
      return await this.userModel.findOne({ username: attempt });
    } else {
      return await this.findOneByEmail(attempt.toLowerCase());
    }
  }

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
      // authentication user
      const user = await this.helperService.serializeUser(userToAttempt);
      result.user = user;
      result.message = "Authenticated";
      const token = await this.createJwtpayload(userToAttempt);
      result.token = token.token;
      result.expiresIn = token.expiresIn;
      return result;
    } else {
      await this.responseHandlerService.response(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        null
      );
    }
  }
  async listUsers(listUsersDto) {
    const matches: any = {};

    // users prifile related filters
    if (listUsersDto.userId) {
      matches._id = listUsersDto.userId;
    }

    if (listUsersDto.status) {
      matches.status = listUsersDto.status;
    }

    if (listUsersDto.role !== null && listUsersDto.role !== undefined) {
      matches.role = listUsersDto.role;
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

    if (user.role === Role.Superadmin) {
      user.twoFactorAuth = true;
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

  // health function
  async healthCheck(healthCheckDto) {
    return {
      message: "Hello!",
    };
  }
}
