import { useMutation } from '@tanstack/react-query';
import { updateUserAvatar, updateUserName } from '@teable/openapi';
import { useSession } from '@teable/sdk';
import {
  Button,
  Input,
  Label,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { UserAvatar } from '@/features/app/components/user/UserAvatar';
import { AddPassword } from './account/AddPassword';
import { ChangePasswordDialog } from './account/ChangePasswordDialog';

export const Account: React.FC = () => {
  const { user: sessionUser, refresh, refreshAvatar } = useSession();
  const { t } = useTranslation('common');

  const updateUserAvatarMutation = useMutation(updateUserAvatar, {
    onSuccess: () => {
      refreshAvatar?.();
    },
  });

  const updateUserNameMutation = useMutation(updateUserName, {
    onSuccess: () => {
      refresh?.();
    },
  });

  const toggleRenameUser = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const name = e.target.value;
    if (name && name !== sessionUser.name) {
      updateUserNameMutation.mutate({ name });
    }
  };

  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const avatarFille = e.target.files?.[0];
    if (!avatarFille) {
      return;
    }
    const formData = new FormData();
    formData.append('file', avatarFille);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateUserAvatarMutation.mutate(formData as any);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t('settings.account.title')}</h3>
      <Separator />
      <div className="flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative flex h-fit items-center justify-center">
                <UserAvatar className="size-14" width={80} height={80} user={sessionUser} />
                <div className="absolute left-0 top-0 size-full rounded-full bg-transparent group-hover:bg-muted-foreground/20">
                  <input
                    type="file"
                    className="absolute inset-0 size-full opacity-0"
                    accept="image/*"
                    onChange={uploadAvatar}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('settings.account.updatePhoto')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="ml-4 pt-3">
          <Input
            className="w-64"
            defaultValue={sessionUser.name}
            onBlur={(e) => toggleRenameUser(e)}
          />
          <Label className="text-xs text-muted-foreground" htmlFor="Preferred name">
            {t('settings.account.updateNameDesc')}
          </Label>
        </div>
      </div>
      <div>
        <h3 className="text-base font-medium">
          {t('settings.account.securityTitle')}
          {!sessionUser.hasPassword && <AddPassword />}
        </h3>
        <Separator className="my-2" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.account.email')}</Label>
              <div className="text-xs text-muted-foreground">{sessionUser.email}</div>
            </div>
          </div>
          {sessionUser.hasPassword && (
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.account.password')}</Label>
                <div className="text-xs text-muted-foreground">
                  {t('settings.account.passwordDesc')}
                </div>
              </div>
              <ChangePasswordDialog>
                <Button className="float-right" size={'sm'} variant={'outline'}>
                  {t('settings.account.changePassword.title')}
                </Button>
              </ChangePasswordDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
