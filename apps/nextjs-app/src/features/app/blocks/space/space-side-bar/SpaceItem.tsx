import { Component } from '@teable-group/icons';
import type { IGetSpaceVo } from '@teable-group/openapi';
import { Button } from '@teable-group/ui-lib/shadcn';
import classNames from 'classnames';
import Link from 'next/link';
import { useRef } from 'react';
import { useMount } from 'react-use';

interface IProps {
  space: IGetSpaceVo;
  isActive: boolean;
}

export const SpaceItem: React.FC<IProps> = ({ space, isActive }) => {
  const { id, name } = space;
  const ref = useRef<HTMLButtonElement>(null);

  useMount(() => {
    isActive && ref.current?.scrollIntoView({ block: 'center' });
  });

  return (
    <Button
      ref={ref}
      variant={'ghost'}
      size={'xs'}
      asChild
      className={classNames('my-[2px] w-full px-2 justify-start text-sm font-normal gap-2 group', {
        'bg-secondary': isActive,
      })}
    >
      <Link
        href={{
          pathname: '/space/[spaceId]',
          query: {
            spaceId: id,
          },
        }}
        title={name}
      >
        <Component className="h-4 w-4 shrink-0" />
        <p className="grow truncate">{' ' + name}</p>
      </Link>
    </Button>
  );
};
