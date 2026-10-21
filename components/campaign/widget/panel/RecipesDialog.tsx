import { useState, type ReactElement } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Menu,
    MenuItem,
    Paper,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import type { CampaignWidget } from '@models';

interface RecipesDialogProps {
    open: boolean;
    onClose: () => void;
    widget: CampaignWidget;
    isFinished: boolean;
    /** O usuário tem uma ficha na campanha (destino de armas/armaduras e de itens sem estoque) */
    hasCharsheet: boolean;
    onCraft: (recipeId: string, quantity: number) => Promise<void>;
}

/** Modal com o catálogo completo de receitas e o menu de multiplicador (1x/3x/5x/10x) */
export default function RecipesDialog({ open, onClose, widget, isFinished, hasCharsheet, onCraft }: RecipesDialogProps): ReactElement {
    const theme = useTheme();
    const [ craftMultipliers, setCraftMultipliers ] = useState<Record<string, number>>({});
    const [ multiplierMenu, setMultiplierMenu ] = useState<{ recipeId: string; anchor: HTMLElement } | null>(null);

    const getMultiplier = (recipeId: string): number => craftMultipliers[recipeId] ?? 1;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle>Receitas Disponíveis</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={0.75}>
                        {widget.recipes.map(recipe => {
                            const multiplier = getMultiplier(recipe.id);
                            const missingInputs = recipe.inputs.filter(input => {
                                const stockItem = widget.stock.find(s => s.name.toLowerCase() === input.stockName.toLowerCase());
                                return !stockItem || stockItem.quantity < input.quantity * multiplier;
                            });
                            const missingResources = (recipe.resourceCosts ?? []).filter(cost => {
                                const resource = widget.resources.find(r => r.id === cost.resourceId);
                                return !resource || resource.value < cost.amount * multiplier;
                            });
                            const outputKind = recipe.output.kind ?? 'item';
                            const noDestination = (outputKind !== 'item' || widget.showStock === false) && !hasCharsheet;
                            const noDestinationMsg = outputKind !== 'item'
                                ? 'Armas/armaduras vão para o inventário pessoal — entre com uma ficha para fabricar'
                                : 'Este widget não possui estoque próprio — entre com uma ficha para fabricar';
                            const canCraft = missingInputs.length === 0 && missingResources.length === 0 && !noDestination;
                            return (
                                <Paper key={recipe.id} variant="outlined" sx={{ p: 1 }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                        <Typography variant="caption" fontWeight={700}>
                                            {recipe.name}
                                            {outputKind !== 'item' && (
                                                <Chip
                                                    label={outputKind === 'weapon' ? 'Arma' : 'Armadura'}
                                                    size="small"
                                                    sx={{ ml: 0.5, height: 14, fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Tooltip title={noDestination ? noDestinationMsg : ''}>
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={isFinished || noDestination}
                                                        onClick={(e) => setMultiplierMenu({ recipeId: recipe.id, anchor: e.currentTarget })}
                                                        sx={{ minWidth: 0, px: 0.75, fontSize: '0.75rem', py: 0.25 }}
                                                    >
                                                        {multiplier}x
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title={noDestination ? noDestinationMsg : ''}>
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        disabled={!canCraft || isFinished}
                                                        onClick={async () => await onCraft(recipe.id, getMultiplier(recipe.id))}
                                                        sx={{ minWidth: 0, fontSize: '0.75rem', py: 0.25 }}
                                                    >
                                                        Fabricar
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    {recipe.description && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {recipe.description}
                                        </Typography>
                                    )}
                                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                        {recipe.inputs.map(input => {
                                            const insufficient = missingInputs.includes(input);
                                            return (
                                                <Chip
                                                    key={input.id}
                                                    label={`${input.stockName} x${input.quantity * multiplier}`}
                                                    size="small"
                                                    sx={{
                                                        height: 18, fontSize: '0.75rem',
                                                        bgcolor: alpha(insufficient ? theme.palette.error.main : theme.palette.success.main, 0.1),
                                                        color: insufficient ? 'error.main' : 'success.main'
                                                    }}
                                                />
                                            );
                                        })}
                                        {(recipe.resourceCosts ?? []).map(cost => {
                                            const resource = widget.resources.find(r => r.id === cost.resourceId);
                                            const insufficient = missingResources.includes(cost);
                                            return (
                                                <Chip
                                                    key={cost.id}
                                                    label={`${resource?.name ?? '?'} -${cost.amount * multiplier}`}
                                                    size="small"
                                                    sx={{
                                                        height: 18, fontSize: '0.75rem',
                                                        bgcolor: alpha(insufficient ? theme.palette.error.main : theme.palette.info.main, 0.1),
                                                        color: insufficient ? 'error.main' : 'info.main'
                                                    }}
                                                />
                                            );
                                        })}
                                        <Chip
                                            label={`→ ${recipe.output.name} x${recipe.output.quantity * multiplier}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 18, fontSize: '0.75rem' }}
                                        />
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={multiplierMenu?.anchor ?? null}
                open={!!multiplierMenu}
                onClose={() => setMultiplierMenu(null)}
            >
                {[ 1, 3, 5, 10 ].map(n => (
                    <MenuItem
                        key={n}
                        selected={multiplierMenu ? getMultiplier(multiplierMenu.recipeId) === n : false}
                        onClick={() => {
                            if (multiplierMenu) {
                                setCraftMultipliers(prev => ({ ...prev, [multiplierMenu.recipeId]: n }));
                            }
                            setMultiplierMenu(null);
                        }}
                    >
                        {n}x
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
