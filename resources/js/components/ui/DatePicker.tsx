import dayjs, { type Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface AppDatePickerProps {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export default function AppDatePicker({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  minDate,
  maxDate,
}: AppDatePickerProps) {
  const selectedValue = value ? dayjs(value) : null;

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      onChange('');
      return;
    }

    onChange(newValue.format('YYYY-MM-DD'));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={selectedValue}
        onChange={handleChange}
        format="DD/MM/YYYY"
        disabled={disabled}
        minDate={minDate ? dayjs(minDate) : undefined}
        maxDate={maxDate ? dayjs(maxDate) : undefined}
        slotProps={{
          textField: {
            id,
            required,
            fullWidth: true,
            size: 'small',
            placeholder: 'DD/MM/YYYY',
          },
        }}
      />
    </LocalizationProvider>
  );
}
