import { Box, MenuItem, TextField, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import type { AttackTargeting } from './useWeaponRolls';

/**
 * Alvo do ataque, só em combate: com um alvo escolhido, o "Acerto" e o "Dano" da arma são declarados ao mestre, que confirma o resultado.
 * Sem alvo, as rolagens vão ao chat como sempre. Mostra os ataques que o mestre ainda não resolveu.
 */
export default function AttackTargetPicker({ targeting }: { targeting: AttackTargeting }): ReactElement | null {
    if (!targeting.enabled) return null;

    return (
        <Box
            data-testid="attack-target-picker"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised' }}
        >
            <TextField
                select
                size="small"
                label="Alvo do ataque"
                value={targeting.targetId}
                onChange={(event) => { targeting.setTargetId(event.target.value); }}
                helperText="Com um alvo, o acerto e o dano vão para o mestre confirmar."
                sx={{ maxWidth: 320 }}
            >
                <MenuItem value="">Sem alvo (só rolar no chat)</MenuItem>
                {targeting.targets.map(target => (
                    <MenuItem key={target.id} value={target.id}>{target.name}{target.type === 'creature' ? '' : ' (jogador)'}</MenuItem>
                ))}
            </TextField>
            {targeting.pending.length > 0 && (
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {targeting.pending.map(attack => (
                        <Typography key={attack.id} component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                            {attack.name} contra {attack.targetName}: {attack.damageRolled === undefined ? 'role o dano' : 'aguardando o mestre'}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}
