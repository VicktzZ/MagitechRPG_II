import type { ReactElement } from 'react';
import {
    Grid,
    IconButton,
    Paper,
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CampaignWidget, WidgetRecipe } from '@models';
import type { WidgetPatch } from './types';
import type { WidgetCatalogs } from './useWidgetCatalogs';
import RecipeInputsEditor from './RecipeInputsEditor';
import RecipeCostsEditor from './RecipeCostsEditor';
import RecipeOutputEditor from './RecipeOutputEditor';

interface RecipeCardProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    recipe: WidgetRecipe;
    rIdx: number;
    catalogs: WidgetCatalogs;
}

/** Cartão de edição de uma receita de crafting */
export default function RecipeCard({ widget, patch, recipe, rIdx, catalogs }: RecipeCardProps): ReactElement {
    return (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={10} sm={5}>
                    <TextField fullWidth size="small" label="Nome da receita" value={recipe.name}
                        onChange={(e) => {
                            const recipes = [ ...widget.recipes ];
                            recipes[rIdx] = { ...recipe, name: e.target.value };
                            patch({ recipes });
                        }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Descrição" value={recipe.description ?? ''}
                        onChange={(e) => {
                            const recipes = [ ...widget.recipes ];
                            recipes[rIdx] = { ...recipe, description: e.target.value };
                            patch({ recipes });
                        }} />
                </Grid>
                <Grid item xs={2} sm={1}>
                    <IconButton size="small" color="error"
                        onClick={() => patch({ recipes: widget.recipes.filter(r => r.id !== recipe.id) })}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Grid>
            </Grid>

            <RecipeInputsEditor
                widget={widget}
                recipe={recipe}
                rIdx={rIdx}
                patch={patch}
                catalogItemNames={catalogs.catalogItemNames}
            />
            <RecipeCostsEditor widget={widget} recipe={recipe} rIdx={rIdx} patch={patch} />
            <RecipeOutputEditor
                widget={widget}
                recipe={recipe}
                rIdx={rIdx}
                patch={patch}
                catalogItemNames={catalogs.catalogItemNames}
                findCatalogItem={catalogs.findCatalogItem}
                catalogWeapons={catalogs.catalogWeapons}
                catalogArmors={catalogs.catalogArmors}
            />
        </Paper>
    );
}
