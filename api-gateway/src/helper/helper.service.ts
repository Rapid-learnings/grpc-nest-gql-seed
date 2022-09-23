import { Injectable, HttpException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_KEY_SECRET,
});

/**
 * This service contain contains all methods and business logic of helper functionalities for other modules.
 * @category Helper
 */
@Injectable()
export class HelperService {
  /**
   * it returns serialized or unwanted user object removing sensitive information like password, otp, balance.
   * @param user unserialized user object.
   * @returns serialized user object.
   */
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
      throw new HttpException('internal server error', 500);
    }
  }

  /**
   * it uploads any given file to aws s3 and returns the s3 URL to that file. It figures out the name, extension and folder for the file to be placed.
   * @param file file object to be uploaded.
   * @param folder folder name to place the file in s3 bucket.
   * @returns serialized user object.
   */
  async uploadFile(file, folder) {
    const extension = file.originalname.split('.').reverse()[0];

    const filename =
      `${folder}/` +
      uuid().toString() +
      Date.now().toString() +
      '.' +
      extension;

    return await this.s3_upload(
      file.buffer,
      AWS_S3_BUCKET,
      filename,
      file.mimetype,
    );
  }

  /**
   * it uploads any given file to aws s3 and returns the s3 URL to that file.
   * @param file file object to be uploaded.
   * @param bucket s3 bucket name.
   * @param name  name of the file.
   * @param mimetype  mimetype of the file.
   * @returns the response from s3.upload function.
   */
  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: name, // File name you want to save as in S3
      Body: file,
      ContentType: mimetype,
    };

    try {
      const s3Response = await s3.upload(params).promise();

      return s3Response;
    } catch (e) {
      return e;
    }
  }
}
