import { FormControl, FormHelperText, InputLabel, ListSubheader, MenuItem, Select, type SelectProps } from '@mui/material';
import { type CSSProperties, type ReactElement, type ReactNode, memo, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { Delete } from '@mui/icons-material';
import { WarningModal } from '@layout';

interface FormSelectProps extends Omit<SelectProps, 'error'> {
    registration?: UseFormRegisterReturn;
    error?: FieldError;
    label: string;
    options: Array<{ value: string, label: string, id?: string, isDeleteEnabled?: boolean }> | OptionGroup[];
    noLabel?: boolean;
    hasGroups?: boolean;
    menuStyle?: CSSProperties;
    onDelete?: (id: string) => Promise<void>;
}

interface OptionGroup {
    header: string;
    options: Array<{ value: string, label: string, id?: string, isDeleteEnabled?: boolean }>;
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
    menuStyle,
    onDelete,
    ...rest 
}: FormSelectProps): ReactElement => {
    const [ warningModalOpen, setWarningModalOpen ] = useState({ open: false, label: '', value: '', id: '' });
    
    const menuProps = useMemo(() => ({
        PaperProps: {
            style: {
                ...menuStyle,
                maxHeight: ITEM_HEIGHT * (Number(menuStyle?.maxHeight) || 4.5) + ITEM_PADDING_TOP,
                width: (Number(menuStyle?.width) || 250)
            }
        },
        disableAutoFocusItem: true
    }), [ menuStyle ]);

    const renderOptions = useMemo(() => {
        if (!hasGroups) {
            return (options as Array<{ value: string, label: string, id?: string, isDeleteEnabled?: boolean }>)?.map(option => (
                <MenuItem 
                    key={option.value} 
                    value={option.value}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    {option.label}
                    {option.isDeleteEnabled && (
                        <Delete 
                            sx={{ color: 'error.main', ml: 1, zIndex: 999 }} 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setWarningModalOpen({ open: true, label: option.label, value: option.value, id: option.id ?? '' });
                            }}
                        />
                    )}
                </MenuItem>
            ));
        } else {
            return (options as unknown as OptionGroup[]).map((group) => [
                <ListSubheader key={group?.header}>{group?.header}</ListSubheader>,
                ...(group?.options?.map(option => (
                    <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                        {option.label}
                        {option.isDeleteEnabled && (
                            <Delete 
                                sx={{ color: 'error.main', ml: 1, zIndex: 999 }} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setWarningModalOpen({ open: true, label: option.label, value: option.value, id: option.id ?? '' });
                                }}
                            />
                        )}
                    </MenuItem>
                )) || [])
            ]);
        }
    }, [ options, hasGroups ]);

    const { control } = useFormContext();
    const fieldName = registration?.name ?? (rest as any)?.name;
    const labelId = fieldName ? `${fieldName}-label` : undefined;

    return (
        <>
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
                        renderValue={selected => selected as ReactNode}
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
            <WarningModal
                open={warningModalOpen.open}
                onClose={() => setWarningModalOpen({ open: false, label: '', value: '', id: '' })}
                onConfirm={() => {
                    setWarningModalOpen({ open: false, label: '', value: '', id: '' });
                    onDelete?.(warningModalOpen.id);
                }}
                title="Excluir item"
                text={`Tem certeza que deseja excluir "${warningModalOpen.label}"?`}
                confirmButtonLabel="Excluir"
                cancelButtonLabel="Cancelar"
            />
        </>        
    );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
