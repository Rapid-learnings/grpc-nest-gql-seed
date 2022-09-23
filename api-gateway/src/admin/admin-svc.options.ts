import { join } from 'path';
import { ClientOptions, Transport } from '@nestjs/microservices';

/**
 * configuration options for gRPC client for admin microservice.
 * @category Admin
 */
export const AdminServiceClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${process.env.ADMIN_SERVER_URL}:${process.env.ADMIN_MSC_PORT}`,
    package: 'admins',
    protoPath: join(__dirname, '../_proto/admin.proto'),
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
