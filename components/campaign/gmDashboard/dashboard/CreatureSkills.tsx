import type { Combatant, Creature, Expertise } from '@models';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { completeCreatureExpertises } from '@utils/combat/creatureExpertises';
import { filterAndSortExpertises } from '@utils/expertiseList';
import type { ReactElement } from 'react';
import ExpertiseListControls, { ExpertiseNoResults, useExpertiseListState } from '../../ExpertiseListControls';
import CreatureExpertiseButton from './CreatureExpertiseButton';

interface CreatureSkillsProps {
    creature: Creature;
    combatant: Combatant;
    /** Rola a perícia pela criatura (regra da criatura: ⌊atributo/5⌋ d20) */
    onRoll: (expertiseName: string, expertise: Expertise) => Promise<void>;
}

/** As perícias de uma criatura em combate, com busca e ordem: um botão por perícia que rola e manda o resultado ao chat */
export default function CreatureSkills({ creature, combatant, onRoll }: CreatureSkillsProps): ReactElement {
    const entries: Array<[ string, Expertise ]> = Object.entries(completeCreatureExpertises<Expertise>(creature.expertises));
    const list = useExpertiseListState();
    const visible = filterAndSortExpertises(entries, { query: list.query, sort: list.sort, nameOf: ([ name ]) => name, valueOf: ([ , expertise ]) => expertise.value });

    if (entries.length === 0) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <Typography variant="body2" color="text.secondary">
                    Esta criatura não possui perícias configuradas.
                </Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={1.5}>
            <ExpertiseListControls state={list} shown={visible.length} total={entries.length} />
            {visible.length === 0 ? (
                <ExpertiseNoResults query={list.query} onClear={() => { list.setQuery(''); }} />
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    {visible.map(([ name, expertise ]) => (
                        <CreatureExpertiseButton
                            key={`${combatant.id}-${name}`}
                            name={name}
                            expertise={expertise}
                            onRoll={async () => await onRoll(name, expertise)}
                        />
                    ))}
                </Box>
            )}
        </Stack>
    );
}
