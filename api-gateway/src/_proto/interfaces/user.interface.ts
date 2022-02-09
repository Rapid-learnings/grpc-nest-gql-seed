export interface UserServiceInterface {
  create(createUserDto);
  twoFactorOtp(JwtPayload);
  twoFactorVerify(TwoFactorOtpDto);
  findOneByEmailOrUsername(EmailOrUsername);
  findOneByAppleId(AppleId);
  validateUserByJwt(JwtPayload);
  validateUserByPassword(LoginUserDto);
  googleLogin(GoogleUser);
  sendEmailOtp(SendEmailOtp);
  verifyEmailOtp(OtpDto);
  forgotPasswordOtp(JwtPayload);
  forgotPasswordVerify(ForgotPasswordDto);
  resetPassword(ResetPasswordDto);
  updateProfile(UpdateProfileDto);
  checkEmail(CheckEmailDto);
  uploadProfilePicture(ProfilePicDto);
  checkUsername(CheckUsernameDto);
  appleLogin(AppleLoginDto);
  findOneById(UserId);
  listUsers(ListUsersDto);
  kycCreateApplicant(KycApplicantDto);
  findByKycIdAndUpdate(FindByKycIdAndUpdateDto);
  healthCheck(MessageDef);
  getBalance(GetBalanceDto);
  balanceUpdate(UpdateBalanceDto);
  getUsersByFilters(GetUsersDto);
  getUserById(GetUserByIdDto);
  updateWithheldBalance(UpdateBalanceDto);
}