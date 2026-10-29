import type { Weapon } from '@models';
import { Bolt, GpsFixed, Whatshot } from '@mui/icons-material';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';

interface WeaponCombatActionsProps {
    weapon: Weapon;
    onHit: (weapon: Weapon, e: ReactMouseEvent) => Promise<void>;
    onDamage: (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => Promise<void>;
    /** `quick`: só acerto e dano, para a linha do cartão; `full`: com o crítico e o título, dentro do cartão aberto */
    variant?: 'quick' | 'full';
}

/** Ações de combate de uma arma: rolar acerto, dano e dano crítico no chat */
export default function WeaponCombatActions({ weapon, onHit, onDamage, variant = 'full' }: WeaponCombatActionsProps): ReactElement {
    const full = variant === 'full';

    return (
        <Box data-testid={`weapon-actions-${variant}`} sx={full ? { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 } : { display: 'flex', gap: 0.75 }}>
            {full && (
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>Ações de combate</Typography>
            )}
            <Tooltip title={`Teste de acerto (${weapon.hit?.toUpperCase?.() ?? '?'})`}>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<GpsFixed fontSize="small" />}
                    aria-label={`Rolar acerto de ${weapon.name}`}
                    onClick={(event) => { void onHit(weapon, event) }}
                    sx={{ textTransform: 'none' }}
                >
                    Acerto
                </Button>
            </Tooltip>
            <Tooltip title={`Rolar dano (${weapon.effect?.value || '—'})`}>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Whatshot fontSize="small" />}
                    aria-label={`Rolar dano de ${weapon.name}`}
                    onClick={(event) => { void onDamage(weapon, false, event) }}
                    sx={{ textTransform: 'none' }}
                >
                    {`Dano${full && weapon.effect?.value ? ` ${weapon.effect.value}` : ''}`}
                </Button>
            </Tooltip>
            {full && (
                <Tooltip title={`Rolar dano crítico (${weapon.effect?.critValue || '—'})`}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<Bolt fontSize="small" />}
                        aria-label={`Rolar dano crítico de ${weapon.name}`}
                        onClick={(event) => { void onDamage(weapon, true, event) }}
                        sx={{ textTransform: 'none' }}
                    >
                        {`Crítico${weapon.effect?.critValue ? ` ${weapon.effect.critValue}` : ''}`}
                    </Button>
                </Tooltip>
            )}
        </Box>
    );
}
