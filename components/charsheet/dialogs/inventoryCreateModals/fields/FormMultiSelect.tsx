import { 
    Box, 
    Chip, 
    FormControl, 
    FormHelperText, 
    InputLabel, 
    ListSubheader,
    MenuItem, 
    OutlinedInput, 
    Select, 
    type SelectProps 
} from '@mui/material';
import { type ReactElement, memo, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';

interface OptionGroup {
  header: string;
  options: Array<{ value: string, label: string }>;
}

interface FormMultiSelectProps extends Omit<SelectProps, 'error'> {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  label: string;
  options: Array<{ value: string, label: string }> | OptionGroup[];
  hasGroups?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

/**
 * Componente Select para seleção múltipla com suporte a chips e grupos
 */
const FormMultiSelect = memo(({ 
    registration, 
    error, 
    label,
    options,
    hasGroups = false,
    sx,
    ...rest 
}: FormMultiSelectProps): ReactElement => {
  
    const menuProps = useMemo(() => ({
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
            }
        }
    }), []);

    // Renderizar as opções conforme o tipo (simples ou com grupos)
    const renderOptions = useMemo(() => {
        if (!hasGroups) {
            return (options as Array<{ value: string, label: string }>)?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ));
        } else {
            return (options as OptionGroup[]).map((group) => [
                <ListSubheader key={group.header}>{group.header}</ListSubheader>,
                ...(group.options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                )) || [])
            ]);
        }
    }, [ options, hasGroups ]);

    // Função para renderizar os chips de seleção
    const renderValue = (selected: unknown) => {
        const selectedValues = selected as string[];
    
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedValues.map((value) => (
                    <Chip key={value} label={value} />
                ))}
            </Box>
        );
    };

    const { control } = useFormContext();

    return (
        <FormControl sx={sx}>
            <InputLabel 
                sx={{ color: error ? 'error.main' : '' }}
                id={registration.name}
            >
                {label}
            </InputLabel>
            <Controller
                name={registration.name as any}
                control={control}
                render={({ field }) => (
                    <Select
                        labelId={registration.name}
                        id={`${registration.name}-select`}
                        multiple
                        input={<OutlinedInput id="select-multiple-chip" label={label} />}
                        renderValue={renderValue}
                        {...field}
                        {...rest}
                        MenuProps={menuProps}
                    >
                        {renderOptions}
                    </Select>
                )}
            />
            {error && (
                <FormHelperText sx={{ color: 'error.main' }}>
                    {error.message?.toString()}
                </FormHelperText>
            )}
        </FormControl>
    );
});

FormMultiSelect.displayName = 'FormMultiSelect';

export default FormMultiSelect;
