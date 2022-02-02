/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, HttpStatus, Req, Res } from '@nestjs/common';
import { ResponseHandlerService } from './response-handler.service';
import * as sgMail from '@sendgrid/mail';
@Injectable()
export class HelperService {
  constructor(private responseHandlerService: ResponseHandlerService) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  async isValidUsername(attempt) {
    const usernamePattern = /^[a-z0-9_\.]+$/;
    return usernamePattern.test(attempt);
  }
  async sendEmail(to, subject, text, html) {
    try {
      const res = await sgMail.send({
        to: to,
        from: 'nayanshrivastava800@gmail.com',
        subject,
        html,
        // attachments: [
        //     {
        //         filename: `invoice`,
        //         content: invoicePDF,
        //         type: 'application/pdf',
        //         disposition: 'attachment'
        //     }
        // ]
      });
      console.log(res);
    } catch (e) {
      console.log(e.response.body);
    }
  }
  async serializeUser(user) {
    try {
      user = JSON.parse(JSON.stringify(user));
      if (user.password || user.password !== null) {
        delete user.password;
      }
      if (user.otp || user.otp !== null) {
        delete user.otp;
      }

      if (user.balance || user.balance !== null) {
        delete user.balance;
      }

      if (user.galleryCollections || user.galleryCollections !== null) {
        delete user.galleryCollections;
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
