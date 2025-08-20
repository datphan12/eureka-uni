import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY || 'sknfjwsfsbfkswbcwabfwefw',
    });
  }

  async validate(payload: { sub: string; email: string; vaiTro: string }) {
    return { sub: payload.sub, email: payload.email, vaiTro: payload.vaiTro };
  }
}
