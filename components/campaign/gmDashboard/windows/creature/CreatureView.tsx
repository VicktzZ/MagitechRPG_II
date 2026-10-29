'use client';

import { Pets } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Stack, Typography, alpha } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { ReactElement, ReactNode } from 'react';
import StatMeter from '../../StatMeter';
import type { CreatureDice } from '@utils/combat/creatureDice';
import type { CreatureCard } from './creatureCard';
import CreatureDiceList from './CreatureDiceList';

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
            {children}
        </Typography>
    );
}

interface CreatureViewProps {
    creature: CreatureCard;
    /** O mestre rola um dado customizado da criatura (o resultado vai ao chat); sem isso a lista de dados é só de leitura */
    onRollDice?: (dice: CreatureDice) => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * Ficha de uma criatura personalizada para o mestre, só leitura: quem é, vida e mana base, atributos, perícias,
 * habilidades e magias. Editar abre o editor de criatura; excluir pede confirmação.
 */
export function CreatureView({ creature, onRollDice, onEdit, onDelete }: CreatureViewProps): ReactElement {
    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    src={creature.imageUrl || undefined}
                    alt=""
                    sx={{ width: 48, height: 48, bgcolor: theme => alpha(theme.palette.warning.main, 0.14), color: 'warning.main' }}
                >
                    <Pets />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography component="p" sx={{ fontFamily: font.display, fontSize: 18, fontWeight: 600 }}>
                        {creature.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Nv. {creature.level}{creature.type ? ` • ${creature.type}` : ''}
                    </Typography>
                </Box>
            </Box>

            {creature.description && (
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {creature.description}
                </Typography>
            )}

            <Stack spacing={1.25}>
                <StatMeter label="LP" ariaLabel={`Vida de ${creature.name}`} value={creature.stats.lp} max={creature.stats.maxLp} barColor={color.lp} />
                <StatMeter label="MP" ariaLabel={`Mana de ${creature.name}`} value={creature.stats.mp} max={creature.stats.maxMp} barColor={color.mp} />
                {creature.stats.ap > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Armadura (AP): <Box component="span" sx={{ fontFamily: font.mono, color: 'text.primary' }}>{creature.stats.ap}</Box>
                    </Typography>
                )}
            </Stack>

            {(creature.defenses.element || creature.defenses.weaknesses.length > 0 || creature.defenses.modifiers.length > 0) && (
                <Box data-testid="creature-defenses">
                    <Heading>Defesas</Heading>
                    <Stack spacing={0.5}>
                        {creature.defenses.element && (
                            <Typography variant="body2" color="text.secondary">
                                Elemento: <Box component="span" sx={{ color: 'text.primary' }}>{creature.defenses.element}</Box>
                            </Typography>
                        )}
                        {creature.defenses.weaknesses.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Fraquezas: <Box component="span" sx={{ color: 'text.primary' }}>{creature.defenses.weaknesses.join(', ')}</Box>
                            </Typography>
                        )}
                        {creature.defenses.modifiers.map(modifier => (
                            <Typography key={modifier} variant="body2" color="text.secondary">{modifier}</Typography>
                        ))}
                    </Stack>
                </Box>
            )}

            {creature.attributes.length > 0 && (
                <Box>
                    <Heading>Atributos</Heading>
                    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 1 }}>
                        {creature.attributes.map(attribute => (
                            <Box
                                key={attribute.key}
                                sx={{ p: 1, borderRadius: 2, bgcolor: 'background.raised', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}
                            >
                                <Typography component="dt" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    {attribute.label}
                                </Typography>
                                <Typography component="dd" sx={{ m: 0, fontFamily: font.mono, fontSize: 18 }}>
                                    {attribute.value}
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontFamily: font.mono, color: 'text.secondary' }}>
                                    mod {attribute.mod > 0 ? `+${attribute.mod}` : attribute.mod}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            <Box>
                <Heading>Perícias</Heading>
                {creature.expertises.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Nenhuma perícia com valor.</Typography>
                ) : (
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                        {creature.expertises.map(expertise => (
                            <Chip
                                key={expertise.name}
                                size="small"
                                variant="outlined"
                                label={`${expertise.name} ${expertise.value > 0 ? '+' : ''}${expertise.value}${expertise.attribute ? ` (${expertise.attribute})` : ''}`}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            <Box>
                <Heading>Habilidades ({creature.skills.length})</Heading>
                {creature.skills.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Nenhuma habilidade.</Typography>
                ) : (
                    <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                        {creature.skills.map(skill => (
                            <Box key={skill.id} component="li">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2" fontWeight={600}>{skill.name}</Typography>
                                    {skill.type && <Chip label={skill.type} size="small" sx={{ height: 20, fontSize: 12 }} />}
                                </Stack>
                                {skill.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{skill.description}</Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            <Box>
                <Heading>Magias ({creature.spells.length})</Heading>
                {creature.spells.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Nenhuma magia.</Typography>
                ) : (
                    <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                        {creature.spells.map(spell => (
                            <Box key={spell.id} component="li">
                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Typography variant="body2" fontWeight={600}>{spell.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: font.mono }}>
                                        {[ spell.level > 0 ? `Nv. ${spell.level}` : '', spell.element, `${spell.cost} MP` ].filter(Boolean).join(' • ')}
                                    </Typography>
                                </Stack>
                                {spell.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{spell.description}</Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            {creature.dices.length > 0 && (
                <Box>
                    <Heading>Dados ({creature.dices.length})</Heading>
                    <CreatureDiceList dices={creature.dices} onRoll={onRollDice} />
                </Box>
            )}

            <Divider />

            <Box>
                <Heading>Ações</Heading>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    <Button variant="outlined" size="small" onClick={onEdit}>Editar criatura</Button>
                    <Button variant="outlined" size="small" color="error" onClick={onDelete}>Excluir criatura</Button>
                </Stack>
            </Box>
        </Stack>
    );
}
