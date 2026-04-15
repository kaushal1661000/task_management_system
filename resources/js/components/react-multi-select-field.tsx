import Select from 'react-select';
import type { ReactSelectOption } from '@/components/react-select-field';

interface ReactMultiSelectFieldProps<T extends string = string> {
    id: string;
    name?: string;
    value: T[];
    options: ReactSelectOption<T>[];
    onChange: (value: T[]) => void;
    placeholder?: string;
    isDisabled?: boolean;
    className?: string;
    menuPlacement?: 'auto' | 'top' | 'bottom';
}

export default function ReactMultiSelectField<T extends string = string>({
    id,
    name,
    value,
    options,
    onChange,
    placeholder = 'Select options',
    isDisabled = false,
    className,
    menuPlacement = 'auto',
}: ReactMultiSelectFieldProps<T>) {
    const selectedOptions = options.filter((option) => value.includes(option.value));

    return (
        <Select<ReactSelectOption<T>, true>
            inputId={id}
            instanceId={id}
            name={name}
            value={selectedOptions}
            options={options}
            onChange={(selected) => onChange(selected.map((option) => option.value))}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            placeholder={placeholder}
            isDisabled={isDisabled}
            className={className}
            menuPlacement={menuPlacement}
        />
    );
}