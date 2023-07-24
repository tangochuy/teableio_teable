import { BaseSingleSelect } from './base/BaseSingleSelect';

interface IFileTypeSelectProps {
  value: string | null;
  onSelect: (value: string | null) => void;
}

const typeOptions = [
  { value: 'image', label: 'image' },
  { value: 'text', label: 'text' },
];

function FileTypeSelect(props: IFileTypeSelectProps) {
  const { value, onSelect } = props;
  return (
    <>
      <BaseSingleSelect value={value} onSelect={onSelect} options={typeOptions} />
    </>
  );
}

FileTypeSelect.displayName = 'FileTypeSelect';

export { FileTypeSelect };
