import { Box, Typography, useTheme, alpha, Tooltip, useMediaQuery, Fade, Zoom } from '@mui/material'
import React, { memo, useMemo } from 'react'
import { color } from '@themes/tokens'

interface Props {
    title: string,
    level: number,
    amount: number,
    barWidth?: number | string,
    filledColor?: string
}

const LevelProgress = memo(function LevelProgress({ title, level, amount, barWidth, filledColor }: Props) {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMedium = useMediaQuery(theme.breakpoints.down('md'))
    
    // Determinar cor com base no nível em relação ao máximo
    const getLevelColor = useMemo(() => {
        const percentage = level / amount;
        if (filledColor) return filledColor;
        
        if (percentage <= 0.25) return color.success;
        if (percentage <= 0.5) return color.amber;
        if (percentage <= 0.75) return color.warning;
        return color.cyan;
    }, [ level, amount, filledColor ]);
    
    const progressWidth = useMemo(() => {
        const maxLevel = title.toLowerCase().includes('personagem') ? 20 : amount;
        const percentage = Math.min(1, level / maxLevel) * 100;
        return `${percentage}%`;
    }, [ level, amount, title ]);

    const Bar = useMemo(() => {
        // eslint-disable-next-line react/display-name
        return memo(({ id, showTooltip = true }: { id: number, showTooltip?: boolean }) => {
            const filled = level > id;
            const isCurrentLevel = id === Math.floor(level) - 1;
            
            const barComponent = (
                <Box 
                    sx={{
                        width: barWidth ?? (isSmall ? '1.5rem' : isMedium ? '2rem' : '2.5rem'),
                        height: '0.75rem',
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: filled ? getLevelColor : theme.palette.divider,
                        // O nível atual fica em cor cheia; os anteriores, um pouco mais suaves
                        bgcolor: filled ? (isCurrentLevel ? getLevelColor : alpha(getLevelColor, 0.7)) : 'background.paper'
                    }}
                />
            );
            
            return showTooltip ? (
                <Tooltip 
                    title={`Nível ${id + 1}`} 
                    placement="top"
                    TransitionComponent={Zoom}
                    arrow
                >
                    {barComponent}
                </Tooltip>
            ) : barComponent;
        });
    }, [ amount, level, barWidth, getLevelColor, isSmall, isMedium, theme.palette.divider ]);

    const levelBars = useMemo(() => {
        return Array.from({ length: amount }, (_, index) => <Bar key={index} id={index} />);
    }, [ Bar, amount ]);

    return (
        <Fade in timeout={500}>
            <Box 
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.raised',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'border-color 120ms',
                    '&:hover': {
                        borderColor: color.borderStrong
                    }
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                        variant="subtitle1" 
                        fontWeight="500"
                        sx={{
                            color: alpha(getLevelColor, 0.9)
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        sx={{ 
                            color: getLevelColor
                        }}
                    >
                        {level}
                    </Typography>
                </Box>
                
                <Box 
                    role='progressbar'
                    aria-label={title}
                    aria-valuemin={0}
                    aria-valuemax={amount}
                    aria-valuenow={level}
                    sx={{
                        width: '100%',
                        height: '0.75rem',
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.divider, 0.3)
                    }}
                >
                    <Box 
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: progressWidth,
                            bgcolor: getLevelColor,
                            transition: 'width 0.5s ease-in-out'
                        }}
                    />
                </Box>
                
                <Box width='100%' justifyContent='center' display='flex' alignItems='center' gap={0.5}>
                    {levelBars}
                </Box>
            </Box>
        </Fade>
    )
});

export default LevelProgress;