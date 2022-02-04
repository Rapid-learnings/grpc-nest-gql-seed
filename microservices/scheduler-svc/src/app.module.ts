import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'SCHEDULER',
    //     transport: Transport.REDIS,
    //     options: {
    //       url: process.env.REDIS_URL,
    //     },
    //   },
    // ]),
    SchedulerModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
