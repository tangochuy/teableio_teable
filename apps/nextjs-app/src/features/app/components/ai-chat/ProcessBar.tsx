/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import clx from 'classnames';
import { has } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import Confetti from 'react-confetti';
import { useMeasure } from 'react-use';
import type { IMessage } from 'store/message';
import { Chart } from '../Chart/Chart';
import { generateChartMap } from './createAISyntaxParser';

export const ProcessBar: React.FC<{
  onClick: () => void;
  done: boolean;
  message: IMessage;
}> = ({ onClick, done, message }) => {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const [taskDone, setTaskDone] = React.useState(false);
  const isGenerateChart = has(generateChartMap, message.id);

  useEffect(() => {
    setTaskDone(done);
    if (done) {
      setTimeout(() => {
        setTaskDone(false);
      }, 2000);
    }
  }, [done]);

  const loadingText = useMemo(() => {
    if (isGenerateChart) {
      return '✨ Generating a chart for you...';
    }
    return '✨ Creating a new table for you...';
  }, [isGenerateChart]);

  return (
    <div
      ref={ref}
      className={clx('relative max-w-full bg-base-300 px-2 rounded-lg prose prose-slate text-sm', {
        'w-full': isGenerateChart,
      })}
      onClick={onClick}
    >
      {taskDone && <Confetti width={width} height={height} />}

      {done ? (
        <div className="px-6 py-3">
          Successfully created! 🎉
          {isGenerateChart && generateChartMap[message.id] && (
            <div className="w-full overflow-x-scroll">
              {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
              <Chart chartInstance={generateChartMap[message.id]!} />
            </div>
          )}
        </div>
      ) : (
        <>
          {loadingText}
          <progress className="progress progress-primary w-full"></progress>
        </>
      )}
    </div>
  );
};
