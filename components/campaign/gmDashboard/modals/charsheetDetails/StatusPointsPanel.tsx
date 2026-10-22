import { Box, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import AvailablePoints from './AvailablePoints';
import { getInputValue } from './charsheetEdit';
import type { CharsheetTabProps, HandleNumberInputChange } from './types';

interface StatusPointsPanelProps extends CharsheetTabProps {
    handleNumberInputChange: HandleNumberInputChange;
    weightUnit: string;
    onOpenStatusModal: () => void;
}

/** Tabela "Status & Pontos" e pontos disponíveis da aba de informações básicas */
export default function StatusPointsPanel({
    charsheet,
    editedData,
    isEditing,
    updateNestedField,
    handleNumberInputChange,
    weightUnit,
    onOpenStatusModal
}: StatusPointsPanelProps) {
    // Stats do personagem
    const displayStats = charsheet.stats;

    return (
        <Grid item xs={12} md={6}>
            <Box display='flex' alignItems='center' sx={{ mb: '0.25em' }} gap={1}>
                <Typography variant="subtitle1">Status & Pontos</Typography>
                {!isEditing && (
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={onOpenStatusModal}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                )}
            </Box>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>LP (Pontos de Vida)</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <Box display="flex" gap={0.5} alignItems="center">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.lp, displayStats.lp)}
                                            onChange={(e) => handleNumberInputChange('stats.lp', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                        /
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.maxLp, displayStats.maxLp)}
                                            onChange={(e) => handleNumberInputChange('stats.maxLp', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                    </Box>
                                ) : `${displayStats.lp}/${displayStats.maxLp}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>MP</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <Box display="flex" gap={0.5} alignItems="center">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.mp, displayStats.mp)}
                                            onChange={(e) => handleNumberInputChange('stats.mp', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                        /
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.maxMp, displayStats.maxMp)}
                                            onChange={(e) => handleNumberInputChange('stats.maxMp', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                    </Box>
                                ) : `${displayStats.mp}/${displayStats.maxMp}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>AP</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <Box display="flex" gap={0.5} alignItems="center">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.ap, displayStats.ap)}
                                            onChange={(e) => handleNumberInputChange('stats.ap', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                        /
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.stats?.maxAp, displayStats.maxAp)}
                                            onChange={(e) => handleNumberInputChange('stats.maxAp', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                    </Box>
                                ) : `${displayStats.ap}/${displayStats.maxAp}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Deslocamento</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={getInputValue(editedData.displacement, charsheet.displacement)}
                                        onChange={(e) => handleNumberInputChange('displacement', e.target.value)}
                                        sx={{ width: 80 }}
                                        InputProps={{ endAdornment: 'm' }}
                                    />
                                ) : `${charsheet.displacement}m`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Capacidade</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <Box display="flex" gap={0.5} alignItems="center">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.capacity?.cargo, charsheet.capacity.cargo)}
                                            onChange={(e) => handleNumberInputChange('capacity.cargo', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                        /
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={getInputValue(editedData.capacity?.max, charsheet.capacity.max)}
                                            onChange={(e) => handleNumberInputChange('capacity.max', e.target.value)}
                                            sx={{ width: 70 }}
                                        />
                                        {weightUnit && <Typography variant="caption" color="text.secondary">{weightUnit}</Typography>}
                                    </Box>
                                ) : `${charsheet.capacity.cargo}/${charsheet.capacity.max}${weightUnit ? ` ${weightUnit}` : ''}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Dinheiro</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={getInputValue(editedData.inventory?.money, charsheet.inventory.money)}
                                        onChange={(e) => handleNumberInputChange('inventory.money', e.target.value)}
                                        sx={{ width: 100 }}
                                        InputProps={{ startAdornment: '¢' }}
                                    />
                                ) : `¢ ${charsheet.inventory.money}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Munição</TableCell>
                            <TableCell>{charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Espaço mágico</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={getInputValue(editedData.spellSpace, charsheet.spellSpace)}
                                        onChange={(e) => handleNumberInputChange('spellSpace', e.target.value)}
                                        sx={{ width: 70 }}
                                    />
                                ) : charsheet.spellSpace}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Maestria Elemental</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.elementalMastery ?? charsheet.elementalMastery ?? ''}
                                        onChange={(e) => updateNestedField('elementalMastery', e.target.value)}
                                        sx={{ width: 120 }}
                                    />
                                ) : (charsheet.elementalMastery || 'Nenhuma')}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Traços</TableCell>
                            <TableCell>{charsheet.traits.join(', ') || 'Nenhum'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <AvailablePoints
                charsheet={charsheet}
                editedData={editedData}
                isEditing={isEditing}
                updateNestedField={updateNestedField}
            />
        </Grid>
    );
}
