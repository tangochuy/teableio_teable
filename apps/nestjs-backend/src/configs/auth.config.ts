/* eslint-disable @typescript-eslint/naming-convention */
import { Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwt: {
    secret:
      process.env.BACKEND_JWT_SECRET ?? process.env.SECRET_KEY ?? '533Cr3tK3yF0rH4sh1nGJ4W773k3n$',
    expiresIn: process.env.BACKEND_JWT_EXPIRES_IN ?? '20d',
  },
  session: {
    secret:
      process.env.BACKEND_SESSION_SECRET ??
      process.env.SECRET_KEY ??
      'dafea6be69af1c1c3b8caf2b609342f6eb4540b554e19539f7643b75b480c932',
    expiresIn: process.env.BACKEND_SESSION_EXPIRES_IN ?? '7d',
  },
  accessToken: {
    prefix: process.env.BRAND_NAME!.toLocaleLowerCase(),
    encryption: {
      algorithm: process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_ALGORITHM ?? 'aes-128-cbc',
      key: process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY ?? 'ie21hOKjlXUiGDx9',
      iv: process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_IV ?? 'i0vKGXBWkzyAoGf4',
    },
  },
  resetPasswordEmailExpiresIn: process.env.BACKEND_RESET_PASSWORD_EMAIL_EXPIRES_IN ?? '30m',
  socialAuthProviders: process.env.SOCIAL_AUTH_PROVIDERS?.split(',') ?? [],
  github: {
    clientID: process.env.BACKEND_GITHUB_CLIENT_ID,
    clientSecret: process.env.BACKEND_GITHUB_CLIENT_SECRET,
  },
  google: {
    clientID: process.env.BACKEND_GOOGLE_CLIENT_ID,
    clientSecret: process.env.BACKEND_GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_GOOGLE_CALLBACK_URL,
  },
  oidc: {
    issuer: process.env.BACKEND_OIDC_ISSUER,
    authorizationURL: process.env.BACKEND_OIDC_AUTHORIZATION_URL,
    tokenURL: process.env.BACKEND_OIDC_TOKEN_URL,
    userInfoURL: process.env.BACKEND_OIDC_USER_INFO_URL,
    clientID: process.env.BACKEND_OIDC_CLIENT_ID,
    clientSecret: process.env.BACKEND_OIDC_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_OIDC_CALLBACK_URL,
    other: process.env.BACKEND_OIDC_OTHER ? JSON.parse(process.env.BACKEND_OIDC_OTHER) : {},
  },
}));

export const AuthConfig = () => Inject(authConfig.KEY);

export type IAuthConfig = ConfigType<typeof authConfig>;
