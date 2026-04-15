import Select from 'react-select';

export interface ReactSelectOption<T extends string = string> {
    value: T;
    label: string;
}

interface ReactSelectFieldProps<T extends string = string> {
    id: string;
    name?: string;
    value: T | null | undefined;
    options: ReactSelectOption<T>[];
    onChange: (value: T) => void;
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
    className?: string;
}

export default function ReactSelectField<T extends string = string>({
    id,
    name,
    value,
    options,
    onChange,
    placeholder = 'Select an option',
    isDisabled = false,
    isClearable = false,
    className,
}: ReactSelectFieldProps<T>) {
    const selectedOption = options.find((option) => option.value === value) ?? null;

    return (
        <Select<ReactSelectOption<T>, false>
            inputId={id}
            name={name}
            instanceId={id}
            value={selectedOption}
            options={options}
            onChange={(option) => {
                if (!option) {
                    return;
                }

                onChange(option.value);
            }}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isClearable={isClearable}
            className={className}
        />
    );
}