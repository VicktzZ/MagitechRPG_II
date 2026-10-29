'use client';

import { Box, Chip, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { CreatureDice } from '@utils/combat/creatureDice';
import type { ReactElement, ReactNode } from 'react';
import type { CreatureCard } from '../../windows/creature/creatureCard';
import CreatureDiceList from '../../windows/creature/CreatureDiceList';

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h4" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>
            {children}
        </Typography>
    );
}

interface CreatureCardDetailsProps {
    creature: CreatureCard;
    /** Rola um dado customizado da criatura (o resultado vai ao chat); sem isso a lista de dados é só de leitura */
    onRollDice?: (dice: CreatureDice) => void;
}

/**
 * Tudo da criatura num cartão aberto, sem abrir a janela dela: atributos, perícias com valor, defesas (só o mestre vê esta seção), habilidades, magias e dados com o botão de
 * rolar. Duas colunas quando o cartão está largo (container query: a largura útil depende do chat encaixado), uma só nas telas estreitas.
 */
export default function CreatureCardDetails({ creature, onRollDice }: CreatureCardDetailsProps): ReactElement {
    const { defenses } = creature;
    const hasDefenses = Boolean(defenses.element) || defenses.weaknesses.length > 0 || defenses.modifiers.length > 0;

    return (
        <Box sx={{ containerType: 'inline-size' }} data-testid="creature-details">
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr', '@container (min-width: 560px)': { gridTemplateColumns: '1fr 1fr' } }}>
                <Stack spacing={2}>
                    {creature.attributes.length > 0 && (
                        <Box>
                            <Heading>Atributos</Heading>
                            <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 0.75 }}>
                                {creature.attributes.map(attribute => (
                                    <Box key={attribute.key} sx={{ px: 1, py: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                        <Typography component="dt" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{attribute.label}</Typography>
                                        <Typography component="dd" sx={{ m: 0, fontFamily: font.mono, fontSize: 16 }}>{attribute.value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Box>
                        <Heading>Perícias com valor</Heading>
                        {creature.expertises.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Nenhuma.</Typography>
                        ) : (
                            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
                                {creature.expertises.map(expertise => (
                                    <Chip key={expertise.name} size="small" variant="outlined" label={`${expertise.name} ${expertise.value > 0 ? '+' : ''}${expertise.value}`} />
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {hasDefenses && (
                        <Box data-testid="creature-card-defenses">
                            <Heading>Defesas</Heading>
                            <Stack spacing={0.25}>
                                {defenses.element && (
                                    <Typography variant="body2" color="text.secondary">Elemento: <Box component="span" sx={{ color: 'text.primary' }}>{defenses.element}</Box></Typography>
                                )}
                                {defenses.weaknesses.length > 0 && (
                                    <Typography variant="body2" color="text.secondary">Fraquezas: <Box component="span" sx={{ color: 'text.primary' }}>{defenses.weaknesses.join(', ')}</Box></Typography>
                                )}
                                {defenses.modifiers.map(modifier => (<Typography key={modifier} variant="body2" color="text.secondary">{modifier}</Typography>))}
                            </Stack>
                        </Box>
                    )}
                </Stack>

                <Stack spacing={2}>
                    <Box>
                        <Heading>Habilidades ({creature.skills.length})</Heading>
                        {creature.skills.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Nenhuma.</Typography>
                        ) : (
                            <Stack component="ul" spacing={0.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                                {creature.skills.map(skill => (
                                    <Box key={skill.id} component="li">
                                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Typography variant="body2" fontWeight={600}>{skill.name}</Typography>
                                            {skill.type && <Chip label={skill.type} size="small" sx={{ height: 20, fontSize: 12 }} />}
                                        </Stack>
                                        {skill.description && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{skill.description}</Typography>}
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box>
                        <Heading>Magias ({creature.spells.length})</Heading>
                        {creature.spells.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Nenhuma.</Typography>
                        ) : (
                            <Stack component="ul" spacing={0.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                                {creature.spells.map(spell => (
                                    <Box key={spell.id} component="li">
                                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Typography variant="body2" fontWeight={600}>{spell.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: font.mono }}>
                                                {[ spell.level > 0 ? `Nv. ${spell.level}` : '', spell.element, `${spell.cost} MP` ].filter(Boolean).join(' • ')}
                                            </Typography>
                                        </Stack>
                                        {spell.description && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{spell.description}</Typography>}
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box>
                        <Heading>Dados ({creature.dices.length})</Heading>
                        {creature.dices.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Nenhum. Cadastre na aba Dados do editor.</Typography>
                        ) : (
                            <CreatureDiceList dices={creature.dices} onRoll={onRollDice} />
                        )}
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
