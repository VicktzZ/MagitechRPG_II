import { TextField, type TextFieldProps } from '@mui/material';
import { type ReactElement, memo } from 'react';
import { Controller, useFormContext, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';

interface FormTextFieldProps extends Omit<TextFieldProps, 'error'> {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  fullWidth?: boolean;
}

/**
 * Componente TextField reutilizável para formulários com suporte a validação
 */
const FormTextField = memo(({ 
    registration, 
    error, 
    helperText,
    fullWidth = false, 
    ...rest 
}: FormTextFieldProps): ReactElement => {
    const { control } = useFormContext();
    const fieldName = registration?.name ;

    // Quando houver nome (uso com RHF), controlamos via Controller para evitar problemas de label/shrink
    if (fieldName) {
        return (
            <Controller
                name={fieldName as any}
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        {...rest}
                        fullWidth={fullWidth}
                        error={!!error}
                        helperText={error ? error.message?.toString() : helperText}
                        InputLabelProps={{
                            // Garante shrink quando houver valor programático (ex.: setValue)
                            shrink: field.value !== undefined && field.value !== '' && field.value !== null || rest.type === 'number'
                        }}
                    />
                )}
            />
        );
    }

    // Fallback (raramente usado): sem RHF
    return (
        <TextField
            {...registration}
            {...rest}
            fullWidth={fullWidth}
            error={!!error}
            helperText={error ? error.message?.toString() : helperText}
        />
    );
});

FormTextField.displayName = 'FormTextField';

export default FormTextField;
