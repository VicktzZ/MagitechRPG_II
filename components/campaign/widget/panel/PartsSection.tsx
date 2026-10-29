import type { ReactElement } from 'react';
import { alpha, Box, Grid, LinearProgress, Paper, Tooltip, Typography } from '@mui/material';
import type { CampaignWidget } from '@models';
import { partStatusConfig } from './panelConfig';

/** Partes/subsistemas do widget, cada uma com vida e status próprios */
export default function PartsSection({ widget }: { widget: CampaignWidget }): ReactElement | null {
    if ((widget.parts?.length ?? 0) === 0) return null;

    return (
        <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {widget.labels.parts}
            </Typography>
            <Grid container spacing={0.75} mt={0}>
                {widget.parts.map(part => {
                    const statusCfg = partStatusConfig[part.status] ?? partStatusConfig.operational;
                    const partPct = part.maxHp > 0 ? (part.hp / part.maxHp) * 100 : 0;
                    return (
                        <Grid item xs={6} key={part.id}>
                            <Tooltip title={part.description || ''} arrow disableHoverListener={!part.description}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 0.75,
                                        borderColor: alpha(statusCfg.color, 0.4),
                                        opacity: part.status === 'offline' ? 0.6 : 1
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={0.5} mb={0.4}>
                                        {part.icon && <Typography fontSize="0.85rem">{part.icon}</Typography>}
                                        <Typography variant="caption" fontWeight={700} noWrap flex={1}>
                                            {part.name}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.max(0, Math.min(100, partPct))}
                                        sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            mb: 0.4,
                                            bgcolor: 'action.disabledBackground',
                                            '& .MuiLinearProgress-bar': { bgcolor: statusCfg.color }
                                        }}
                                    />
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                            {part.hp}/{part.maxHp}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 700, fontSize: '0.75rem' }}>
                                            {statusCfg.label}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Tooltip>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
