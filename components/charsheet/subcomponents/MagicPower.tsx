import { elementColor as eColor } from '@constants';
import { useTheme, alpha, Paper, CardContent, Stack, Tooltip, Chip, Typography, Box, Button, IconButton } from '@mui/material';
import { Info, Add, Close } from '@mui/icons-material';
import { type ReactElement, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { color } from '@themes/tokens';
import ElementIcon, { resolveElement } from '@components/misc/ElementIcon';
import type { Power } from '@models/entities';

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

    // Elemento para a marca (glifo)
    const elementColor = eColor[resolveElement(power.element)];

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

    return (
        <motion.div
            data-id={id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{ pointerEvents: 'auto' }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: { xs: '100%', sm: '30rem', md: '32rem' },
                    height: { xs: 'none', sm: '35rem', md: '40rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    bgcolor: 'background.raised',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxSizing: 'border-box',
                    margin: '0 auto',
                    transition: 'border-color 120ms',
                    ...(!disabled && {
                        '&:hover': {
                            borderColor: color.borderStrong
                        }
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
                                bgcolor: 'divider'
                            }
                        }}
                    >
                        {/* Badge de element */}
                        <Tooltip title={`Element: ${power.element}`} arrow placement="top">
                            <Chip
                                icon={<ElementIcon element={power.element} colored />}
                                label={power.element}
                                variant="outlined"
                                sx={{
                                    color: 'text.primary',
                                    borderColor: 'divider',
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: elementColor }
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
                                    width: '100%'
                                }}
                            >
                                {power.name}
                            </Typography>
                        </Tooltip>
                    </Stack>

                    {/* Seção de pré-requisitos */}
                    <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                            <Info fontSize="small" sx={{ color: 'info.main' }} />
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
                                        bgcolor: 'background.paper',
                                        borderColor: 'divider',
                                        position: 'relative',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                            borderRadius: '4px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'transparent'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: color.borderStrong,
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: color.inkFaint
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
                                zIndex: 5
                            }}
                        >
                            <Button
                                size="small"
                                onClick={() => handleTabChange('descrição')}
                                variant="outlined"
                                color={activeTab === 'descrição' ? 'primary' : 'secondary'}
                                disabled={disabled}
                                sx={{
                                    position: 'relative', // Necessário para o z-index funcionar
                                    zIndex: 10,
                                    minWidth: { xs: '80px', sm: 0 },
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                    ...(activeTab === 'descrição' && {
                                        bgcolor: color.amberSubtle,
                                        borderColor: color.amberLine,
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: color.amberSubtle, borderColor: color.amberLine }
                                    })
                                }}
                            >
                                Descrição
                            </Button>
                            <Button
                                size="small"
                                onClick={() => handleTabChange('maestria')}
                                variant="outlined"
                                color={activeTab === 'maestria' ? 'primary' : 'secondary'}
                                disabled={disabled}
                                sx={{
                                    position: 'relative', // Necessário para o z-index funcionar
                                    zIndex: 10,
                                    minWidth: { xs: '80px', sm: 0 },
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                    ...(activeTab === 'maestria' && {
                                        bgcolor: color.amberSubtle,
                                        borderColor: color.amberLine,
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: color.amberSubtle, borderColor: color.amberLine }
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
                                            color: isAdding ? theme.palette.primary.main : theme.palette.error.main,
                                            bgcolor: alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.2)}`,
                                            p: 1,
                                            zIndex: 10,
                                            position: 'relative', // Necessário para o z-index funcionar
                                            '&:hover': {
                                                bgcolor: alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.2)
                                            },
                                            transition: 'background-color 120ms'
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
