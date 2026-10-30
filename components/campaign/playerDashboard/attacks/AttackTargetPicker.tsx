import { Autocomplete, Box, Checkbox, FormControlLabel, MenuItem, TextField, Typography } from '@mui/material';
import { describeCounter } from '@utils/combat/attackReactions';
import type { ReactElement } from 'react';
import type { AttackTargeting } from './useAttackTargeting';

/**
 * Alvo do ataque, só em combate: com um alvo escolhido, o "Acerto" e o "Dano" da arma (e a conjuração e o "Efetuar" de uma magia de ataque) são declarados ao mestre, que confirma o resultado.
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
                helperText="Com um alvo, o ataque da arma ou da magia vai para o mestre confirmar."
                sx={{ maxWidth: 320 }}
            >
                <MenuItem value="">Sem alvo (só rolar no chat)</MenuItem>
                {targeting.targets.map(target => (
                    <MenuItem key={target.id} value={target.id}>{target.name}{target.type === 'creature' ? '' : ' (jogador)'}</MenuItem>
                ))}
            </TextField>
            {targeting.targetId && (
                <Autocomplete
                    multiple
                    size="small"
                    options={targeting.targets.filter(target => target.id !== targeting.targetId)}
                    value={targeting.targets.filter(target => targeting.extraTargetIds.includes(target.id))}
                    getOptionLabel={(target) => target.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, value) => { targeting.setExtraTargetIds(value.map(target => target.id)); }}
                    data-testid="extra-targets"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Outros alvos (ataque em área)"
                            helperText="O mesmo acerto e o mesmo dano valem para todos; o mestre resolve um cartão por alvo."
                        />
                    )}
                    sx={{ maxWidth: 420 }}
                />
            )}
            {targeting.opportunity.current && (
                <FormControlLabel
                    data-testid="opportunity-toggle"
                    control={(
                        <Checkbox
                            size="small"
                            checked={targeting.opportunity.active}
                            onChange={(event) => { targeting.opportunity.setUse(event.target.checked); }}
                        />
                    )}
                    label={(
                        <Typography variant="body2">
                            {targeting.opportunity.current.counter
                                ? `Contra-ataque (${targeting.opportunity.current.counter.source}) contra ${targeting.opportunity.current.moverName}`
                                : `Ataque de oportunidade contra ${targeting.opportunity.current.moverName}`}
                            <Typography component="span" variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                {targeting.opportunity.current.counter
                                    ? `${describeCounter(targeting.opportunity.current.counter)}. A reação já gastou a sua Reação.`
                                    : 'Gasta a Reação. Só arma branca ou magia de Reação de alcance Curto.'}
                            </Typography>
                        </Typography>
                    )}
                />
            )}
            {targeting.pending.length > 0 && (
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {targeting.pending.map(attack => (
                        <Typography key={attack.id} component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                            {attack.name} contra {attack.targetName}: {attack.damageRolled === undefined ? (attack.source === 'spell' ? 'efetue a magia' : 'role o dano') : 'aguardando o mestre'}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}
