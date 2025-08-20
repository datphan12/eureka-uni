import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { VaiTro } from '../../../common/constants/role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { vaiTro, isPublic } = this.reflector.getAllAndOverride<{
      vaiTro: VaiTro[];
      isPublic: boolean;
    }>('AUTH_OPTIONS', [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('Unauthorized: No valid token provided');
    }

    if (vaiTro?.length && !vaiTro.includes(user.vaiTro)) {
      throw new UnauthorizedException('Unauthorized: Invalid role');
    }

    return true;
  }
}
