'use client';

import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Typography } from '@mui/material';
import { AREA_AFFECTS_LABEL, areaMax, SIDE_LABEL, type AreaSpec, type CombatSide } from '@utils/combat/sides';
import { useEffect, useState, type ReactElement } from 'react';

export interface AreaCandidate {
    id: string;
    name: string;
    side: CombatSide;
    /** É quem está usando a habilidade */
    self: boolean;
}

/** O que a área pede, em uma frase para quem escolhe (o app não mede distância: vale a palavra de quem usa, e o mestre corrige) */
export function areaHelp(spec: AreaSpec): string {
    const who = spec.affects === 'allies' ? 'os aliados' : spec.affects === 'enemies' ? 'o inimigo' : 'quem';
    const limit = areaMax(spec);
    const count = spec.affects === 'enemies' && limit === 1 ? '' : ` (até ${limit})`;
    return `Marque ${who} que a área atinge${count}. O app não mede distância: vale a sua palavra e o mestre corrige se precisar.`;
}

interface AreaTargetFormProps {
    spec: AreaSpec;
    candidates: AreaCandidate[];
    selected: readonly string[];
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onClear: () => void;
}

/** A lista de quem pode ser atingido, com caixa de marcação (separada do diálogo para poder ser testada fora do navegador) */
export function AreaTargetForm({ spec, candidates, selected, onToggle, onSelectAll, onClear }: AreaTargetFormProps): ReactElement {
    const limit = areaMax(spec);
    const chosen = new Set(selected);
    const full = chosen.size >= limit;

    return (
        <Stack spacing={1.5} data-testid="area-target-form">
            <Typography variant="body2" color="text.secondary">{areaHelp(spec)}</Typography>

            {candidates.length === 0 ? (
                <Typography variant="body2" data-testid="area-target-empty">Não há ninguém no combate que esta habilidade possa atingir. O mestre pode mudar o lado de alguém.</Typography>
            ) : (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column' }}>
                    {candidates.map(candidate => (
                        <li key={candidate.id}>
                            <FormControlLabel
                                sx={{ width: '100%', m: 0 }}
                                control={(
                                    <Checkbox
                                        size="small"
                                        checked={chosen.has(candidate.id)}
                                        disabled={!chosen.has(candidate.id) && full}
                                        onChange={() => { onToggle(candidate.id); }}
                                        inputProps={{ 'aria-label': `Atinge ${candidate.name}` }}
                                    />
                                )}
                                label={(
                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
                                        <Typography component="span">{candidate.name}{candidate.self ? ' (você)' : ''}</Typography>
                                        <Typography component="span" variant="caption" color="text.secondary">{SIDE_LABEL[candidate.side]}</Typography>
                                    </Box>
                                )}
                            />
                        </li>
                    ))}
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {spec.affects !== 'enemies' && candidates.length > 0 && (
                    <Button size="small" onClick={onSelectAll} sx={{ textTransform: 'none' }}>{`Marcar ${AREA_AFFECTS_LABEL[spec.affects].toLowerCase()}`}</Button>
                )}
                <Button size="small" color="secondary" onClick={onClear} disabled={selected.length === 0} sx={{ textTransform: 'none' }}>Limpar</Button>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }} data-testid="area-target-count" role="status">
                    {`${selected.length} de ${Math.min(limit, candidates.length || limit)} marcados`}
                </Typography>
            </Box>
        </Stack>
    );
}

interface AreaTargetDialogProps {
    open: boolean;
    abilityName: string;
    spec: AreaSpec;
    candidates: AreaCandidate[];
    /** O que já vem marcado ao abrir */
    defaultSelected: string[];
    onConfirm: (ids: string[]) => void;
    onClose: () => void;
}

/**
 * "Quem foi atingido?": antes de usar uma habilidade de área (aura, cura em grupo, maldição num alvo) o jogador marca os combatentes que ela pega. O servidor confere o lado e o
 * combate; o app não mede distância (o mapa é de terceiros). Genérico: serve às habilidades e, depois, às magias de área.
 */
export default function AreaTargetDialog({ open, abilityName, spec, candidates, defaultSelected, onConfirm, onClose }: AreaTargetDialogProps): ReactElement {
    const [ selected, setSelected ] = useState<string[]>(defaultSelected);
    const limit = areaMax(spec);

    // A cada abertura volta ao que o chamador deixa marcado de início
    useEffect(() => {
        if (open) setSelected(defaultSelected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    const toggle = (id: string): void => {
        setSelected(current => (current.includes(id) ? current.filter(entry => entry !== id) : current.length >= limit ? current : [ ...current, id ]));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="area-target-title">
            <DialogTitle id="area-target-title">{`Quem foi atingido por ${abilityName}?`}</DialogTitle>
            <DialogContent>
                <AreaTargetForm
                    spec={spec}
                    candidates={candidates}
                    selected={selected}
                    onToggle={toggle}
                    onSelectAll={() => { setSelected(candidates.slice(0, limit).map(candidate => candidate.id)); }}
                    onClear={() => { setSelected([]); }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button variant="contained" disabled={selected.length === 0} onClick={() => { onConfirm(selected); }} sx={{ textTransform: 'none' }}>Usar habilidade</Button>
            </DialogActions>
        </Dialog>
    );
}
