import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
  applyDecorators,
  UseGuards,
  Logger,
  Inject,
  createParamDecorator,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { google, Auth as Auth2 } from 'googleapis';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as appleSignin from 'apple-signin-auth';
import { User2Service } from 'src/user/userHelper.service';
import { ResponseHandlerService } from 'src/helper/response-handler.service';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

@Injectable()
export class RestAuthGuard implements CanActivate {
  oauthClient: Auth2.OAuth2Client;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly user2Service: User2Service,
    private responseHandlerService: ResponseHandlerService,
    private reflector: Reflector,
  ) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SECRET;
    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (req.headers && req.headers.authorization) {
      req.user = await this.validateToken(req.headers.authorization);

      if (req.user.isBlocked === true) return false;
      if (!requiredRoles) {
        return true;
      } else {
        return requiredRoles.includes(req.user.role);
      }
    }
    return false;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      await this.responseHandlerService.response(
        { error: 'jwt bearer missing' },
        HttpStatus.FORBIDDEN,
        null,
      );
    }

    const token = auth.split(' ')[1];
    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);
      const email = tokenInfo.email;
      const user = await this.user2Service.findOneByEmailOrUsername(email);
      if (user) {
        return user;
      }
    } catch (e) {}

    // Apple auth
    try {
      const data = await appleSignin.verifyIdToken(
        token,
        process.env.APPLE_CLIENT_ID,
      );
      const appleId = data.sub;
      const user = await this.user2Service.findOneByAppleId(appleId);
      if (user) {
        return user;
      }
    } catch (e) {}
    let reqUser = null;
    await jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err, tokenInfo) => {
        if (err) {
          await this.responseHandlerService.response(
            { error: err.message },
            HttpStatus.UNAUTHORIZED,
            null,
          );
        } else {
          let user = null;
          try {
            user = await this.user2Service.findOneByEmailOrUsername(
              tokenInfo.email,
            );
          } catch (e) {
            user = null;
          }

          if (user) {
            reqUser = user;
            return reqUser;
          }
        }
      },
    );

    if (reqUser) {
      return reqUser;
    } else {
      await this.responseHandlerService.response(
        { error: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
  }
}

export function Auth(...roles: Role[]) {
  SetMetadata(ROLES_KEY, roles);
  return applyDecorators(UseGuards(RestAuthGuard));
}

export const GetUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);

export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
