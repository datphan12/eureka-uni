import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-facebook';
import { VerifiedCallback } from 'passport-jwt';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ['id', 'displayName', 'photos', 'emails'],
      scope: ['email'],
    } as StrategyOptions);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifiedCallback,
  ) {
    const { id, displayName, emails, photos } = profile;

    const user = {
      facebookId: id,
      email: emails?.[0]?.value,
      hoTen: displayName,
      hinhAnh: photos?.[0]?.value,
    };

    done(null, user);
  }
}
