import { TextField, type TextFieldProps } from '@mui/material';
import { type ReactElement, memo } from 'react';
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form';

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
