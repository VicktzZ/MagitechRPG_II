import { Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Armor, Item, Weapon } from '@models';
import { normalizeToArray } from './normalizeToArray';
import type { CharsheetTabProps } from './types';

interface InventoryTabProps extends CharsheetTabProps {
    weightUnit: string;
}

/** Aba "Inventário": armas, armaduras e itens da ficha */
export default function InventoryTab({ charsheet, editedData, isEditing, updateNestedField, weightUnit }: InventoryTabProps) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Armas ({normalizeToArray<Weapon>(editedData.inventory?.weapons || charsheet.inventory?.weapons).length})</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Dano</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Categoria</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizeToArray<Weapon>(editedData.inventory?.weapons || charsheet.inventory?.weapons).map((weapon, index) => (
                                <TableRow key={index}>
                                    <TableCell>{weapon.name}</TableCell>
                                    <TableCell>{weapon.effect?.value || '-'}</TableCell>
                                    <TableCell>{weapon.kind}</TableCell>
                                    <TableCell>{weapon.categ}</TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentWeapons = normalizeToArray<Weapon>(editedData.inventory?.weapons || charsheet.inventory?.weapons);
                                                    const newWeapons = [ ...currentWeapons ];
                                                    newWeapons.splice(index, 1);
                                                    updateNestedField('inventory.weapons', newWeapons);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Armaduras ({normalizeToArray<Armor>(editedData.inventory?.armors || charsheet.inventory?.armors).length})</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Defesa</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Categoria</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizeToArray<Armor>(editedData.inventory?.armors || charsheet.inventory?.armors).map((armor, index) => (
                                <TableRow key={index}>
                                    <TableCell>{armor.name}</TableCell>
                                    <TableCell>{armor.value}</TableCell>
                                    <TableCell>{armor.kind}</TableCell>
                                    <TableCell>{armor.categ}</TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentArmors = normalizeToArray<Armor>(editedData.inventory?.armors || charsheet.inventory?.armors);
                                                    const newArmors = [ ...currentArmors ];
                                                    newArmors.splice(index, 1);
                                                    updateNestedField('inventory.armors', newArmors);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Itens ({normalizeToArray<Item>(editedData.inventory?.items || charsheet.inventory?.items).length})</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Quantidade</TableCell>
                                <TableCell>Peso</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizeToArray<Item>(editedData.inventory?.items || charsheet.inventory?.items).map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.kind}</TableCell>
                                    <TableCell>{item.quantity ?? 1}</TableCell>
                                    <TableCell>{item.weight}{weightUnit ? ` ${weightUnit}` : ''}</TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentItems = normalizeToArray<Item>(editedData.inventory?.items || charsheet.inventory?.items);
                                                    const newItems = [ ...currentItems ];
                                                    newItems.splice(index, 1);
                                                    updateNestedField('inventory.items', newItems);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}
