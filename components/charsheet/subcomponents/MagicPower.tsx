import { elementColor as eColor } from '@constants';
import { useTheme, alpha, Paper, CardContent, Stack, Tooltip, Chip, Typography, Box, Button, IconButton } from '@mui/material';
import { AutoAwesome, Info, Add, Close, LocalFireDepartment, WaterDrop, Air, Nature, Bolt, Flare } from '@mui/icons-material';
import { type ReactElement, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Power } from '@models/entities';

const elementIcons = {
    'FOGO': <LocalFireDepartment />,
    'ÁGUA': <WaterDrop />,
    'AR': <Air />,
    'TERRA': <Nature />,
    'ELETRICIDADE': <Bolt />,
    'GELO': <Flare sx={{ color: '#A5F2F3' }} />,
    'LUZ': <Flare />,
    'ESCURIDÃO': <Flare sx={{ color: '#4A4A4A' }} />,
    'NEUTRO': <AutoAwesome />
};

export function MagicPower({
    power,
    id,
    isAdding,
    onIconClick,
    disabled = false
}: {
    power: Power,
    id: string,
    isAdding?: boolean,
    onIconClick?: () => void,
    disabled?: boolean
}): ReactElement {
    const theme = useTheme();

    // Estados
    const [ description, setDescription ] = useState<string>(power.description);
    const [ activeTab, setActiveTab ] = useState<'descrição' | 'maestria'>('descrição');

    // Element para cor/ícone
    const element = power.element.toUpperCase() as any;
    const elementColor = eColor[element] || theme.palette.primary.main;
    const elementIcon = elementIcons[element] || <AutoAwesome />;

    // Trocar entre descrição e maestria
    const handleTabChange = (tab: 'descrição' | 'maestria'): void => {
        setActiveTab(tab);
        setDescription(power[tab]!);
    };

    // Animações - removida a animação de hover que causava problemas com cliques
    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut'
            }
        }
    };

    // Efeito de brilho
    const shineAnimation = {
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(elementColor, 0.2)}, transparent)`,
            animation: disabled ? 'none' : 'shine 3s infinite'
        },
        '@keyframes shine': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' }
        }
    };

    return (
        <motion.div
            data-id={id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{ pointerEvents: 'auto' }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: { xs: '100%', sm: '30rem', md: '32rem' },
                    height: { xs: 'none', sm: '35rem', md: '40rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.95)})`
                        : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.95)})`,
                    border: `1px solid ${alpha(elementColor, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`,
                    boxSizing: 'border-box',
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                    ...(!disabled && {
                        '&:hover': {
                            borderColor: alpha(elementColor, 0.5)
                        },
                        ...shineAnimation
                    })
                }}
            >
                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    height: '100%',
                    p: { xs: 2, sm: 3 }
                }}>
                    {/* Header com element e nome */}
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: 0,
                                width: '100%',
                                height: '1px',
                                background: `linear-gradient(90deg, ${alpha(elementColor, 0.7)}, transparent)`
                            }
                        }}
                    >
                        {/* Badge de element */}
                        <Tooltip title={`Element: ${power.element}`} arrow placement="top">
                            <Chip
                                icon={elementIcon}
                                label={power.element}
                                sx={{
                                    bgcolor: alpha(elementColor, 0.1),
                                    color: elementColor,
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: elementColor },
                                    ...(!disabled && {
                                        '&:hover': {
                                            bgcolor: alpha(elementColor, 0.2)
                                        }
                                    })
                                }}
                            />
                        </Tooltip>

                        {/* Nome do poder com tooltip */}
                        <Tooltip
                            title={`Poder mágico ${power.element}: confere habilidades especiais relacionadas à ${power.element.toLowerCase()}`}
                            arrow
                            placement="top"
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    color: theme.palette.text.primary,
                                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' },
                                    wordBreak: 'break-word',
                                    width: '100%',
                                    ...(!disabled && {
                                        '&:hover': { color: elementColor }
                                    }),
                                    transition: 'color 0.3s ease'
                                }}
                            >
                                {power.name}
                            </Typography>
                        </Tooltip>
                    </Stack>

                    {/* Seção de pré-requisitos */}
                    <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                            <Info fontSize="small" sx={{ color: elementColor }} />
                            <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' } }}>
                                Pré-requisito: 
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', wordBreak: 'break-word', fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' } }}>
                                {power.preRequisite ?? 'Nenhum'}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Conteúdo do poder (descrição ou maestria) */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`desc-${id}-${activeTab}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.3 }
                                }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ height: '100%' }}
                            >
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: { xs: 1.5, sm: 2, md: 2.5 },
                                        height: '100%',
                                        minHeight: { xs: '150px', sm: '180px', md: '200px' },
                                        maxHeight: { xs: '200px', sm: '250px', md: '300px' },
                                        overflow: 'auto',
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        borderColor: alpha(elementColor, 0.2),
                                        position: 'relative',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                            borderRadius: '4px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: alpha(theme.palette.background.paper, 0.1)
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: alpha(elementColor, 0.3),
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: alpha(elementColor, 0.5)
                                            }
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            color: alpha(theme.palette.text.primary, 0.9),
                                            lineHeight: 1.7,
                                            position: 'relative',
                                            zIndex: 2,
                                            fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
                                        }}
                                    >
                                        {description}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </AnimatePresence>
                    </Box>

                    {/* Botões de controle e ação */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1.5, sm: 1 }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{
                            pt: 1,
                            mt: 1,
                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            width: '100%'
                        }}
                    >
                        {/* Botões para alternar entre descrição e maestria */}
                        <Stack 
                            direction={{ xs: 'row', sm: 'row' }} 
                            spacing={1}
                            sx={{ 
                                flexWrap: 'wrap',
                                gap: 1,
                                justifyContent: { xs: 'center', sm: 'flex-start' },
                                position: 'relative', // Necessário para o z-index funcionar
                                zIndex: 5 // Garante que os botões fiquem acima das animações
                            }}
                        >
                            <Button
                                size="small"
                                onClick={() => handleTabChange('descrição')}
                                variant={activeTab === 'descrição' ? 'contained' : 'outlined'}
                                disabled={disabled}
                                sx={{
                                    position: 'relative', // Necessário para o z-index funcionar
                                    zIndex: 10, // Garante que o botão fique acima das animações
                                    minWidth: { xs: '80px', sm: 0 },
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                    color: activeTab === 'descrição'
                                        ? element === 'AR' || element === 'NÃO-ELEMENTAL' ? '#111' : '#fff' : elementColor,
                                    bgcolor: activeTab === 'descrição'
                                        ? elementColor
                                        : 'transparent',
                                    borderColor: alpha(elementColor, 0.5),
                                    ...(!disabled && {
                                        '&:hover': {
                                            bgcolor: activeTab === 'descrição'
                                                ? elementColor
                                                : alpha(elementColor, 0.1),
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 2px 8px ${alpha(elementColor, 0.25)}`
                                        }
                                    })
                                }}
                            >
                                Descrição
                            </Button>
                            <Button
                                size="small"
                                onClick={() => handleTabChange('maestria')}
                                variant={activeTab === 'maestria' ? 'contained' : 'outlined'}
                                disabled={disabled}
                                sx={{
                                    position: 'relative', // Necessário para o z-index funcionar
                                    zIndex: 10, // Garante que o botão fique acima das animações
                                    minWidth: { xs: '80px', sm: 0 },
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                    color: activeTab === 'maestria'
                                        ? element === 'AR' || element === 'NÃO-ELEMENTAL' ? '#111' : '#fff' : elementColor,
                                    bgcolor: activeTab === 'maestria'
                                        ? elementColor
                                        : 'transparent',
                                    borderColor: alpha(elementColor, 0.5),
                                    ...(!disabled && {
                                        '&:hover': {
                                            bgcolor: activeTab === 'maestria'
                                                ? elementColor
                                                : alpha(elementColor, 0.1),
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 2px 8px ${alpha(elementColor, 0.25)}`
                                        }
                                    })
                                }}
                            >
                                Maestria
                            </Button>
                        </Stack>

                        {/* Botão de ação (adicionar ou remover) */}
                        {onIconClick && (
                            <Tooltip title={isAdding ? 'Adicionar poder' : 'Remover poder'} arrow placement="top">
                                <span>
                                    <IconButton
                                        onClick={onIconClick}
                                        size="small"
                                        sx={{
                                            color: isAdding ? theme.palette.success.main : theme.palette.error.main,
                                            bgcolor: alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
                                            p: 1,
                                            zIndex: 10, // Garante que o botão fique acima da animação
                                            position: 'relative', // Necessário para o z-index funcionar
                                            '&:hover': {
                                                bgcolor: alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.2),
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {isAdding ? <Add /> : <Close />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                </CardContent>
            </Paper>
        </motion.div>
    );
}
