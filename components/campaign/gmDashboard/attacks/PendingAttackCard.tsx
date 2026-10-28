'use client';

import { Casino } from '@mui/icons-material';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { resistanceExpertise, DODGE_BLOCK_TEXT, type DefenseChoice } from '@utils/combat/engine/defense';
import type { DamageKind } from '@utils/combat/engine/types';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { useAttackResolution } from './useAttackResolution';

const KIND_LABEL: Record<DamageKind, string> = { fisico: 'Físico', magico: 'Mágico', mental: 'Mental' };

/**
 * Um ataque declarado, para o mestre resolver: o acerto contra o AP do alvo, a fraqueza (só o mestre vê), a defesa que o alvo escolheu (esquiva
 * ou resistência, com o teste rolado pelo painel ou digitado), o que o motor calculou e o dano final, que o mestre pode trocar antes de confirmar.
 */
export default function PendingAttackCard({ attack }: { attack: PendingAttackData }): ReactElement {
    const resolution = useAttackResolution(attack);
    const { proposal } = resolution;

    const defenseHelp = ((): string => {
        if (resolution.defense === 'dodge') {
            return proposal.dodge.reason ? `Esquiva negada: ${DODGE_BLOCK_TEXT[proposal.dodge.reason]}` : `Reflexos precisa passar de ${Math.floor(proposal.attackTotal)}`;
        }
        return resolution.defense === 'resist' ? `DT ${Math.ceil(proposal.attackTotal / 2)}` : '';
    })();

    return (
        <Paper variant="outlined" data-testid={`pending-attack-${attack.id}`} sx={{ p: 2, borderRadius: 2, borderLeft: '3px solid', borderLeftColor: 'primary.main', bgcolor: 'background.raised' }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: font.display, fontWeight: 600 }}>{attack.attackerName} → {attack.targetName}</Typography>
                <Chip size="small" label={`${attack.name}${attack.attackType ? ` · ${attack.attackType}` : ''}`} />
                {attack.critical && <Chip size="small" color="warning" label="Crítico" />}
                {proposal.weak && <Chip size="small" color="info" label="Alvo fraco a este ataque" />}
            </Stack>

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" component="div">Acerto</Typography>
                    <Typography sx={{ fontFamily: font.mono }}>
                        {proposal.attackTotal} contra AP {proposal.targetAp}
                    </Typography>
                    <Chip size="small" color={proposal.hit ? 'success' : 'error'} label={proposal.hit ? 'Acertou' : 'Errou'} sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" component="div">Dano rolado</Typography>
                    <Typography sx={{ fontFamily: font.mono }}>
                        {attack.damageRolled === undefined ? 'aguardando o jogador' : attack.damageRolled}
                    </Typography>
                </Box>
                {proposal.extraDiceOwed > 0 && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" component="div">Fraqueza: +1d20 no acerto</Typography>
                        <Button size="small" variant="outlined" startIcon={<Casino fontSize="small" />} onClick={resolution.rollExtraDie} sx={{ textTransform: 'none' }}>
                            Rolar d20 extra
                        </Button>
                    </Box>
                )}
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }} alignItems="flex-start">
                <TextField select size="small" label="Natureza do ataque" value={resolution.kind} onChange={(event) => { resolution.setKind(event.target.value as DamageKind); }} sx={{ width: 170 }}>
                    {(Object.keys(KIND_LABEL) as DamageKind[]).map(kind => <MenuItem key={kind} value={kind}>{KIND_LABEL[kind]}</MenuItem>)}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Defesa do alvo"
                    value={resolution.defense}
                    onChange={(event) => { resolution.setDefense(event.target.value as DefenseChoice); }}
                    helperText={defenseHelp || ' '}
                    sx={{ width: 230 }}
                >
                    <MenuItem value="none">Nenhuma</MenuItem>
                    <MenuItem value="dodge">Esquiva (Reflexos)</MenuItem>
                    <MenuItem value="resist">Resistência ({resistanceExpertise(proposal.kind)})</MenuItem>
                </TextField>
                {resolution.defense !== 'none' && (
                    <>
                        <TextField
                            size="small"
                            type="number"
                            label="Total da defesa"
                            value={resolution.defenseTotal}
                            onChange={(event) => { resolution.setDefenseTotal(event.target.value); }}
                            helperText={resolution.defenseRollText || ' '}
                            sx={{ width: 160 }}
                        />
                        <Button size="small" variant="outlined" startIcon={<Casino fontSize="small" />} onClick={resolution.rollDefense} sx={{ textTransform: 'none', mt: 0.5 }}>
                            Rolar
                        </Button>
                    </>
                )}
                <FormControlLabel
                    control={<Checkbox size="small" checked={resolution.surprised} onChange={(event) => { resolution.setSurprised(event.target.checked); }} />}
                    label="Alvo não viu o atacante"
                    sx={{ mt: 0.25 }}
                />
                <TextField size="small" type="number" label="Área (m)" value={resolution.area} onChange={(event) => { resolution.setArea(event.target.value); }} sx={{ width: 110 }} />
            </Stack>

            {proposal.lines.length > 0 && (
                <Box component="ul" data-testid="attack-lines" sx={{ m: 0, mb: 1.5, pl: 2 }}>
                    {proposal.lines.map((entry, index) => (
                        <Typography key={`${entry.label}-${index}`} component="li" variant="body2" color="text.secondary">
                            {entry.label}{entry.detail ? `: ${entry.detail}` : ''}{entry.visibility === 'gm' ? ' (só o mestre vê)' : ''}
                        </Typography>
                    ))}
                </Box>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={resolution.hit}
                    onChange={(_, value: boolean | null) => { if (value !== null) resolution.setHitOverride(value === proposal.hit ? null : value); }}
                    aria-label="Resultado do acerto"
                >
                    <ToggleButton value={true}>Acertou</ToggleButton>
                    <ToggleButton value={false}>Errou</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                    size="small"
                    type="number"
                    label="Dano final"
                    value={resolution.damageOverride}
                    placeholder={String(proposal.finalDamage)}
                    onChange={(event) => { resolution.setDamageOverride(event.target.value); }}
                    helperText="Vazio segue o motor"
                    sx={{ width: 140 }}
                />
                <Box sx={{ flex: 1 }} />
                <Button size="small" onClick={() => { void resolution.dismiss(); }} disabled={resolution.busy} sx={{ textTransform: 'none' }}>
                    Descartar
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => { void resolution.confirm(); }}
                    disabled={resolution.busy || !resolution.canConfirm}
                    sx={{ textTransform: 'none' }}
                >
                    {resolution.hit ? `Aplicar ${resolution.finalDamage} de dano` : 'Confirmar erro'}
                </Button>
            </Stack>
            {!resolution.canConfirm && (
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                    Espere o jogador rolar o dano, ou digite o dano final.
                </Typography>
            )}
        </Paper>
    );
}
