import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(__dirname, '../.env') });
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: `${process.env.WALLET_SVC_URL}:${process.env.WALLET_SVC_PORT}`,
      package: 'wallets',
      protoPath: join(__dirname, './_proto/wallet.proto'),
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
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listenAsync();
}

bootstrap();
