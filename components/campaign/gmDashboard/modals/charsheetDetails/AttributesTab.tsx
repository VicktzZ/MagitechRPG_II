import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import type { CharsheetTabProps } from './types';

/** Aba "Atributos": valor e modificador de cada atributo */
export default function AttributesTab({ charsheet, editedData, isEditing, updateNestedField }: CharsheetTabProps) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Atributo</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Modificador</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {([ 'vig', 'des', 'log', 'sab', 'foc', 'car' ] as const).map((attr) => {
                        const labels: Record<string, string> = {
                            vig: 'Vigor (VIG)',
                            des: 'Destreza (DES)',
                            log: 'Lógica (LOG)',
                            sab: 'Sabedoria (SAB)',
                            foc: 'Foco (FOC)',
                            car: 'Carisma (CAR)'
                        };
                        return (
                            <TableRow key={attr}>
                                <TableCell>{labels[attr]}</TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={editedData.attributes?.[attr] ?? charsheet.attributes[attr]}
                                            onChange={(e) => updateNestedField(`attributes.${attr}`, parseInt(e.target.value) || 0)}
                                            sx={{ width: 70 }}
                                        />
                                    ) : charsheet.attributes[attr]}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={editedData.mods?.attributes?.[attr] ?? charsheet.mods.attributes[attr]}
                                            onChange={(e) => updateNestedField(`mods.attributes.${attr}`, parseInt(e.target.value) || 0)}
                                            sx={{ width: 70 }}
                                        />
                                    ) : charsheet.mods.attributes[attr]}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
