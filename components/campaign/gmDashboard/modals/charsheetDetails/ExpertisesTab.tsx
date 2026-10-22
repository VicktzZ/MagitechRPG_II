import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import type { Expertises } from '@models';
import type { CharsheetTabProps } from './types';

/** Aba "Perícias": valor e atributo padrão de cada perícia */
export default function ExpertisesTab({ charsheet, editedData, isEditing, updateNestedField }: CharsheetTabProps) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Perícia</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Atributo</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(charsheet.expertises).sort((a, b) => b[1].value - a[1].value).map(([ name, expertise ]) => {
                        return (
                            <TableRow key={name}>
                                <TableCell>{name}</TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={editedData.expertises?.[name as keyof Expertises]?.value ?? expertise.value}
                                            onChange={(e) => updateNestedField(`expertises.${name}.value`, parseInt(e.target.value) || 0)}
                                            sx={{ width: 70 }}
                                        />
                                    ) : expertise.value}
                                </TableCell>
                                <TableCell>{expertise.defaultAttribute?.toUpperCase() || '—'}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
