import { GithubLogo } from '@teable/icons';
import { Button, Separator } from '@teable/ui-lib/shadcn';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useEnv } from '@/features/app/hooks/useEnv';

const providersAll = [
  {
    id: 'github',
    text: 'Github',
    Icon: GithubLogo,
    authUrl: '/api/auth/github',
  },
];

export const SocialAuth = () => {
  const { socialAuthProviders } = useEnv();
  const router = useRouter();
  const redirect = router.query.redirect as string;

  const providers = useMemo(
    () => providersAll.filter((provider) => socialAuthProviders?.includes(provider.id)),
    [socialAuthProviders]
  );

  const onClick = (authUrl: string) => {
    window.location.href = redirect
      ? `${authUrl}?redirect_uri=${encodeURIComponent(redirect)}`
      : authUrl;
  };

  return (
    <>
      <Separator className="my-5" />
      <div>
        {providers.map(({ id, text, Icon, authUrl }) => (
          <Button key={id} className="w-full" variant="outline" onClick={() => onClick(authUrl)}>
            <Icon className="size-4" />
            {text}
          </Button>
        ))}
      </div>
    </>
  );
};
