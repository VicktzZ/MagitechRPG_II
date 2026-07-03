'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';

type NumberFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    /** Permite casas decimais (padrão: somente inteiros) */
    allowDecimal?: boolean;
};

/**
 * Input numérico que permite apagar o campo durante a digitação
 * (sem forçar 0), remove zeros à esquerda e aplica min/max no blur.
 *
 * Internamente mantém o texto digitado num estado local; o `onChange`
 * só dispara com números válidos.
 */
export default function NumberField({
    value,
    onChange,
    min,
    max,
    allowDecimal = false,
    inputProps,
    ...props
}: NumberFieldProps): ReactElement {
    const [ text, setText ] = useState<string>(String(value ?? 0));

    // Sincroniza quando o valor muda por fora (ex: setValue do form)
    useEffect(() => {
        const parsed = allowDecimal ? parseFloat(text) : parseInt(text, 10);
        if (parsed !== value) {
            setText(String(value ?? 0));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ value ]);

    const clamp = (n: number): number => {
        let result = n;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        return result;
    };

    const handleChange = (raw: string) => {
        // Aceita vazio, sinal de menos isolado e números parciais durante a digitação
        const pattern = allowDecimal ? /^-?\d*[.,]?\d*$/ : /^-?\d*$/;
        if (!pattern.test(raw)) return;

        setText(raw);

        const normalized = raw.replace(',', '.');
        const parsed = allowDecimal ? parseFloat(normalized) : parseInt(normalized, 10);
        if (!isNaN(parsed)) {
            onChange(clamp(parsed));
        }
    };

    const handleBlur = () => {
        const normalized = text.replace(',', '.');
        const parsed = allowDecimal ? parseFloat(normalized) : parseInt(normalized, 10);
        const final = isNaN(parsed) ? clamp(0) : clamp(parsed);
        // Normaliza exibição (remove zeros à esquerda, vazio vira 0/min)
        setText(String(final));
        if (final !== value) onChange(final);
    };

    return (
        <TextField
            {...props}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            inputProps={{
                inputMode: allowDecimal ? 'decimal' : 'numeric',
                ...inputProps
            }}
            onWheel={(e) => (e.target as HTMLElement).blur()}
        />
    );
}
