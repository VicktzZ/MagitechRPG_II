import { FormControl, FormHelperText, InputLabel, MenuItem, Select, type SelectProps } from '@mui/material';
import { type ReactElement, memo, useMemo } from 'react';
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';

interface FormSelectProps extends Omit<SelectProps, 'error'> {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  label: string;
  options: Array<{ value: string, label: string }>;
  noLabel?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

/**
 * Componente Select reutilizável para formulários com suporte a validação
 */
const FormSelect = memo(({ 
    registration, 
    error, 
    label,
    options,
    noLabel = false,
    defaultValue = '',
    sx,
    ...rest 
}: FormSelectProps): ReactElement => {
  
    const menuProps = useMemo(() => ({
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
            }
        }
    }), []);

    return (
        <FormControl sx={sx}>
            <InputLabel 
                sx={{ color: error ? 'error.main' : '' }}
                id={registration?.name}
            >
                {!noLabel && label}
            </InputLabel>
            <Select
                labelId={registration?.name}
                id={`${registration?.name}-select`}
                label={label}
                defaultValue={defaultValue}
                {...registration}
                {...rest}
                MenuProps={menuProps}
            >
                {options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            {error && (
                <FormHelperText sx={{ color: 'error.main' }}>
                    {error.message?.toString()}
                </FormHelperText>
            )}
        </FormControl>
    );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
