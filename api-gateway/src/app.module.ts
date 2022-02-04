import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { LoggerMiddleware } from './logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { GoogleStrategy } from './user/socialsignin/google.strategy';
import { UploadModule } from './upload/upload.module';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { AdminModule } from './admin/admin.module';
import { WalletModule } from './wallet/wallet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { LogLevel } from '@sentry/types';
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      //uploads: false,
      installSubscriptionHandlers: true,
      context: async ({ req }) => ({ req }),
      debug: false,
      formatError: (error: GraphQLError) => {
        console.log(JSON.stringify(error));
        //const variableType = error.extensions.exception.details ? error.extensions.exception.details : error.extensions.exception.message
        const graphQLFormattedError = {
          message:
            error.extensions.response.message ||
            error.extensions.response.error,
          statusCode: error.extensions.response.statusCode,
          success: false,
        };
        return graphQLFormattedError;
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    WinstonModule.forRoot({
      levels: winston.config.npm.levels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.splat(),
        winston.format.colorize(),
      ),
      transports: [
        new winston.transports.File({
          filename: `logs/application-errors-${new Date().getDate()}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `logs/${new Date().getDate()}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}.log`,
        }),
      ],
    }),
    UserModule,
    AdminModule,
    UploadModule,
    TerminusModule,
    WalletModule,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true, //|| false,
      environment: 'dev', //| 'production' | 'some_environment',
      logLevel: LogLevel.Debug, //based on sentry.io loglevel //
    }),
  ],
  providers: [GoogleStrategy],
  controllers: [AppController, HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('graphql');
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
