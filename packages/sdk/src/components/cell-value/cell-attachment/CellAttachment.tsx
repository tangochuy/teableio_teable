import type { IAttachmentCellValue } from '@teable/core';
import { FilePreviewItem, FilePreviewProvider, cn } from '@teable/ui-lib';
import { getFileCover } from '../../editor/attachment';
import type { ICellValue } from '../type';

interface ICellAttachment extends ICellValue<IAttachmentCellValue> {
  itemClassName?: string;
}

export const CellAttachment = (props: ICellAttachment) => {
  const { value, className, style, itemClassName } = props;

  return (
    <FilePreviewProvider>
      <div className={cn('flex gap-1 flex-wrap', className)} style={style}>
        {value?.map((attachment) => {
          const { id, name, mimetype, size, presignedUrl } = attachment;

          return (
            <FilePreviewItem
              key={id}
              className={cn(
                'shrink-0 h-7 max-w-full w-auto border rounded border-slate-200 overflow-hidden',
                itemClassName
              )}
              src={presignedUrl || ''}
              name={name}
              mimetype={mimetype}
              size={size}
            >
              <img
                className="size-full object-contain"
                src={getFileCover(mimetype, presignedUrl)}
                alt={name}
              />
            </FilePreviewItem>
          );
        })}
      </div>
    </FilePreviewProvider>
  );
};
