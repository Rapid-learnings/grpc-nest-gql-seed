/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, HttpStatus, Req, Res } from '@nestjs/common';

import { ResponseHandlerService } from './response-handler.service';

@Injectable()
export class HelperService {
  constructor(private responseHandlerService: ResponseHandlerService) {}

  async isValidUsername(attempt) {
    const usernamePattern = /^[a-z0-9_\.]+$/;
    return usernamePattern.test(attempt);
  }

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
      await this.responseHandlerService.response(e, 500, null);
    }
  }

  async generateOtp(forTask) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    const expiresOn = d;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Always 6 digit numeric string
    return { otp, expiresOn, forTask };
  }

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
  async isOtpExpired(otp) {
    const currentDate = new Date();
    return !(currentDate <= otp.expiresOn);
  }
}
