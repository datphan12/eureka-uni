import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { VaiTro } from '../../../common/constants/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface Options {
  vaiTro?: VaiTro[];
  isPublic?: boolean;
}

export const Auth = (options?: Options) => {
  const { vaiTro, isPublic } = options || {};
  return applyDecorators(
    SetMetadata('AUTH_OPTIONS', { vaiTro, isPublic }),
    UseGuards(JwtAuthGuard),
  );
};
