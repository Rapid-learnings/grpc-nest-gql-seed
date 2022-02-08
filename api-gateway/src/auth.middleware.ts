import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  OnModuleInit,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { google, Auth } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// import { ClientGrpc, Client } from '@nestjs/microservices';
import { UserServiceClientOptions } from './user/user-svc.options';
import { User2Service } from 'src/user/userHelper.service';
import { ResponseHandlerService } from './helper/response-handler.service';
import * as appleSignin from 'apple-signin-auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  oauthClient: Auth.OAuth2Client;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly user2Service: User2Service,
    private responseHandlerService: ResponseHandlerService,
  ) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SECRET;
    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async use(req, res, next: () => void) {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
      this.logger.log(
        'error',
        `APT-GATEWAY - auth-middleware - No token found`,
      );
      await this.responseHandlerService.response(
        { error: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);
      const email = tokenInfo.email;
      const user = await this.user2Service.findOneByEmailOrUsername(email);
      if (user) {
        this.logger.log(
          'info',
          `APT-GATEWAY - auth-middleware - User ${user} logged in with Google`,
        );
        req.user = user;
        next();
        return;
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
        this.logger.log(
          'info',
          `APT-GATEWAY - auth-middleware - User ${JSON.stringify(
            user,
          )} logged in with Apple`,
        );
        req.user = user;
        next();
        return;
      }
    } catch (e) {}

    await jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err, tokenInfo) => {
        if (err) {
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
            this.logger.log(
              'info',
              `APT-GATEWAY - auth-middleware - User ${user} logged in with JWT`,
            );
            req.user = user;
            next();
            return;
          }
        }
      },
    );
    if (!req.user) {
      this.logger.log(
        'info',
        `APT-GATEWAY - auth-middleware - User not logged in with anything`,
      );
      await this.responseHandlerService.response(
        { error: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
        null,
      );
    }
  }
}
