import type { ReactElement } from 'react';
import {
    Autocomplete,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { NumberField } from '@components/misc';
import type { Armor, CampaignWidget, Weapon, WidgetRecipe } from '@models';
import type { WidgetPatch } from './types';
import type { CatalogItem } from './useWidgetCatalogs';

interface RecipeOutputEditorProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    recipe: WidgetRecipe;
    rIdx: number;
    catalogItemNames: string[];
    findCatalogItem: (name: string) => CatalogItem | undefined;
    catalogWeapons: Array<Partial<Weapon>>;
    catalogArmors: Array<Partial<Armor>>;
}

/** Item produzido (genérico, arma ou armadura) por uma receita de crafting */
export default function RecipeOutputEditor({ widget, patch, recipe, rIdx, catalogItemNames, findCatalogItem, catalogWeapons, catalogArmors }: RecipeOutputEditorProps): ReactElement {
    return (
        <>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                Item produzido
            </Typography>
            <Grid container spacing={1} mt={0.25} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            label="Tipo"
                            value={recipe.output.kind ?? 'item'}
                            onChange={(e) => {
                                const kind = e.target.value as 'item' | 'weapon' | 'armor';
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = {
                                    ...recipe,
                                    output: { name: '', quantity: 1, kind: kind === 'item' ? undefined : kind }
                                };
                                patch({ recipes });
                            }}
                        >
                            <MenuItem value="item">Item genérico</MenuItem>
                            <MenuItem value="weapon">Arma</MenuItem>
                            <MenuItem value="armor">Armadura</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {(recipe.output.kind ?? 'item') === 'item' ? (
                <Grid container spacing={1} mt={0.25}>
                    <Grid item xs={6} sm={4}>
                        <Autocomplete
                            freeSolo
                            size="small"
                            options={catalogItemNames}
                            value={recipe.output.name}
                            onChange={(_, newValue) => {
                                const name = newValue ?? '';
                                const matched = findCatalogItem(name);
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = {
                                    ...recipe,
                                    output: {
                                        ...recipe.output,
                                        name,
                                        weight: matched?.weight ?? recipe.output.weight,
                                        description: matched?.description ?? recipe.output.description
                                    }
                                };
                                patch({ recipes });
                            }}
                            onInputChange={(_, newValue) => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, name: newValue } };
                                patch({ recipes });
                            }}
                            renderInput={(params) => <TextField {...params} label="Nome" />}
                        />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                        <NumberField fullWidth size="small" label="Qtd" min={1} value={recipe.output.quantity}
                            onChange={(quantity) => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, quantity } };
                                patch({ recipes });
                            }} />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                        <NumberField fullWidth size="small" label="Peso" min={0} allowDecimal value={recipe.output.weight ?? 0}
                            onChange={(weight) => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, weight } };
                                patch({ recipes });
                            }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Descrição" value={recipe.output.description ?? ''}
                            onChange={(e) => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, description: e.target.value } };
                                patch({ recipes });
                            }} />
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={1} mt={0.25}>
                    <Grid item xs={9} sm={9}>
                        {(() => {
                            const catalogOptions: Array<Partial<Weapon> | Partial<Armor>> =
                                recipe.output.kind === 'weapon' ? catalogWeapons : catalogArmors;
                            return (
                                <Autocomplete
                                    size="small"
                                    options={catalogOptions}
                                    getOptionLabel={(opt) => opt?.name ?? ''}
                                    isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                    value={catalogOptions.find(opt => opt.name === recipe.output.name) ?? null}
                                    onChange={(_, selected) => {
                                        const recipes = [ ...widget.recipes ];
                                        recipes[rIdx] = {
                                            ...recipe,
                                            output: {
                                                ...recipe.output,
                                                name: selected?.name ?? '',
                                                weight: selected?.weight,
                                                description: selected?.description,
                                                itemData: selected ?? undefined
                                            }
                                        };
                                        patch({ recipes });
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label={recipe.output.kind === 'weapon' ? 'Arma (catálogo)' : 'Armadura (catálogo)'} />
                                    )}
                                />
                            );
                        })()}
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <NumberField fullWidth size="small" label="Qtd" min={1} value={recipe.output.quantity}
                            onChange={(quantity) => {
                                const recipes = [ ...widget.recipes ];
                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, quantity } };
                                patch({ recipes });
                            }} />
                    </Grid>
                    {!recipe.output.name && (
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Armas/armaduras precisam ser escolhidas de um item já cadastrado (não é possível digitar livremente,
                                pois carregam estatísticas de combate completas).
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            )}
        </>
    );
}
