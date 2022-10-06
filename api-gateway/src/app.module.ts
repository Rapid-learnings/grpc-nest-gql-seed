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

/**
 * It is the root module for the application in we import all feature modules and configure modules and packages that are common in feature modules. Here we also configure the middlewares.
 *
 * Here, feature modules imported are - UserModule, AdminModule, UploadModule, WalletModule.
 * other modules are :
 *      ConfigModule - enables us to access environment variables application wide.
 *      TerminusModule - enables us perform health checks in our nest application.
 *      MongooseModule - it is an ORM which enables easy access to mongoDB.
 *      GraphQLModule - it setups the graphQL server to enable us to create graphql APIs. It also converts decorators and metadatas that we use for graphQl APIs, to generate the graphQL schema.
 *      WinstonModule - It is used for maintaining logs in files.
 *      SentryModule - It is used for maintaining error logs on sentry servers.
 * @category Core
 */
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
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true, //|| false,
      environment: 'dev', //| 'production' | 'some_environment',
      logLevel: LogLevel.Debug, //based on sentry.io loglevel //
    }),
    TerminusModule,
    UserModule,
    AdminModule,
    UploadModule,
    WalletModule,
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
