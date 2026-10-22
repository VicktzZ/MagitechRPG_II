import type { ReactElement } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetCatalogs } from './useWidgetCatalogs';
import RecipeCard from './RecipeCard';
import type { WidgetPatch } from './types';

interface CraftingSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    catalogs: WidgetCatalogs;
}

/** Seção de receitas de crafting (beta) do widget */
export default function CraftingSection({ widget, patch, catalogs }: CraftingSectionProps): ReactElement {
    return (
        <SectionAccordion
            summary={(
                <Typography component="div" fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                    <ScienceIcon fontSize="small" /> Crafting ({widget.recipes?.length ?? 0})
                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.75rem' }} />
                </Typography>
            )}
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {(widget.recipes ?? []).map((recipe, rIdx) => (
                    <RecipeCard
                        key={recipe.id}
                        widget={widget}
                        patch={patch}
                        recipe={recipe}
                        rIdx={rIdx}
                        catalogs={catalogs}
                    />
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        recipes: [
                            ...(widget.recipes ?? []),
                            {
                                id: crypto.randomUUID(),
                                name: 'Nova Receita',
                                inputs: [],
                                resourceCosts: [],
                                output: { name: 'Novo Item', quantity: 1 }
                            }
                        ]
                    })}
                >
                    Adicionar receita
                </Button>
            </Box>
        </SectionAccordion>
    );
}
