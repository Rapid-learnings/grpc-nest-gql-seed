import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformConstantSchema } from './admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { HelperModule } from 'src/helper/helper.module';
import { HttpModule } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PlatformConstant', schema: PlatformConstantSchema },
    ]),
    HelperModule,
    HttpModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET_KEY || 'secret',
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
