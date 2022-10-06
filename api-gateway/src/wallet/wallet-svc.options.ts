import { join } from 'path';
import { ClientOptions, Transport } from '@nestjs/microservices';

/**
 * configuration options for gRPC client for wallet microservice.
 * @category Wallet
 */
export const WalletServiceClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${process.env.WALLET_SVC_URL}:${process.env.WALLET_SVC_PORT}`,
    package: 'wallets',
    protoPath: join(__dirname, '../_proto/wallet.proto'),
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
