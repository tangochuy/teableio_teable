import { Check, Copy } from '@teable/icons';
import type { ButtonProps } from '@teable/ui-lib/shadcn';
import { Button, cn } from '@teable/ui-lib/shadcn';
import { useState } from 'react';

interface ICopyButtonProps extends ButtonProps {
  text: string;
  iconClassName?: string;
}
export const CopyButton = (props: ICopyButtonProps) => {
  const { text, iconClassName, ...rest } = props;
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Button {...rest} onClick={onCopy}>
      {isCopied ? (
        <Check className={cn('text-green-400 dark:text-green-600', iconClassName)} />
      ) : (
        <Copy className={iconClassName} />
      )}
    </Button>
  );
};
