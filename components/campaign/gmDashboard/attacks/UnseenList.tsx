'use client';

import { useCampaignContext } from '@contexts';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { combatantVision, groupByHider, HIDDEN_CAUSE_LABEL, observerBlocked, perceptionDT, type UnseenData } from '@utils/combat/awareness';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';
import { useAwareness } from './useAwareness';
import { usePerceptionTest, type PerceptionResult } from './usePerceptionTest';

/**
 * A matriz de percepção: quem está escondido e de quem. Para cada observador o mestre testa a Percepção dele contra a DT da regra (20 do furtivo, 30 do invisível,
 * 15 do invisível para quem tem Visão Verdadeira); passando, ele passa a ver e sai da lista. Também pode revelar na mão (um observador ou todos). "Fora da vista"
 * não tem DT na regra: o mestre decide quando revelar.
 */
export default function UnseenList(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const { busy, reveal } = useAwareness();
    const rollPerception = usePerceptionTest();
    const [ results, setResults ] = useState<Record<string, PerceptionResult>>({});

    const combat = campaign.session?.combat;
    const groups = groupByHider(combat?.unseen);
    if (groups.length === 0) return null;

    const observerVision = (observerId: string) => {
        const observer = combat?.combatants?.find(candidate => candidate.id === observerId);
        return observer ? combatantVision(observer) : 'normal';
    };

    const testPerception = async (entry: UnseenData, dt: number): Promise<void> => {
        const result = rollPerception(entry.observerId, dt);
        if (!result) {
            enqueueSnackbar(`Não deu para rolar Percepção por ${entry.observerName}. Revele na mão se ele notou.`, { variant: 'warning' });
            return;
        }
        setResults(current => ({ ...current, [entry.id]: result }));
        if (result.passed && await reveal(entry.hiderId, [ entry.observerId ])) {
            enqueueSnackbar(`${entry.observerName} notou ${entry.hiderName} (Percepção ${result.total} contra DT ${dt}).`, { variant: 'info' });
        }
    };

    return (
        <Stack spacing={1} data-testid="unseen-list">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Escondidos (quem não os vê fica desprevenido contra eles)</Typography>
            {groups.map(group => (
                <Box key={group.hiderId} data-testid={`unseen-group-${group.hiderId}`}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{group.hiderName}</Typography>
                        <Button size="small" color="inherit" disabled={busy} onClick={() => { void reveal(group.hiderId); }} sx={{ textTransform: 'none' }}>
                            Revelar a todos
                        </Button>
                    </Stack>
                    <Stack spacing={0.5} sx={{ pl: 1.5 }}>
                        {group.entries.map(entry => {
                            const vision = observerVision(entry.observerId);
                            const blocked = observerBlocked(entry.cause, vision);
                            const dt = blocked ? perceptionDT(entry.cause, vision) : null;
                            const result = results[entry.id];
                            return (
                                <Stack key={entry.id} direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap data-testid={`unseen-${entry.id}`}>
                                    <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }}>
                                        {entry.observerName} não o vê
                                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}> ({HIDDEN_CAUSE_LABEL[entry.cause].toLowerCase()})</Typography>
                                    </Typography>
                                    {!blocked && <Chip size="small" variant="outlined" label="Visão Verdadeira: vê sem teste" />}
                                    {dt !== null && <Chip size="small" variant="outlined" label={`Percepção DT ${dt}`} />}
                                    {result && !result.passed && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Falhou: {result.text}</Typography>
                                    )}
                                    {dt !== null && (
                                        <Button size="small" variant="outlined" disabled={busy} onClick={() => { void testPerception(entry, dt); }} sx={{ textTransform: 'none' }}>
                                            Testar Percepção
                                        </Button>
                                    )}
                                    <Button size="small" color="inherit" disabled={busy} onClick={() => { void reveal(entry.hiderId, [ entry.observerId ]); }} sx={{ textTransform: 'none' }}>
                                        Revelar
                                    </Button>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}
