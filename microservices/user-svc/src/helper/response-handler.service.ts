import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from 'grpc';
const GrpcStatus = grpc.status;
@Injectable()
export class ResponseHandlerService {
  constructor() {}
  async response(error: any, statusCode, data) {
    const response = {};
    if (error) {
      Object.assign(response, {
        code: GrpcStatus.NOT_FOUND,
        message: JSON.stringify({
          error: error.toString(),
          statusCode: statusCode,
          stack: error.stack,
        }),
      });
      throw new RpcException(response);
    }

    return data;
  }
}
