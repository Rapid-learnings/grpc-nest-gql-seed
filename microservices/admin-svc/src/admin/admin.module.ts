import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { HelperModule } from 'src/helper/helper.module';
import { HttpModule } from '@nestjs/common';

/**
 * It is a feature module where we keep the controller, service and other code related to user functionalities and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule.
 * Other modules are - MongooseModule: here we setup the User collection and it's schema.
 *                     HttpModule: it enables us to make Http Request.
 * @category Admin
 */
@Module({
  imports: [
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
