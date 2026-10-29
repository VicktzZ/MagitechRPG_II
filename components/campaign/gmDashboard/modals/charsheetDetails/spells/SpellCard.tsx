import ElementIcon from '@components/misc/ElementIcon';
import StageLadder from '@components/spells/StageLadder';
import { Delete, ExpandMore } from '@mui/icons-material';
import { alpha, Box, ButtonBase, Chip, Collapse, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { color } from '@themes/tokens';
import type { SpellProgress, SpellStage } from '@utils/spellStages';
import type { SpellDTO } from '@models/dtos';
import type { Spell } from '@models/entities';
import type { ReactElement } from 'react';

interface SpellCardProps {
    spell: SpellDTO | Spell;
    progress: SpellProgress;
    expanded: boolean;
    onToggle: () => void;
    /** Mestre em edição: define o estágio liberado direto (não gasta ponto de evolução) */
    onSetUnlocked?: (stage: SpellStage) => void;
    /** Mestre em edição: tira a magia da ficha */
    onDelete?: () => void;
}

/** Nível e estágio são escalas ordenadas: neutros que clareiam até o âmbar no topo (o número vai sempre em texto) */
const levelColor = (level: number): string => (level >= 4 ? color.amberHover : level === 3 ? color.amber : level === 2 ? color.ink : color.inkMuted);

/** Uma magia da ficha na visão do mestre: resumo na linha e, aberta, todos os estágios (liberados e bloqueados) */
export default function SpellCard({ spell, progress, expanded, onToggle, onSetUnlocked, onDelete }: SpellCardProps): ReactElement {
    const level = Number(spell.level) || 1;
    const accent = levelColor(level);
    const id = `gm-spell-${String(spell.id || spell.name).replace(/\W+/g, '-')}`;
    const baseCost = Number(spell.mpCost) || 0;
    const complete = progress.unlocked === progress.count;

    return (
        <Box
            data-testid="gm-spell-card"
            data-spell={spell.name}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised', transition: 'border-color 120ms', '&:hover': { borderColor: color.borderStrong } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                <ButtonBase
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-controls={`${id}-body`}
                    sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25, textAlign: 'left', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                    <Box sx={{ p: 0.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'flex', flexShrink: 0 }}>
                        <ElementIcon element={spell.element} colored sx={{ fontSize: '1.25rem' }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accent, lineHeight: 1.25 }}>{spell.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
                            <Chip size="small" label={`Nível ${level}`} sx={{ bgcolor: alpha(accent, 0.14), color: accent, fontWeight: 600 }} />
                            <Chip size="small" variant="outlined" label={spell.element} sx={{ borderColor: 'divider', fontWeight: 600 }} />
                            {spell.execution && <Chip size="small" label={spell.execution} sx={{ bgcolor: 'action.hover' }} />}
                            {spell.range && <Chip size="small" label={spell.range} sx={{ bgcolor: 'action.hover' }} />}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Tooltip title="Custo base de MP; cada estágio soma um extra">
                            <Chip size="small" label={`${baseCost} MP`} sx={{ bgcolor: alpha(color.mp, 0.14), color: color.mp, fontWeight: 600 }} />
                        </Tooltip>
                        {progress.enabled && progress.count > 1 && (
                            <Chip
                                size="small"
                                variant="outlined"
                                data-testid="gm-spell-progress"
                                label={`${progress.unlocked} de ${progress.count} estágios`}
                                sx={complete
                                    ? { borderColor: color.amberLine, color: 'primary.main' }
                                    : { borderColor: 'divider', color: 'text.secondary' }}
                            />
                        )}
                    </Box>
                    <ExpandMore sx={{ color: 'text.secondary', transform: expanded ? 'none' : 'rotate(-90deg)', transition: 'transform 120ms', flexShrink: 0 }} />
                </ButtonBase>
                {onDelete && (
                    <Tooltip title="Excluir magia da ficha">
                        <IconButton size="small" color="error" aria-label={`Excluir ${spell.name}`} onClick={onDelete}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            <Collapse in={expanded} unmountOnExit>
                <Box id={`${id}-body`} sx={{ px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {spell.type && (
                        <Typography variant="caption" color="text.secondary">{`Tipo: ${spell.type}`}</Typography>
                    )}

                    {onSetUnlocked && progress.enabled && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Estágio liberado</Typography>
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={progress.purchased}
                                aria-label={`Estágio liberado de ${spell.name}`}
                                onChange={(_, stage: SpellStage | null) => { if (stage) onSetUnlocked(stage) }}
                            >
                                {progress.stages.map(info => (
                                    <ToggleButton
                                        key={info.stage}
                                        value={info.stage}
                                        // A Maestria só abre para quem tem a maestria no elemento: nem o mestre a libera por este ajuste
                                        disabled={progress.masteryRequired && info.rule.access === 'mastery'}
                                        aria-label={`Liberar até o ${info.label} de ${spell.name}`}
                                        sx={{ textTransform: 'none', px: 1.5 }}
                                    >
                                        {info.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Typography variant="caption" color="text.secondary">
                                {progress.masteryRequired
                                    ? `Ajuste direto do mestre: não gasta ponto de evolução. A Maestria só abre para quem tem a maestria elemental em ${String(spell.element).toLowerCase()}.`
                                    : 'Ajuste direto do mestre: não gasta ponto de evolução.'}
                            </Typography>
                        </Box>
                    )}

                    <StageLadder spell={spell} progress={progress} />
                </Box>
            </Collapse>
        </Box>
    );
}
