import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import * as grpc from "grpc";
const GrpcStatus = grpc.status;

/**
 * This service contain contains business logic for RPC error handling and response handling.
 * @category Helper
 */
@Injectable()
export class ResponseHandlerService {
  constructor() {}

  /**
   * it formats errors/results into a standard RPC format
   * @param error error object or error message
   * @param statusCode Http response status code
   * @param data response data
   * @returns formatter response data
   */
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
