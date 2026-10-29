import { useState, type ReactElement } from 'react';
import { Box, Button, Chip, Collapse, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import type { CampaignWidget } from '@models';
import RecipesDialog from './RecipesDialog';

interface CraftingSectionProps {
    widget: CampaignWidget;
    isFinished: boolean;
    hasCharsheet: boolean;
    onCraft: (recipeId: string, quantity: number) => Promise<void>;
}

/** Crafting (beta): últimas fabricações e acesso ao catálogo de receitas */
export default function CraftingSection({ widget, isFinished, hasCharsheet, onCraft }: CraftingSectionProps): ReactElement {
    const [ craftOpen, setCraftOpen ] = useState(false);
    const [ craftRecipesModalOpen, setCraftRecipesModalOpen ] = useState(false);

    return (
        <>
            {(widget.recipes?.length ?? 0) > 0 && (
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{ cursor: 'pointer', width: 'fit-content' }}
                        onClick={() => setCraftOpen(prev => !prev)}
                    >
                        <ScienceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Crafting ({widget.recipes.length})
                        </Typography>
                        <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.75rem', fontWeight: 700 }} />
                        <ExpandMoreIcon
                            sx={{ fontSize: 14, color: 'text.secondary', transform: craftOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        />
                    </Box>
                    <Collapse in={craftOpen}>
                        <Box display="flex" flexDirection="column" gap={0.75} mt={0.75}>
                            {(widget.craftLog?.length ?? 0) > 0 && (
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Últimas Fabricações
                                    </Typography>
                                    {widget.craftLog!.slice(0, 5).map(entry => (
                                        <Box key={entry.id} display="flex" justifyContent="space-between" gap={1}>
                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                <strong>{entry.userName}</strong> fabricou {entry.recipeName} x{entry.quantity}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" flexShrink={0}>
                                                {new Date(entry.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ScienceIcon fontSize="small" />}
                                onClick={() => setCraftRecipesModalOpen(true)}
                                sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
                            >
                                Ver Receitas Disponíveis ({widget.recipes.length})
                            </Button>
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* ── Modal: catálogo completo de receitas ── */}
            <RecipesDialog
                open={craftRecipesModalOpen}
                onClose={() => setCraftRecipesModalOpen(false)}
                widget={widget}
                isFinished={isFinished}
                hasCharsheet={hasCharsheet}
                onCraft={onCraft}
            />
        </>
    );
}
