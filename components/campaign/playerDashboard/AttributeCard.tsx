import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { type ReactElement } from 'react';

export function AttributeCard({
    label,
    value,
    icon,
    iconColor 
}: {
    label: string,
    value: number,
    icon: ReactElement | string,
    iconColor: { bgcolor: string, border: string } 
}) {
    return (
        <Paper sx={{
            bgcolor: 'background.raised',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.5,
            position: 'relative',
            transition: 'all 0.2s'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    ...iconColor
                }}>
                    {icon}
                </Box>
                <Typography variant="caption" sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '12px'
                }}>
                    {label}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                    <LinearProgress
                        variant='determinate'
                        value={(value / 30) * 100}
                        sx={{
                            height: '4px',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'text.secondary'
                            }
                        }}
                    />
                </Box>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: 'text.primary' }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
};