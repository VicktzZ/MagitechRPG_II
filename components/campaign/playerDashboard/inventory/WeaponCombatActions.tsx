import type { Weapon } from '@models';
import { AutoFixNormal, Bolt, Casino, GpsFixed } from '@mui/icons-material';
import { Box, Chip, Tooltip, Typography, alpha } from '@mui/material';
import { color } from '@themes/tokens';
import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';

interface WeaponCombatActionsProps {
    weapon: Weapon;
    onHit: (weapon: Weapon, e: ReactMouseEvent) => Promise<void>;
    onDamage: (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => Promise<void>;
}

/** Ações de combate de uma arma: rolar acerto, dano e dano crítico no chat */
export default function WeaponCombatActions({ weapon, onHit, onDamage }: WeaponCombatActionsProps): ReactElement {
    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.default',
                border: '1px dashed',
                borderColor: alpha(color.danger, 0.25)
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: '100%', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
                <Casino fontSize="small" sx={{ fontSize: '0.9rem' }} /> Ações de combate
            </Typography>
            <Tooltip title={`Teste de acerto (${weapon.hit?.toUpperCase?.() ?? '?'})`}>
                <Chip
                    icon={<GpsFixed sx={{ fontSize: '0.95rem !important' }} />}
                    label="Acerto"
                    size="small"
                    clickable
                    onClick={async (e) => await onHit(weapon, e)}
                    sx={{
                        bgcolor: alpha(color.cyan, 0.12),
                        color: 'info.main',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alpha(color.cyan, 0.25),
                        '& .MuiChip-icon': { color: 'inherit' },
                        '&:hover': { bgcolor: alpha(color.cyan, 0.21) }
                    }}
                />
            </Tooltip>
            <Tooltip title={`Rolar dano (${weapon.effect?.value || '—'})`}>
                <Chip
                    icon={<AutoFixNormal sx={{ fontSize: '0.95rem !important' }} />}
                    label={`Dano${weapon.effect?.value ? ` ${weapon.effect.value}` : ''}`}
                    size="small"
                    clickable
                    onClick={async (e) => await onDamage(weapon, false, e)}
                    sx={{
                        bgcolor: alpha(color.danger, 0.12),
                        color: 'error.main',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alpha(color.danger, 0.25),
                        '& .MuiChip-icon': { color: 'inherit' },
                        '&:hover': { bgcolor: alpha(color.danger, 0.21) }
                    }}
                />
            </Tooltip>
            <Tooltip title={`Rolar dano crítico (${weapon.effect?.critValue || '—'})`}>
                <Chip
                    icon={<Bolt sx={{ fontSize: '0.95rem !important' }} />}
                    label={`Crítico${weapon.effect?.critValue ? ` ${weapon.effect.critValue}` : ''}`}
                    size="small"
                    clickable
                    onClick={async (e) => await onDamage(weapon, true, e)}
                    sx={{
                        bgcolor: alpha(color.amber, 0.12),
                        color: 'primary.main',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alpha(color.amber, 0.25),
                        '& .MuiChip-icon': { color: 'inherit' },
                        '&:hover': { bgcolor: alpha(color.amber, 0.21) }
                    }}
                />
            </Tooltip>
        </Box>
    );
}
