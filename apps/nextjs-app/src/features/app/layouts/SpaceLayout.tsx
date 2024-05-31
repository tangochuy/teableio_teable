import type { DehydratedState } from '@tanstack/react-query';
import type { DriverClient } from '@teable/core';
import type { IUser } from '@teable/sdk';
import { NotificationProvider, SessionProvider } from '@teable/sdk';
import { AppProvider } from '@teable/sdk/context';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/features/app/layouts';
import { SpaceSideBar } from '../blocks/space/space-side-bar/SpaceSideBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { SidebarHeaderLeft } from '../components/sidebar/SidebarHeaderLeft';
import { SideBarFooter } from '../components/SideBarFooter';
import { useSdkLocale } from '../hooks/useSdkLocale';
import { SpacePageTitle } from './SpacePageTitle';

export const SpaceLayout: React.FC<{
  children: React.ReactNode;
  user?: IUser;
  dehydratedState?: DehydratedState;
  driver: DriverClient;
}> = ({ children, user, driver, dehydratedState }) => {
  const sdkLocale = useSdkLocale();
  const { i18n } = useTranslation();

  return (
    <AppLayout>
      <SpacePageTitle dehydratedState={dehydratedState} />
      <AppProvider
        locale={sdkLocale}
        lang={i18n.language}
        dehydratedState={dehydratedState}
        driver={driver}
      >
        <SessionProvider user={user}>
          <NotificationProvider>
            <div id="portal" className="relative flex h-screen w-full items-start">
              <Sidebar headerLeft={<SidebarHeaderLeft />}>
                <Fragment>
                  <div className="flex flex-1 flex-col gap-2 divide-y divide-solid overflow-hidden">
                    <SpaceSideBar />
                  </div>
                  <SideBarFooter />
                </Fragment>
              </Sidebar>
              {children}
            </div>
          </NotificationProvider>
        </SessionProvider>
      </AppProvider>
    </AppLayout>
  );
};
