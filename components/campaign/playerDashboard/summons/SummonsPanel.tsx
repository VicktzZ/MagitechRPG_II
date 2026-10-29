'use client';

import { useCampaignContext } from '@contexts';
import { Dialog, DialogContent, DialogTitle, Box } from '@mui/material';
import { Pets } from '@mui/icons-material';
import type { Combatant } from '@models';
import { attackTargetsFor } from '@utils/combat/summonAttack';
import { useState, type ReactElement } from 'react';
import Section from '../../Section';
import SummonAttackForm, { emptySummonAttackDraft, toSummonAttackChoice, type SummonAttackDraft } from './SummonAttackForm';
import SummonCard from './SummonCard';
import { useSummons } from './useSummons';

/**
 * "Seus invocados": no painel do jogador, só em combate e só para quem controla algum. Cada invocado é uma criatura do combate (com iniciativa própria) que o mestre pôs sob o controle
 * do jogador (`Adicionar ao combate` → "Invocado por"): ele passa o turno, gasta as ações, rola os dados e declara os ataques; o mestre resolve.
 */
export default function SummonsPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { summons, creatureOf, busyKey, spend, passTurn, rollDice, attack } = useSummons();
    const [ attacking, setAttacking ] = useState<Combatant | null>(null);
    const [ draft, setDraft ] = useState<SummonAttackDraft>(emptySummonAttackDraft);

    const combat = campaign?.session?.combat;
    if (!combat?.isActive || summons.length === 0) return null;

    const acting = combat.phase === 'ACTION';
    const currentId = combat.combatants?.[combat.currentTurnIndex]?.id;
    const close = (): void => { setAttacking(null); setDraft(emptySummonAttackDraft()); };

    const submit = async (): Promise<void> => {
        const choice = toSummonAttackChoice(draft);
        if (!attacking || !choice) return;
        if (await attack(attacking, choice)) close();
    };

    return (
        <Section id="invocados" title="Seus invocados" icon={<Pets sx={{ color: 'text.secondary' }} />}>
            <Box component="ul" aria-label="Seus invocados" sx={{ m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }} data-testid="summons-panel">
                {summons.map(summon => (
                    <SummonCard
                        key={summon.id}
                        summon={summon}
                        creature={creatureOf(summon)}
                        summonerName={combat.combatants?.find(candidate => candidate.id === summon.summonerId)?.name}
                        current={acting && summon.id === currentId}
                        acting={acting}
                        busyKey={busyKey}
                        onSpend={(slot, available) => { void spend(summon, slot, available); }}
                        onPassTurn={() => { void passTurn(summon); }}
                        onRollDice={(dice) => { void rollDice(summon, dice); }}
                        onAttack={() => { setAttacking(summon); }}
                    />
                ))}
            </Box>

            <Dialog open={attacking !== null} onClose={close} fullWidth maxWidth="xs" aria-labelledby="summon-attack-title">
                <DialogTitle id="summon-attack-title">{attacking ? `Atacar com ${attacking.name}` : 'Atacar'}</DialogTitle>
                <DialogContent>
                    {attacking && (
                        <SummonAttackForm
                            summonName={attacking.name}
                            targets={attackTargetsFor(combat.combatants, attacking.id)}
                            creature={creatureOf(attacking)}
                            draft={draft}
                            onChange={setDraft}
                            busy={busyKey === `${attacking.id}:attack`}
                            onSubmit={() => { void submit(); }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Section>
    );
}
