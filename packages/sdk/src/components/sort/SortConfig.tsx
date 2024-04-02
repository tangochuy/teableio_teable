import { Button, Label, Spin, Switch } from '@teable/ui-lib';

interface ISortConfigProps {
  value?: boolean;
  buttonLoading?: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

export const SortConfig = (props: ISortConfigProps) => {
  const { value, buttonLoading, onClick, onChange } = props;

  return (
    <footer className="flex h-11 items-center justify-between bg-muted/20 px-3">
      <div className="flex items-center space-x-2">
        <Switch
          id="airplane-mode"
          className="scale-75"
          onCheckedChange={(checked) => onChange?.(!checked)}
          checked={!value}
        />
        <Label htmlFor="airplane-mode" className="cursor-pointer text-sm">
          Automatically sort records
        </Label>
      </div>

      {value && (
        <div className="flex items-center justify-between">
          <Button size="sm" disabled={buttonLoading} className="ml-2 text-sm" onClick={onClick}>
            {buttonLoading ? <Spin className="mr-1 size-4" /> : null}
            sort
          </Button>
        </div>
      )}
    </footer>
  );
};
