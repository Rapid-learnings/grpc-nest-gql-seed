import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HelperModule } from './helper/helper.module';
import { AdminModule } from './admin/admin.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { LogLevel } from '@sentry/types';

/**
 * It is the root module for the application in we import all feature modules and configure modules and packages that are common in feature modules. Here we also configure the middlewares.
 *
 * Here, feature modules imported are - AdminModule and HelperModule.
 * other modules are :
 *      ConfigModule - enables us to access environment variables application wide.
 *      WinstonModule - It is used for maintaining logs in files.
 *      SentryModule - It is used for maintaining error logs on sentry servers.
 * @category Core
 */
@Module({
  imports: [
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
    HelperModule,
    AdminModule,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true, //|| false,
      environment: 'dev', //| 'production' | 'some_environment',
      logLevel: LogLevel.Debug, //based on sentry.io loglevel //
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('admin');
  }
}
