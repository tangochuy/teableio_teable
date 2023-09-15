import { Trash2 } from '@teable-group/icons';
import { useBase } from '@teable-group/sdk/hooks';
import { useRouter } from 'next/router';
export const DeleteTable: React.FC<{ tableId: string; className: string }> = ({
  tableId,
  className,
}) => {
  const space = useBase();
  const router = useRouter();
  const { baseId } = router.query;
  return (
    <Trash2
      className={className}
      onClick={async () => {
        await space.deleteTable(tableId);
        router.push({
          pathname: '/base/[baseId]',
          query: { baseId },
        });
      }}
    />
  );
};
