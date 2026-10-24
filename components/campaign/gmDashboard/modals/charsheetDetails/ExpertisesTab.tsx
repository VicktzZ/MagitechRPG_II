import { Casino } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import type { Expertises } from '@models';
import { describeSheetPlan, type SheetRollPlan } from '@utils/sheetRoll';
import type { CharsheetTabProps } from './types';

interface ExpertisesTabProps extends CharsheetTabProps {
    /** Rolagem do mestre pelo jogador: sem isto a aba é só a tabela */
    roll?: {
        planFor: (expertise: string) => SheetRollPlan | null;
        onRoll: (expertise: string) => void;
    };
}

/** Aba "Perícias": valor e atributo padrão de cada perícia (e, quando há `roll`, o botão de rolar pelo jogador) */
export default function ExpertisesTab({ charsheet, editedData, isEditing, updateNestedField, roll }: ExpertisesTabProps) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Perícia</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Atributo</TableCell>
                        {roll && !isEditing && <TableCell align="center">Rolar</TableCell>}
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
                                {roll && !isEditing && (
                                    <TableCell align="center">
                                        {(() => {
                                            const plan = roll.planFor(name);
                                            return (
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Rolar ${name} de ${charsheet.name}`}
                                                    title={plan ? `Rolar ${describeSheetPlan(plan)}` : 'Indisponível: o sistema da ficha ainda não carregou'}
                                                    disabled={!plan}
                                                    onClick={() => roll.onRoll(name)}
                                                >
                                                    <Casino fontSize="small" />
                                                </IconButton>
                                            );
                                        })()}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
