import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserSchema } from "./user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "./user.service";
import { JwtModule } from "@nestjs/jwt";
import { HelperModule } from "src/helper/helper.module";

/**
 * It is a feature module where we keep the controller, service and other code related to user functionalities and  we import other modules and configure modules and packages that are being used in this module.
 *
 * Here, feature modules imported are - HelperModule.
 * Other modules are - MongooseModule: here we setup the User collection and it's schema.
 *                     JwtModule: here we setup the JWT token strategy for authentication.
 * @category User
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    HelperModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET_KEY || "secret",
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
