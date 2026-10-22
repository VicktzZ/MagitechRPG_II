import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import { getInputValue } from './charsheetEdit';
import type { CharsheetTabProps, HandleNumberInputChange } from './types';

interface CharacterDetailsTableProps extends CharsheetTabProps {
    handleNumberInputChange: HandleNumberInputChange;
}

/** Tabela "Detalhes do Personagem" da aba de informações básicas */
export default function CharacterDetailsTable({
    charsheet,
    editedData,
    isEditing,
    updateNestedField,
    handleNumberInputChange
}: CharacterDetailsTableProps) {
    return (
        <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Detalhes do Personagem</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.name ?? charsheet.name}
                                        onChange={(e) => updateNestedField('name', e.target.value)}
                                        fullWidth
                                    />
                                ) : charsheet.name}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Jogador</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.playerName ?? charsheet.playerName}
                                        onChange={(e) => updateNestedField('playerName', e.target.value)}
                                        fullWidth
                                    />
                                ) : charsheet.playerName}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Classe</TableCell>
                            <TableCell>{charsheet.class as string}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Subclasse</TableCell>
                            <TableCell>{charsheet.subclass as string || 'Nenhuma'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Linhagem</TableCell>
                            <TableCell>{charsheet.lineage as unknown as string}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Raça</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.race ?? charsheet.race}
                                        onChange={(e) => updateNestedField('race', e.target.value)}
                                        fullWidth
                                    />
                                ) : charsheet.race}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Gênero</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        value={editedData.gender ?? charsheet.gender}
                                        onChange={(e) => updateNestedField('gender', e.target.value)}
                                        fullWidth
                                    />
                                ) : charsheet.gender}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Idade</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={getInputValue(editedData.age, charsheet.age)}
                                        onChange={(e) => handleNumberInputChange('age', e.target.value)}
                                        sx={{ width: 80 }}
                                        InputProps={{ endAdornment: ' anos' }}
                                    />
                                ) : `${charsheet.age} anos`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Modo</TableCell>
                            <TableCell>{charsheet.mode}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Condição Financeira</TableCell>
                            <TableCell>{charsheet.financialCondition}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
}
