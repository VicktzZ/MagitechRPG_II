import { useState, type ReactElement } from 'react';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import type { CampaignWidget } from '@models';

/** Registro/diário do widget (as 10 entradas mais recentes) */
export default function LogSection({ widget }: { widget: CampaignWidget }): ReactElement | null {
    const theme = useTheme();
    const [ logOpen, setLogOpen ] = useState(false);

    if ((widget.log?.length ?? 0) === 0) return null;

    return (
        <Box>
            <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: 'pointer', width: 'fit-content' }}
                onClick={() => setLogOpen(prev => !prev)}
            >
                <HistoryEduIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {widget.labels.log} ({widget.log.length})
                </Typography>
                <ExpandMoreIcon
                    sx={{ fontSize: 14, color: 'text.secondary', transform: logOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
            </Box>
            <Collapse in={logOpen}>
                <Box mt={0.75} pl={1} borderLeft={`2px solid ${theme.palette.divider}`} display="flex" flexDirection="column" gap={0.5}>
                    {[ ...widget.log ]
                        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                        .slice(0, 10)
                        .map(entry => (
                            <Box key={entry.id}>
                                <Typography variant="caption" color="text.disabled" fontSize="0.75rem">
                                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                </Typography>
                                <Typography variant="caption" display="block">{entry.text}</Typography>
                            </Box>
                        ))}
                </Box>
            </Collapse>
        </Box>
    );
}
