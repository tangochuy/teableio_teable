import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shadcn';

interface IConfirmDialogProps {
  open?: boolean;
  contentClassName?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  closeable?: boolean;
  children?: React.ReactNode;
  content?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}
export const ConfirmDialog = (props: IConfirmDialogProps) => {
  const {
    open,
    contentClassName,
    title,
    description,
    closeable,
    onOpenChange,
    children,
    content,
    cancelText,
    confirmText,
    onConfirm,
    onCancel,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className={contentClassName}
        closeable={closeable}
        overlayStyle={{
          pointerEvents: 'none',
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {content}
        <DialogFooter>
          {cancelText && (
            <Button size={'sm'} variant={'ghost'} onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          {confirmText && (
            <Button size={'sm'} onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
