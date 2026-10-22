import { Box, Chip, Grid, TextField, Typography } from '@mui/material';
import type { CharsheetTabProps } from './types';

/** Pontos disponíveis (atributos, perícias e habilidades) da ficha */
export default function AvailablePoints({ charsheet, editedData, isEditing, updateNestedField }: CharsheetTabProps) {
    return (
        <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Pontos Disponíveis</Typography>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    {isEditing ? (
                        <TextField
                            size="small"
                            type="number"
                            label="Atributos"
                            value={editedData.points?.attributes ?? charsheet.points.attributes}
                            onChange={(e) => updateNestedField('points.attributes', parseInt(e.target.value) || 0)}
                            fullWidth
                        />
                    ) : (
                        <Chip
                            label={`Atributos: ${charsheet.points.attributes}`}
                            color="primary"
                            variant="outlined"
                            sx={{ width: '100%' }}
                        />
                    )}
                </Grid>
                <Grid item xs={6}>
                    {isEditing ? (
                        <TextField
                            size="small"
                            type="number"
                            label="Perícias"
                            value={editedData.points?.expertises ?? charsheet.points.expertises}
                            onChange={(e) => updateNestedField('points.expertises', parseInt(e.target.value) || 0)}
                            fullWidth
                        />
                    ) : (
                        <Chip
                            label={`Perícias: ${charsheet.points.expertises}`}
                            color="secondary"
                            variant="outlined"
                            sx={{ width: '100%' }}
                        />
                    )}
                </Grid>
                <Grid item xs={6}>
                    {isEditing ? (
                        <TextField
                            size="small"
                            type="number"
                            label="Habilidades"
                            value={editedData.points?.skills ?? charsheet.points.skills}
                            onChange={(e) => updateNestedField('points.skills', parseInt(e.target.value) || 0)}
                            fullWidth
                        />
                    ) : (
                        <Chip
                            label={`Habilidades: ${charsheet.points.skills}`}
                            color="info"
                            variant="outlined"
                            sx={{ width: '100%' }}
                        />
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
