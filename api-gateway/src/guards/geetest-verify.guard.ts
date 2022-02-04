import {
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Injectable,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { GeetestService } from 'nestjs-geetest';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GeetestGuard implements CanActivate {
  constructor(private geetestService: GeetestService) {}
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req: request } = ctx.getContext();
    console.log(request.body);

    const geetestChallenge = request.body['geetest_challenge'];
    const geetestValidate = request.body['geetest_validate'];
    const geetestSeccode = request.body['geetest_seccode'];
    if (!geetestChallenge || !geetestValidate || !geetestSeccode) return false;
    const result = await this.geetestService.validate(
      geetestChallenge,
      geetestValidate,
      geetestSeccode,
    );
    return !!result.status;
  }
}

export function GeetestVerifyGuard() {
  return applyDecorators(UseGuards(GeetestGuard));
}
