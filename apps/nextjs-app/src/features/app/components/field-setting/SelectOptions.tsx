import type { SelectFieldChoices, SelectFieldOptions } from '@teable-group/core';
import { randomColor, ColorUtils, Colors } from '@teable-group/core';
import AddCircleIcon from '@teable-group/ui-lib/icons/app/add-circle.svg';
import CloseIcon from '@teable-group/ui-lib/icons/app/close.svg';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const SelectOptions = (props: {
  options: SelectFieldOptions;
  onChange?: (options: SelectFieldOptions) => void;
}) => {
  const { options, onChange } = props;
  const choices = options.choices || [];
  const [names, setNames] = useState<string[]>(choices.map(({ name }) => name));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const changeName = (name: string, index: number) => {
    const namesArr = [...names];
    namesArr[index] = name;
    setNames(namesArr);
  };

  const updateOptionChange = (index: number, choice: Partial<SelectFieldChoices>) => {
    const newChoice = choices.map((v, i) => {
      if (i === index) {
        return {
          ...v,
          ...choice,
        };
      }
      return v;
    });
    onChange?.({ choices: newChoice });
  };

  const deleteColor = (index: number) => {
    onChange?.({
      choices: choices.filter((_, i) => i !== index),
    });
  };

  const addOption = () => {
    const existColors = choices.map((v) => v.color);
    const choice = {
      name: '',
      color: randomColor(existColors)[0],
    } as SelectFieldChoices;

    const newChoices = [...choices, choice];
    onChange?.({ choices: newChoices });
    setTimeout(() => {
      inputRefs.current[choices.length]?.focus();
    });
  };

  const finishUpdateName = (index: number) => {
    updateOptionChange(index, { name: names[index] });
  };

  return (
    <ul className="space-y-2">
      {choices.map(({ color, name }, i) => {
        return (
          <li key={name} className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  style={{
                    backgroundColor: ColorUtils.getHexForColor(color),
                  }}
                  className="rounded-full w-4 h-4"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <ColorPicker color={color} onSelect={(color) => updateOptionChange(i, { color })} />
              </PopoverContent>
            </Popover>
            <div className="flex-1 px-2">
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
                className="input input-ghost input-sm hover:border-opacity-30 focus:outline-none w-full max-w-xs"
                type="text"
                value={names[i]}
                onChange={(e) => changeName(e.target.value, i)}
                onBlur={() => finishUpdateName(i)}
              />
            </div>
            <Button
              variant={'ghost'}
              className="h-6 w-6 rounded-full p-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              onClick={() => deleteColor(i)}
            >
              <CloseIcon />
            </Button>
          </li>
        );
      })}
      <li className="mt-1">
        <Button
          className="gap-2 font-normal w-full"
          size={'xs'}
          variant={'ghost'}
          onClick={addOption}
        >
          <AddCircleIcon />
          Add option
        </Button>
      </li>
    </ul>
  );
};

const ColorPicker = ({ color, onSelect }: { color: Colors; onSelect: (color: Colors) => void }) => {
  const colors = Object.values(Colors);
  return (
    <div className="flex w-80 p-2 flex-wrap">
      {colors.map((col) => (
        <button
          key={col}
          className={classNames('hover:bg-accent p-2 rounded-sm', {
            'bg-ring': color === col,
          })}
          onClick={() => onSelect(col)}
        >
          <div
            style={{
              backgroundColor: ColorUtils.getHexForColor(col),
            }}
            className="rounded-full w-4 h-4"
          ></div>
        </button>
      ))}
    </div>
  );
};
