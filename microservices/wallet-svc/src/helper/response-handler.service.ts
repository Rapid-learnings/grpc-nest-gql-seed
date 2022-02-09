import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from 'grpc';
const GrpcStatus = grpc.status;
@Injectable()
export class ResponseHandlerService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  async response(error: any, statusCode, GrpcStatusCode, data) {
    const response = {};
    if (error) {
      Object.assign(response, {
        code: GrpcStatusCode,
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
