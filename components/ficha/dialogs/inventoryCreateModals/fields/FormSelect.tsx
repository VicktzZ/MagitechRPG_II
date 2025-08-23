import { FormControl, FormHelperText, InputLabel, ListSubheader, MenuItem, Select, type SelectProps } from '@mui/material';
import { type ReactElement, memo, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';

interface FormSelectProps extends Omit<SelectProps, 'error'> {
    registration?: UseFormRegisterReturn;
    error?: FieldError;
    label: string;
    options: Array<{ value: string, label: string }> | OptionGroup[];
    noLabel?: boolean;
    hasGroups?: boolean;
}

interface OptionGroup {
    header: string;
    options: Array<{ value: string, label: string }>;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const FormSelect = memo(({ 
    registration, 
    error, 
    label,
    options,
    noLabel = false,
    sx,
    hasGroups = false,
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

    const renderOptions = useMemo(() => {
        if (!hasGroups) {
            return (options as Array<{ value: string, label: string }>)?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ));
        } else {
            return (options as unknown as OptionGroup[]).map((group) => [
                <ListSubheader key={group.header}>{group.header}</ListSubheader>,
                ...(group.options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                )) || [])
            ]);
        }
    }, [ options, hasGroups ]);

    const { control } = useFormContext();
    const fieldName = registration?.name ?? (rest as any)?.name;
    const labelId = fieldName ? `${fieldName}-label` : undefined;

    return (
        <FormControl sx={sx}>
            <InputLabel 
                sx={{ color: error ? 'error.main' : '' }}
                id={labelId}
            >
                {!noLabel && label}
            </InputLabel>
            {fieldName ? (
                <Controller
                    name={fieldName }
                    control={control}
                    render={({ field }) => (
                        <Select
                            labelId={labelId}
                            id={fieldName }
                            label={label}
                            {...field}
                            {...rest}
                            MenuProps={menuProps}
                        >
                            {renderOptions}
                        </Select>
                    )}
                />
            ) : (
                // Uso sem react-hook-form (ex.: selects de cabeçalho externos)
                <Select
                    labelId={labelId}
                    label={label}
                    {...rest}
                    MenuProps={menuProps}
                >
                    {renderOptions}
                </Select>
            )}
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
