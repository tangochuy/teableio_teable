import { Gauge, Lock, PackageCheck } from '@teable/icons';
import { useBasePermission } from '@teable/sdk/hooks';
import { cn } from '@teable/ui-lib/shadcn';
import { Button } from '@teable/ui-lib/shadcn/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { tableConfig } from '@/features/i18n/table.config';
import { TableList } from '../../table-list/TableList';
import { QuickAction } from './QuickAction';

export const BaseSideBar = () => {
  const router = useRouter();
  const { baseId } = router.query;
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  const basePermission = useBasePermission();
  const pageRoutes: {
    href: string;
    text: string;
    Icon: React.FC<{ className?: string }>;
    disabled?: boolean;
  }[] = [
    {
      href: `/base/${baseId}/dashboard`,
      text: t('common:noun.dashboard'),
      Icon: Gauge,
    },
    {
      href: `/base/${baseId}/automation`,
      text: t('common:noun.automation'),
      Icon: PackageCheck,
      disabled: true,
    },
    ...(basePermission?.['base|authority_matrix_config']
      ? [
          {
            href: `/base/${baseId}/authority-matrix`,
            text: t('common:noun.authorityMatrix'),
            Icon: Lock,
          },
        ]
      : []),
  ];
  return (
    <>
      <div className="flex flex-col gap-2 px-3">
        <div>
          <QuickAction>{t('common:quickAction.title')}</QuickAction>
        </div>
        <ul>
          {pageRoutes.map(({ href, text, Icon, disabled }) => {
            return (
              <li key={href}>
                <Button
                  variant="ghost"
                  size={'xs'}
                  asChild
                  className={cn(
                    'w-full justify-start text-sm px-2 my-[2px]',
                    href === router.asPath && 'bg-secondary'
                  )}
                  disabled={disabled}
                >
                  <Link href={href} className="font-normal">
                    <Icon className="size-4 shrink-0" />
                    <p className="truncate">{text}</p>
                    <div className="grow basis-0"></div>
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      <TableList />
    </>
  );
};
