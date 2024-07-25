import type { IConjunction } from '@teable/core';
import { cn } from '@teable/ui-lib';
import { useTranslation } from '../../../context/app/i18n';
import { useCompact } from '../hooks';
import { ConjunctionSelect } from './ConjunctionSelect';

interface IConjunctionProps {
  index: number;
  value: IConjunction;
  onSelect: (value: IConjunction | null) => void;
}

enum ConjunctionPosition {
  WHERE = 0,
  SELECTOR = 1,
  JOIN = 2,
}

const Conjunction = (props: IConjunctionProps) => {
  const { index, onSelect, value } = props;
  const { t } = useTranslation();
  const compact = useCompact();

  return (
    <div
      className={cn('flex shrink-0 justify-start', {
        'max-w-[66px] min-w-16': compact,
        'w-[66px]': !compact,
      })}
    >
      {index === ConjunctionPosition.WHERE ? (
        <span className="px-1 text-sm">{t('filter.conjunction.where')}</span>
      ) : null}
      {index === ConjunctionPosition.SELECTOR ? (
        <ConjunctionSelect value={value} onSelect={onSelect} />
      ) : null}
      {index >= ConjunctionPosition.JOIN ? (
        <span className="px-1 text-[13px]">
          {value === 'or' ? t('filter.conjunction.or') : t('filter.conjunction.and')}
        </span>
      ) : null}
    </div>
  );
};

export { Conjunction };
