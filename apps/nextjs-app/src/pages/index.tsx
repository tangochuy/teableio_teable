import { HttpBadRequest } from '@belgattitude/http-exception';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { demoConfig } from '@/features/demo/demo.config';
import { DemoPage } from '@/features/demo/pages';
import i18nConfig from '../../next-i18next.config';

type Props = {
  /** Add HomeRoute props here */
};

export default function DemoRoute(
  _props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return <DemoPage />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const locale = context.res.getHeader('X-Server-Locale') as string | undefined;
  if (locale === undefined) {
    throw new HttpBadRequest('locale is missing');
  }
  const { i18nNamespaces } = demoConfig;
  return {
    props: {
      ...(await serverSideTranslations(locale, i18nNamespaces, i18nConfig)),
    },
  };
};
