import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile } from 'passport-github2';
import { Strategy } from 'passport-github2';
import { AuthConfig } from '../../../configs/auth.config';
import type { authConfig } from '../../../configs/auth.config';
import { UserService } from '../../user/user.service';
import { OauthStoreService } from '../oauth/oauth.store';
import { pickUserMe } from '../utils';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @AuthConfig() readonly config: ConfigType<typeof authConfig>,
    private usersService: UserService,
    oauthStoreService: OauthStoreService
  ) {
    const { clientID, clientSecret } = config.github;
    super({
      clientID,
      clientSecret,
      state: true,
      store: oauthStoreService,
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0].value;
    if (!email) {
      throw new UnauthorizedException('No email provided from GitHub');
    }
    const user = await this.usersService.findOrCreateUser({
      name: displayName,
      email,
      provider: 'github',
      providerId: id,
      type: 'oauth',
      avatarUrl: photos?.[0].value,
    });
    if (!user) {
      throw new UnauthorizedException('Failed to create user from GitHub profile');
    }
    return pickUserMe(user);
  }
}
