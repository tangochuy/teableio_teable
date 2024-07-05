import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ENSURE_LOGIN } from '../decorators/ensure-login.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ACCESS_TOKEN_STRATEGY_NAME } from '../strategies/constant';
@Injectable()
export class AuthGuard extends PassportAuthGuard(['session', ACCESS_TOKEN_STRATEGY_NAME]) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async validate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean>;
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      return await this.validate(context);
    } catch (error) {
      const ensureLogin = this.reflector.getAllAndOverride<boolean>(ENSURE_LOGIN, [
        context.getHandler(),
        context.getClass(),
      ]);
      const res = context.switchToHttp().getResponse();
      const req = context.switchToHttp().getRequest();
      if (ensureLogin) {
        return res.redirect(`/auth/login?redirect=${encodeURIComponent(req.url)}`);
      }
      throw error;
    }
  }
}
