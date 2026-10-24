import ElementIcon from '@components/misc/ElementIcon';
import { Box, Chip, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { SpellOverview } from '@utils/spellsOverview';
import type { ReactElement, ReactNode } from 'react';

interface SpellsOverviewProps {
    overview: SpellOverview;
    spellSpace: number;
    elementalMastery?: string | null;
    /** Pontos de evolução da ficha; `null` onde a regra de evolução não vale */
    evolutionPoints: number | null;
    /** Estágios liberados e total de estágios das magias; `null` onde a regra de evolução não vale */
    stages: { unlocked: number; total: number } | null;
}

function Tile({ label, children, hint }: { label: string; children: ReactNode; hint?: string }): ReactElement {
    return (
        <Box title={hint} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.raised', border: '1px solid', borderColor: 'divider', minWidth: 0 }}>
            <Typography component="div" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
            {children}
        </Box>
    );
}

const value = { fontFamily: font.mono, fontSize: 20, lineHeight: 1.3 } as const;

/** Resumo das magias da ficha para o mestre: quantas são, de que nível e elemento, e quanto já evoluíram */
export default function SpellsOverview({ overview, spellSpace, elementalMastery, evolutionPoints, stages }: SpellsOverviewProps): ReactElement {
    return (
        <Box
            data-testid="spells-overview"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1 }}
        >
            <Tile label="Magias" hint="Magias conhecidas e espaços livres para aprender outras">
                <Typography sx={{ ...value, color: 'text.primary' }}>
                    {overview.total}
                    <Typography component="span" sx={{ ml: 0.75, fontSize: 12, color: 'text.secondary', fontFamily: font.text }}>
                        {spellSpace > 0 ? `${spellSpace} ${spellSpace === 1 ? 'espaço livre' : 'espaços livres'}` : 'sem espaço livre'}
                    </Typography>
                </Typography>
            </Tile>

            <Tile label="Por nível" hint="Quantidade de magias de cada nível">
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {([ 1, 2, 3, 4 ] as const).map(level => (
                        <Box key={level} sx={{ textAlign: 'center' }}>
                            <Typography sx={{ ...value, fontSize: 18, color: overview.byLevel[level] ? 'text.primary' : 'text.disabled' }}>{overview.byLevel[level]}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Nv {level}</Typography>
                        </Box>
                    ))}
                </Box>
            </Tile>

            <Tile label="Custo médio de MP" hint="Média do custo base das magias, sem o extra dos estágios">
                <Typography sx={{ ...value, color: 'info.light' }}>
                    {overview.averageMpCost === null ? '-' : overview.averageMpCost}
                    {overview.averageMpCost !== null && <Typography component="span" sx={{ ml: 0.5, fontSize: 12, color: 'text.secondary', fontFamily: font.text }}>MP</Typography>}
                </Typography>
            </Tile>

            <Tile label="Maestria elemental" hint="Quem tem maestria no elemento ganha a Maestria das magias de nível 4 dele ao liberar o estágio 2">
                {elementalMastery ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <ElementIcon element={elementalMastery} colored sx={{ fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 600 }}>{elementalMastery}</Typography>
                    </Box>
                ) : (
                    <Typography color="text.secondary">Nenhuma</Typography>
                )}
            </Tile>

            {stages && (
                <Tile label="Estágios liberados" hint="Estágios das magias que a ficha já liberou, do total que as magias têm">
                    <Typography sx={{ ...value, color: 'primary.main' }} data-testid="spells-stages-total">
                        {stages.unlocked}
                        <Typography component="span" sx={{ ml: 0.5, fontSize: 12, color: 'text.secondary', fontFamily: font.text }}>{`de ${stages.total}`}</Typography>
                    </Typography>
                </Tile>
            )}

            {evolutionPoints !== null && (
                <Tile label="Pontos de evolução" hint="Pontos que o jogador ainda pode gastar para evoluir magias">
                    <Typography sx={{ ...value, color: 'text.primary' }} data-testid="spells-evolution-points">{evolutionPoints}</Typography>
                </Tile>
            )}

            {overview.elements.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {overview.elements.map(entry => (
                        <Chip
                            key={entry.element}
                            size="small"
                            variant="outlined"
                            icon={<ElementIcon element={entry.element} colored />}
                            label={`${entry.element} ${entry.count}`}
                            sx={{ borderColor: 'divider' }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
