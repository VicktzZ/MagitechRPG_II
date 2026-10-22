import type { ReactElement } from 'react';
import {
    Button,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NumberField } from '@components/misc';
import type { CampaignWidget, WidgetRecipe } from '@models';
import type { WidgetPatch } from './types';

interface RecipeCostsEditorProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    recipe: WidgetRecipe;
    rIdx: number;
}

/** Custo em recursos do widget de uma receita de crafting */
export default function RecipeCostsEditor({ widget, patch, recipe, rIdx }: RecipeCostsEditorProps): ReactElement {
    return (
        <>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                Custo em recursos (opcional)
            </Typography>
            {(recipe.resourceCosts ?? []).map((cost, cIdx) => (
                <Grid container spacing={1} key={cost.id} alignItems="center" mt={0.25}>
                    <Grid item xs={7} sm={5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Recurso</InputLabel>
                            <Select
                                label="Recurso"
                                value={cost.resourceId}
                                onChange={(e) => {
                                    const resourceCosts = [ ...(recipe.resourceCosts ?? []) ];
                                    resourceCosts[cIdx] = { ...cost, resourceId: e.target.value };
                                    const recipes = [ ...widget.recipes ];
                                    recipes[rIdx] = { ...recipe, resourceCosts };
                                    patch({ recipes });
                                }}
                            >
                                {widget.resources.map(r => (
                                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3} sm={2}>
                        <NumberField fullWidth size="small" label="Custo" min={1} value={cost.amount}
                            onChange={(amount) => {
                                const resourceCosts = [ ...(recipe.resourceCosts ?? []) ];
                                resourceCosts[cIdx] = { ...cost, amount };
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, resourceCosts };
                                patch({ recipes });
                            }} />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                        <IconButton size="small" color="error"
                            onClick={() => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, resourceCosts: (recipe.resourceCosts ?? []).filter(c => c.id !== cost.id) };
                                patch({ recipes });
                            }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            {widget.resources.length > 0 && (
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ mt: 0.5 }}
                    onClick={() => {
                        const recipes = [ ...widget.recipes ];
                        recipes[rIdx] = {
                            ...recipe,
                            resourceCosts: [ ...(recipe.resourceCosts ?? []), { id: crypto.randomUUID(), resourceId: widget.resources[0].id, amount: 1 } ]
                        };
                        patch({ recipes });
                    }}
                >
                    Adicionar custo
                </Button>
            )}
        </>
    );
}
