'use client';

import CasinoIcon from '@mui/icons-material/Casino';
import { Chip, CircularProgress, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { useState, type ReactElement } from 'react';

interface InitiativeControlProps {
    name: string;
    /** O combatente é jogador (ele mesmo rola; o mestre só força se ele não responder) */
    isPlayer: boolean;
    /** Iniciativa já rolada (0 = pendente) */
    total: number;
    disabled: boolean;
    /** Rola; com `value` o mestre fixa o d20 */
    onRoll: (value?: number) => void;
}

/** A iniciativa de um combatente na fase de iniciativa: o total quando já rolou; senão o campo do d20 e o dado, para o mestre rolar ou forçar a rolagem do jogador */
export default function InitiativeControl({ name, isPlayer, total, disabled, onRoll }: InitiativeControlProps): ReactElement {
    const [ value, setValue ] = useState('');

    if (total > 0) return <Chip size="small" color="success" variant="outlined" label={`Iniciativa ${total}`} sx={{ fontFamily: font.mono }} />;

    const fixed = Number(value);
    const hasFixed = value !== '' && Number.isInteger(fixed) && fixed >= 1 && fixed <= 20;

    return (
        <>
            {isPlayer && (
                <>
                    <CircularProgress size={14} aria-hidden />
                    <Typography sx={{ fontSize: 12 }} color="text.secondary">Aguardando</Typography>
                </>
            )}
            <TextField
                size="small"
                type="number"
                placeholder="d20"
                value={value}
                onChange={(event) => { setValue(event.target.value); }}
                inputProps={{ min: 1, max: 20, 'aria-label': `Valor do d20 de iniciativa de ${name}` }}
                sx={{ width: 68 }}
            />
            <Tooltip title={isPlayer ? 'Forçar a rolagem (se o jogador não responder)' : 'Rolar a iniciativa'}>
                <span>
                    <IconButton
                        size="small"
                        color="primary"
                        disabled={disabled || (value !== '' && !hasFixed)}
                        aria-label={`Rolar a iniciativa de ${name}`}
                        onClick={() => { onRoll(hasFixed ? fixed : undefined); setValue(''); }}
                    >
                        <CasinoIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </>
    );
}
