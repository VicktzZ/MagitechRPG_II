import { useCampaignContext } from '@contexts';
import type { Creature } from '@models';
import { Add, Pets } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { creatureCopiesInCombat, creatureTypeCounts, filterAndSortCreatures, summarizeCreatures } from '@utils/creatureList';
import { useMemo, useState, type ReactElement } from 'react';
import Section from '../../Section';
import CustomCreatureCard from './CustomCreatureCard';
import CreatureToolbar from './creatures/CreatureToolbar';
import SummonTemplatesDialog from './creatures/SummonTemplatesDialog';
import { useCreatureActions } from './creatures/useCreatureActions';
import { useCreatureListState } from './creatures/useCreatureListState';
import { useCreatureDiceRoll } from './useCreatureDiceRoll';

interface CustomCreaturesSectionProps {
    onView: (creature: Creature) => void;
    onEdit: (creature: Creature) => void;
    onDelete: (creatureId: string, creatureName: string) => void;
    /** Abre o editor para uma criatura nova */
    onCreate: () => void;
}

/** A busca, o filtro de tipo e a ordem só valem a pena a partir de tantas criaturas */
const TOOLBAR_FROM = 4;

/**
 * Criaturas customizadas da campanha, para o mestre manipular num lugar só: cartões em grade com o essencial à vista e a ficha completa que abre no próprio cartão, busca,
 * filtro por tipo, ordem, e ações rápidas (nova, ver em janela, editar, duplicar, excluir, rolar um dado dela e, com combate ativo, adicionar ao combate).
 */
export default function CustomCreaturesSection({ onView, onEdit, onDelete, onCreate }: CustomCreaturesSectionProps): ReactElement {
    const { campaign } = useCampaignContext();
    const state = useCreatureListState();
    const actions = useCreatureActions();
    const rollDice = useCreatureDiceRoll();
    const [ templatesOpen, setTemplatesOpen ] = useState(false);

    const creatures = useMemo(() => campaign.custom?.creatures ?? [], [ campaign.custom?.creatures ]);
    const visible = useMemo(() => filterAndSortCreatures(creatures, { query: state.query, type: state.type, sort: state.sort }), [ creatures, state.query, state.type, state.sort ]);
    const types = useMemo(() => creatureTypeCounts(creatures), [ creatures ]);
    const summary = useMemo(() => summarizeCreatures(creatures), [ creatures ]);
    const combatants = campaign.session?.combat?.isActive ? campaign.session.combat.combatants : undefined;

    return (
        <Section
            title="Criaturas customizadas"
            icon={<Pets sx={{ color: 'text.secondary' }} />}
            action={(
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined" color="secondary" startIcon={<Pets />} onClick={() => { setTemplatesOpen(true); }} sx={{ textTransform: 'none' }} data-testid="open-summon-templates">Modelos de invocação</Button>
                    <Button size="small" variant="contained" startIcon={<Add />} onClick={onCreate} sx={{ textTransform: 'none' }}>Nova criatura</Button>
                </Box>
            )}
        >
            <SummonTemplatesDialog
                open={templatesOpen}
                onClose={() => { setTemplatesOpen(false); }}
                creatingId={actions.creatingSummonId}
                onCreate={(template) => { void actions.createSummon(template); }}
            />
            {creatures.length === 0 ? (
                <Box sx={{ py: 2 }} data-testid="creatures-empty">
                    <Typography color="text.secondary">Nenhuma criatura criada para esta campanha ainda.</Typography>
                    <Typography variant="body2" color="text.secondary">Crie uma com o botão &quot;Nova criatura&quot;: ela fica aqui e pode entrar no combate com um clique.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" data-testid="creatures-summary">
                        {summary.total} {summary.total === 1 ? 'criatura' : 'criaturas'} • nível médio {String(summary.averageLevel).replace('.', ',')} • maior nível {summary.highestLevel}
                    </Typography>

                    {creatures.length >= TOOLBAR_FROM && (
                        <CreatureToolbar state={state} types={types} total={creatures.length} shown={visible.length} visibleIds={visible.map(creature => creature.id)} />
                    )}

                    {visible.length === 0 ? (
                        <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }} data-testid="creatures-no-match">
                            <Typography color="text.secondary">Nenhuma criatura encontrada.</Typography>
                            <Button size="small" variant="outlined" color="secondary" onClick={state.clearFilters} sx={{ textTransform: 'none' }}>Limpar busca e filtros</Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', alignItems: 'start' }} data-testid="creatures-grid">
                            {visible.map(creature => (
                                <CustomCreatureCard
                                    key={creature.id}
                                    creature={creature}
                                    expanded={state.expanded.has(creature.id)}
                                    onToggle={state.toggle}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onDuplicate={creatureToCopy => { void actions.duplicate(creatureToCopy); }}
                                    onAddToCombat={actions.combatActive ? creatureToAdd => { void actions.addToCombat(creatureToAdd); } : undefined}
                                    onRollDice={(rolling, dice) => { void rollDice(rolling, dice); }}
                                    copiesInCombat={creatureCopiesInCombat(creature.id, combatants)}
                                    busy={actions.addingToCombat || actions.duplicatingId !== null}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            )}
        </Section>
    );
}
