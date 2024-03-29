import { ChevronDown, ChevronUp, Link, MessageSquare, X } from '@teable/icons';
import { Button, Separator, cn } from '@teable/ui-lib';
import { useMeasure } from 'react-use';
import { useTranslation } from '../../context/app/i18n';
import { TooltipWrap } from './TooltipWrap';

interface IExpandRecordHeader {
  title?: string;
  showActivity?: boolean;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onCopyUrl?: () => void;
  onShowActivity?: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const MIN_TITLE_WIDTH = 300;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MIN_OPERATOR_WIDTH = 200;

export const ExpandRecordHeader = (props: IExpandRecordHeader) => {
  const {
    title,
    showActivity,
    disabledPrev,
    disabledNext,
    onPrev,
    onNext,
    onClose,
    onCopyUrl,
    onShowActivity,
  } = props;

  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const { t } = useTranslation();
  const showTitle = width > MIN_TITLE_WIDTH;
  const showOperator = width > MIN_OPERATOR_WIDTH;

  return (
    <div
      ref={ref}
      className={cn(
        'w-full h-12 flex items-center gap-4 px-4 border-b border-solid border-border',
        'justify-between' && !showTitle
      )}
    >
      <div>
        <TooltipWrap description="Previous record" disabled={disabledPrev}>
          <Button
            variant={'ghost'}
            tabIndex={-1}
            size={'xs'}
            onClick={onPrev}
            disabled={disabledPrev}
          >
            <ChevronUp />
          </Button>
        </TooltipWrap>
        <TooltipWrap description="Next record" disabled={disabledNext}>
          <Button
            variant={'ghost'}
            size={'xs'}
            tabIndex={-1}
            onClick={onNext}
            disabled={disabledNext}
          >
            <ChevronDown />
          </Button>
        </TooltipWrap>
      </div>
      {showTitle && (
        <h4
          title={title}
          className="flex-1 scroll-m-20 truncate text-xl font-semibold tracking-tight"
        >
          {title || t('common.unnamedRecord')}
        </h4>
      )}
      {showOperator && (
        <div>
          <TooltipWrap description="Copy record URL">
            <Button variant={'ghost'} size={'xs'} onClick={onCopyUrl}>
              <Link />
            </Button>
          </TooltipWrap>
          <TooltipWrap description={`${showActivity ? 'Hide' : 'Show'} activity`}>
            <Button
              variant={showActivity ? 'secondary' : 'ghost'}
              size={'xs'}
              onClick={onShowActivity}
            >
              <MessageSquare />
            </Button>
          </TooltipWrap>
        </div>
      )}
      <Separator className="h-6" orientation="vertical" />
      <Button variant={'ghost'} size={'xs'} onClick={onClose}>
        <X />
      </Button>
    </div>
  );
};
