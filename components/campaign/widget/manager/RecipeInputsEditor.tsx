import type { ReactElement } from 'react';
import {
    Autocomplete,
    Button,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NumberField } from '@components/misc';
import type { CampaignWidget, WidgetRecipe } from '@models';
import type { WidgetPatch } from './types';

interface RecipeInputsEditorProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    recipe: WidgetRecipe;
    rIdx: number;
    catalogItemNames: string[];
}

/** Ingredientes (do estoque) de uma receita de crafting */
export default function RecipeInputsEditor({ widget, patch, recipe, rIdx, catalogItemNames }: RecipeInputsEditorProps): ReactElement {
    return (
        <>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                Ingredientes (do estoque, por nome — digite livre ou escolha um item já estabelecido)
            </Typography>
            {recipe.inputs.map((input, iIdx) => (
                <Grid container spacing={1} key={input.id} alignItems="center" mt={0.25}>
                    <Grid item xs={7} sm={5}>
                        <Autocomplete
                            freeSolo
                            size="small"
                            options={catalogItemNames}
                            value={input.stockName}
                            onChange={(_, newValue) => {
                                const inputs = [ ...recipe.inputs ];
                                inputs[iIdx] = { ...input, stockName: newValue ?? '' };
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, inputs };
                                patch({ recipes });
                            }}
                            onInputChange={(_, newValue) => {
                                const inputs = [ ...recipe.inputs ];
                                inputs[iIdx] = { ...input, stockName: newValue };
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, inputs };
                                patch({ recipes });
                            }}
                            renderInput={(params) => <TextField {...params} label="Nome do item" />}
                        />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                        <NumberField fullWidth size="small" label="Qtd" min={1} value={input.quantity}
                            onChange={(quantity) => {
                                const inputs = [ ...recipe.inputs ];
                                inputs[iIdx] = { ...input, quantity };
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, inputs };
                                patch({ recipes });
                            }} />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                        <IconButton size="small" color="error"
                            onClick={() => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, inputs: recipe.inputs.filter(i => i.id !== input.id) };
                                patch({ recipes });
                            }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                size="small" startIcon={<AddIcon />} sx={{ mt: 0.5 }}
                onClick={() => {
                    const recipes = [ ...widget.recipes ];
                    recipes[rIdx] = { ...recipe, inputs: [ ...recipe.inputs, { id: crypto.randomUUID(), stockName: '', quantity: 1 } ] };
                    patch({ recipes });
                }}
            >
                Adicionar ingrediente
            </Button>
        </>
    );
}
