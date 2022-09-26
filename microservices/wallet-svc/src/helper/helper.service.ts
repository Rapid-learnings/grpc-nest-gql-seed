/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, HttpStatus, Req, Res } from '@nestjs/common';
import { ResponseHandlerService } from './response-handler.service';
import * as grpc from 'grpc';
const GrpcStatus = grpc.status;

/**
 * This service contain contains all methods and business logic of helper functionalities for other modules.
 * @category Helper
 */
@Injectable()
export class HelperService {
  /**
   * @param responseHandlerService
   */
  constructor(private responseHandlerService: ResponseHandlerService) {}

  /**
   * it checks whether a username is valid.
   * @param attempt username to be checked.
   * @returns true if username is valid otherwise false.
   */
  async isValidUsername(attempt) {
    const usernamePattern = /^[a-z0-9_\.]+$/;
    return usernamePattern.test(attempt);
  }

  /**
   * it returns serialized or unwanted user object removing sensitive information like password, otp, balance.
   * @param user unserialized user object.
   * @returns serialized user object.
   */
  async serializeUser(user) {
    try {
      user = JSON.parse(JSON.stringify(user));
      if (user.password || user.password === null) {
        delete user.password;
      }
      if (user.otp || user.otp === null) {
        delete user.otp;
      }
      return user;
    } catch (e) {
      await this.responseHandlerService.response(
        e,
        HttpStatus.INTERNAL_SERVER_ERROR,
        GrpcStatus.INTERNAL,
        null,
      );
    }
  }

  /**
   * it generates 6 digit OTP for given task.
   * @param forTask the task for which OTP is required.
   * @returns generated OTP and expiration time.
   */
  async generateOtp(forTask) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    const expiresOn = d;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Always 6 digit numeric string
    return { otp, expiresOn, forTask };
  }

  /**
   * it verifies whether the OTP is valid.
   * @param attemptOtp the OTP to be tested.
   * @param userOtp the OTP stored in user object.
   * @returns message and success response.
   */
  async checkOtp(attemptOtp, userOtp) {
    const resObj = {
      message: 'otp verified',
      success: true,
    };

    const isExpired = await this.isOtpExpired(userOtp);
    if (isExpired) {
      (resObj.message = 'otp has expired'), (resObj.success = false);
    }

    const isMatch = userOtp.otp === attemptOtp;
    if (!isMatch) {
      (resObj.message = 'incorrect otp'), (resObj.success = false);
    }

    return resObj;
  }

  /**
   * it verifies whether the OTP is expired or not.
   * @param otp the OTP to be tested.
   * @returns true if OTP is expired.
   */
  async isOtpExpired(otp) {
    const currentDate = new Date();
    return !(currentDate <= otp.expiresOn);
  }
}
