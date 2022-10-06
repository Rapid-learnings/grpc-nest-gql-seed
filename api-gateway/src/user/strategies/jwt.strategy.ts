import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { UserServiceClientOptions } from '../user-svc.options';
import { UserResolver } from '../user.resolver';
import { ResponseHandlerService } from '../../helper/response-handler.service';

/**
 * strategy for JWT authentication to be used by passport module
 * @category User
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userResolver: UserResolver,
    private responseHandlerService: ResponseHandlerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  /**
   *  it validates if the user is found for the given payload.
   * @param payload JWT payload.
   * @returns user object containg user information.
   * @throws UnauthorizedException - "Unauthorized" - in case no user is found for the given payload,
   */
  async validate(payload: JwtPayload) {
    const user = await this.user.validateUserByJwt(payload);
    if (!user) {
      await this.responseHandlerService.response(
        { error: 'Unauthorized' },
        401,
        null,
      );
    }

    return user;
  }
}
