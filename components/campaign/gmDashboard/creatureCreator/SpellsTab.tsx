import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography, alpha } from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { color } from '@themes/tokens';
import { elements } from '@constants';
import type { CreatureData, SpellData } from './types';

interface SpellsTabProps {
    creatureData: CreatureData;
    isReadOnly: boolean;
    newSpell: Partial<SpellData>;
    setNewSpell: (update: (prev: Partial<SpellData>) => Partial<SpellData>) => void;
    addSpell: () => void;
    removeSpell: (id: string) => void;
    onOpenBank: () => void;
}

/** Aba "Magias": formulário de nova magia e lista das da criatura */
export default function SpellsTab({
    creatureData,
    isReadOnly,
    newSpell,
    setNewSpell,
    addSpell,
    removeSpell,
    onOpenBank
}: SpellsTabProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700}>
                    Magias ({creatureData.spells.length})
                </Typography>
                <Button variant="outlined" size="small" startIcon={<Search />} onClick={onOpenBank} disabled={isReadOnly}>
                    Buscar do banco
                </Button>
            </Box>

            {!isReadOnly && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                            label="Nome"
                            value={newSpell.name}
                            onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))}
                            size="small"
                            sx={{ flex: 1, minWidth: 150 }}
                        />
                        <TextField
                            label="Elemento"
                            select
                            value={newSpell.element}
                            onChange={(e) => setNewSpell(prev => ({ ...prev, element: e.target.value }))}
                            size="small"
                            SelectProps={{ native: true }}
                            sx={{ width: 120 }}
                        >
                            {elements.map(el => (<option key={el} value={el}>{el}</option>))}
                        </TextField>
                        <TextField
                            label="Nível"
                            type="number"
                            value={newSpell.level}
                            onChange={(e) => setNewSpell(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                            size="small"
                            inputProps={{ min: 1, max: 5 }}
                            sx={{ width: 80 }}
                        />
                        <TextField
                            label="Custo MP"
                            type="number"
                            value={newSpell.cost}
                            onChange={(e) => setNewSpell(prev => ({ ...prev, cost: parseInt(e.target.value) || 1 }))}
                            size="small"
                            inputProps={{ min: 0 }}
                            sx={{ width: 100 }}
                        />
                        <Button variant="contained" onClick={addSpell} disabled={!newSpell.name?.trim()} startIcon={<Add />}>
                            Adicionar
                        </Button>
                    </Box>
                    <TextField
                        label="Descrição"
                        value={newSpell.description}
                        onChange={(e) => setNewSpell(prev => ({ ...prev, description: e.target.value }))}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mt: 1 }}
                    />
                </Paper>
            )}

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 260, overflow: 'auto' }}>
                {creatureData.spells.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        Nenhuma magia adicionada
                    </Typography>
                ) : (
                    <List dense>
                        {creatureData.spells.map(spell => (
                            <ListItem
                                key={spell.id}
                                secondaryAction={!isReadOnly && (
                                    <IconButton edge="end" onClick={() => removeSpell(spell.id)} color="error">
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                            <Typography variant="body2" fontWeight={600}>{spell.name}</Typography>
                                            <Chip label={spell.element} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
                                            <Chip label={`Nv. ${spell.level}`} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
                                            <Chip label={`${spell.cost} MP`} size="small" sx={{ height: 20, fontSize: '0.75rem', bgcolor: alpha(color.mp, 0.14), color: color.mp }} />
                                        </Box>
                                    }
                                    secondary={spell.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}
