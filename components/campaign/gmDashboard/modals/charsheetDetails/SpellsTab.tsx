import { Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { elementColor } from '@constants';
import { color } from '@themes/tokens';
import type { SpellDTO } from '@models/dtos';
import type { Spell } from '@models/entities';
import { normalizeToArray } from './normalizeToArray';
import SpellStats from './SpellStats';
import type { CharsheetTabProps } from './types';

interface SpellsTabProps extends CharsheetTabProps {
    /** Magias da ficha (objetos gravados nela mais as buscadas por ID) */
    spells: Array<SpellDTO | Spell>;
}

/** Aba "Spells": tabela de magias da ficha e estatísticas */
export default function SpellsTab({ charsheet, editedData, isEditing, updateNestedField, spells }: SpellsTabProps) {
    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Espaço Mágico: {charsheet.spellSpace} / Maestria Elemental: {charsheet.elementalMastery ?? 'Nenhuma'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total de Spells: {charsheet.spells?.length}
                </Typography>
            </Box>

            {charsheet.spells?.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Elemento</TableCell>
                                <TableCell>Custo de Mana</TableCell>
                                <TableCell>Nível</TableCell>
                                <TableCell>Descrição</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spells?.map((spell, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" fontWeight="bold">{spell?.name}</Typography>
                                            {spell?.element && (
                                                <Chip
                                                    label={spell?.type}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 0.5, alignSelf: 'flex-start' }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={spell?.element}
                                            size="small"
                                            sx={{
                                                bgcolor: elementColor[spell?.element?.toUpperCase() ],
                                                // Texto escuro sobre a marca do elemento (maior contraste); só o vermelho de SANGUE pede texto claro
                                                color: spell?.element?.toUpperCase() === 'SANGUE' ? 'text.primary' : color.canvas
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{spell?.mpCost} MP</TableCell>
                                    <TableCell>
                                        {spell?.level}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'pre-wrap' }}>
                                            {spell?.stages?.[0]}
                                        </Typography>
                                        {/* {spell.dano && (
                                            <Box mt={1}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    Dano: {spell.dano}
                                                </Typography>
                                            </Box>
                                        )}
                                        {spell['pré-requisito'] && (
                                            <Box mt={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Pré-requisito: {spell['pré-requisito']}
                                                </Typography>
                                            </Box>
                                        )} */}
                                    </TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentSpells = normalizeToArray<SpellDTO>(editedData.spells || charsheet.spells);
                                                    const newSpells = [ ...currentSpells ];
                                                    newSpells.splice(index, 1);
                                                    updateNestedField('spells', newSpells);
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
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Este personagem não possui spells
                    </Typography>
                </Box>
            )}

            {charsheet.elementalMastery && charsheet.spells?.length > 0 && (
                <SpellStats charsheet={charsheet} />
            )}
        </>
    );
}
