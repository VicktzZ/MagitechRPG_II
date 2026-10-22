import { Box, Grid, Paper, Typography } from '@mui/material';
import type { SpellDTO } from '@models/dtos';
import { normalizeToArray } from './normalizeToArray';
import type { CharsheetTabProps } from './types';

/** Cartões "Estatísticas de Spell" (custo médio, elementos, maestria e MP total) */
export default function SpellStats({ charsheet }: Pick<CharsheetTabProps, 'charsheet'>) {
    // Stats do personagem
    const displayStats = charsheet.stats;

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
                Estatísticas de Spell
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.raised' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            MpCompCost Médio
                        </Typography>
                        <Typography variant="h6">
                            {Math.round(charsheet.spells?.reduce((acc, m) => acc + (m.mpCost || 0), 0) / charsheet.spells?.length)} MP
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.raised' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Elements Dominantes
                        </Typography>
                        <Typography variant="body2">
                            {Array.from(new Set(normalizeToArray<SpellDTO>(charsheet.spells).map(m => m.element))).join(', ')}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.raised' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Maestria
                        </Typography>
                        <Typography variant="h6">
                            {charsheet.elementalMastery}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.raised' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Total MP
                        </Typography>
                        <Typography variant="h6">
                            {displayStats.mp}/{displayStats.maxMp}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
