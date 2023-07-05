import type { IAttachmentItem, IAttachmentCellValue } from '@teable-group/core';
import { generateAttachmentId } from '@teable-group/core';
import CloseIcon from '@teable-group/ui-lib/icons/app/close.svg';
import DownloadIcon from '@teable-group/ui-lib/icons/app/download.svg';
import { Button } from '@teable-group/ui-lib/shadcn/ui/button';
import { Progress } from '@teable-group/ui-lib/shadcn/ui/progress';
import { map, omit } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { IGetNotifyResponse } from '../../api/attachment/attachment.types';
import { getFileCover } from '../../utils';
import { DragAndCopy } from './DragAndCopy';
import { FileInput } from './FileInput';
import type { IFile } from './uploadManage';
import { AttachmentManager } from './uploadManage';

export interface IUploadAttachment {
  attachments: IAttachmentCellValue;
  onChange: (attachment: IAttachmentCellValue) => void;
}

type IUploadFileMap = { [key: string]: { progress: number; file: File } };

const attachmentManager = new AttachmentManager(2);

export const getAttachmentUrl = (item: IAttachmentItem) =>
  `${window.location.origin}/api/attachments/${item.token}`;

export const UploadAttachment = (props: IUploadAttachment) => {
  const { attachments, onChange } = props;
  const [uploadingFiles, setUploadingFiles] = useState<IUploadFileMap>({});
  const listRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<IAttachmentCellValue>(attachments);

  attachmentsRef.current = attachments;

  const onDelete = (id: string) => {
    onChange(attachments.filter((attachment) => attachment.id !== id));
  };

  const downloadFile = (attachment: IAttachmentItem) => {
    window.open(`${getAttachmentUrl(attachment)}?filename=${attachment.name}`);
  };

  const handleSuccess = useCallback(
    (file: IFile, attachment: IGetNotifyResponse) => {
      const { id, instance } = file;

      const newAttachment: IAttachmentItem = {
        id,
        name: instance.name,
        ...attachment,
      };
      setUploadingFiles((pre) => omit(pre, file.id));
      onChange([...attachmentsRef.current, newAttachment]);
    },
    [onChange]
  );

  const uploadAttachment = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList);
      const uploadList = files.map((v) => ({ instance: v, id: generateAttachmentId() }));

      const newUploadMap = uploadList.reduce((acc: IUploadFileMap, file) => {
        acc[file.id] = { progress: 0, file: file.instance };
        return acc;
      }, {});
      attachmentManager.upload(uploadList, {
        successCallback: handleSuccess,
        progressCallback: (file, progress) => {
          setUploadingFiles((pre) => ({ ...pre, [file.id]: { progress, file: file.instance } }));
        },
      });
      setUploadingFiles((pre) => ({ ...pre, ...newUploadMap }));
      setTimeout(() => {
        scrollBottom();
      }, 100);
    },
    [handleSuccess]
  );

  const scrollBottom = () => {
    if (listRef.current) {
      const scrollHeight = listRef.current.scrollHeight;
      const height = listRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      listRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  const len = useMemo(() => {
    return attachments.length + Object.keys(uploadingFiles).length;
  }, [attachments, uploadingFiles]);

  const uploadingFilesList = map(uploadingFiles, (value, key) => ({ id: key, ...value }));
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="overflow-y-scroll relative flex-1" ref={listRef}>
        {len === 0 && <DragAndCopy onChange={uploadAttachment} />}
        {len > 0 && (
          <ul className="absolute -right-2 w-full h-full flex flex-wrap">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="w-28 h-28 pr-1 mr-1 flex flex-col">
                <div className="group flex-1 px-2 relative border border-border cursor-pointer rounded-md overflow-hidden">
                  <img
                    className="w-full h-full"
                    src={getFileCover(attachment.mimetype, getAttachmentUrl(attachment))}
                    alt={attachment.name}
                  />
                  <ul className="absolute top-0 right-0 opacity-0 flex justify-end group-hover:opacity-100 space-x-1 bg-foreground/50 p-1 w-full">
                    {/* <li>
                      <button className="btn btn-xs btn-circle bg-neutral/50 border-none">
                        <FullscreenIcon />
                      </button>
                    </li> */}
                    <li>
                      <Button
                        variant={'ghost'}
                        className="h-5 w-5 rounded-full p-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        onClick={() => downloadFile(attachment)}
                      >
                        <DownloadIcon />
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={'ghost'}
                        className="h-5 w-5 p-0 rounded-full focus-visible:ring-transparent focus-visible:ring-offset-0"
                        onClick={() => onDelete(attachment.id)}
                      >
                        <CloseIcon />
                      </Button>
                    </li>
                  </ul>
                </div>
                <span
                  className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden"
                  title={attachment.name}
                >
                  {attachment.name}
                </span>
              </li>
            ))}
            {uploadingFilesList.map(({ id, progress, file }) => (
              <li
                key={id}
                className="w-28 h-28 pr-1 mr-1 flex flex-col justify-between items-center"
              >
                <div className="w-full flex-1 px-2 relative border border-border cursor-pointer rounded-md overflow-hidden flex justify-center items-center flex-col">
                  <Progress value={progress} />
                  {progress}%
                </div>
                <span
                  className="w-full text-center text-ellipsis whitespace-nowrap overflow-hidden"
                  title={file.name}
                >
                  {file.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FileInput onChange={uploadAttachment} />
    </div>
  );
};
