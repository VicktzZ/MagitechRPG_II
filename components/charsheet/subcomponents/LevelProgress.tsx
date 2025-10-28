import { Box, Typography, useTheme, alpha, Tooltip, useMediaQuery, Fade, Zoom } from '@mui/material'
import { amber, deepPurple, orange, teal } from '@mui/material/colors'
import React, { useState, memo, useMemo } from 'react'

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
        
        if (percentage <= 0.25) return teal[500];
        if (percentage <= 0.5) return amber[600];
        if (percentage <= 0.75) return orange[800];
        return deepPurple[500];
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
            const [ hover, setHover ] = useState(false);
            const isCurrentLevel = id === Math.floor(level) - 1;
            
            const barComponent = (
                <Box 
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    sx={{
                        width: barWidth ?? (isSmall ? '1.5rem' : isMedium ? '2rem' : '2.5rem'),
                        height: '0.75rem',
                        position: 'relative',
                        borderRadius: 1,
                        transition: 'all 0.2s ease-in-out',
                        transform: hover || isCurrentLevel ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: hover || isCurrentLevel ? `0 0 8px ${alpha(getLevelColor, 0.5)}` : 'none',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: filled ? getLevelColor : theme.palette.divider,
                        bgcolor: 'background.paper',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: filled ? 
                                `linear-gradient(135deg, ${alpha(getLevelColor, 0.8)}, ${getLevelColor})` : 
                                'transparent',
                            zIndex: 1
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: filled && (hover || isCurrentLevel) ? 
                                `linear-gradient(135deg, ${alpha(getLevelColor, 0.9)}, ${getLevelColor})` : 
                                'transparent',
                            zIndex: 2,
                            opacity: hover || isCurrentLevel ? 1 : 0,
                            transition: 'opacity 0.2s ease-in-out'
                        }
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
                    bgcolor: alpha(getLevelColor, 0.05),
                    border: '1px solid',
                    borderColor: alpha(getLevelColor, 0.2),
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        bgcolor: alpha(getLevelColor, 0.1),
                        borderColor: alpha(getLevelColor, 0.3),
                        boxShadow: `0 2px 8px ${alpha(getLevelColor, 0.15)}`
                    }
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                        variant="subtitle1" 
                        fontWeight="500"
                        sx={{
                            color: alpha(getLevelColor, 0.9),
                            textShadow: `0 0 1px ${alpha(theme.palette.background.paper, 0.5)}`
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        sx={{ 
                            color: getLevelColor,
                            textShadow: `0 0 5px ${alpha(getLevelColor, 0.3)}`
                        }}
                    >
                        {level}
                    </Typography>
                </Box>
                
                <Box 
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
                            background: `linear-gradient(90deg, ${alpha(getLevelColor, 0.6)}, ${getLevelColor})`,
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