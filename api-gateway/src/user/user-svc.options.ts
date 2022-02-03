import { join } from 'path';
import { ClientOptions, Transport } from '@nestjs/microservices';

export const UserServiceClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${process.env.USER_SVC_URL}:${process.env.USER_SVC_PORT}`, // localhost:6000
    package: 'users',
    protoPath: join(__dirname, '../_proto/user.proto'), // path to protofile for user
    loader: {
      enums: String,
      objects: true,
      arrays: true,
      keepCase: true,
    },
    maxReceiveMessageLength:
      Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
    maxSendMessageLength:
      Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
  },
};
