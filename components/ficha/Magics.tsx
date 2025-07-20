/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
    AddCircle,
    AutoAwesome,
    AutoFixHigh,
    Close,
    EmojiSymbols,
    FilterList,
    HourglassBottom,
    ManageSearch
} from '@mui/icons-material'
import {
    alpha,
    Badge,
    Box,
    Button,
    Chip,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import type { Ficha, Magia as MagiaType } from '@types'
import { useFormContext, useWatch } from 'react-hook-form'
import { memo, useCallback, useMemo, useState } from 'react'
import { Magic } from '.';
import MagicsModal from './dialogs/MagicsModal'
import { useSnackbar } from 'notistack';
import { toastDefault, elementColor as elementColors } from '@constants';

/**
 * Componente Magics
 * 
 * Gerencia e exibe todas as magias do personagem com interface moderna e animações
 */

const Magics = memo(() => {
    // Estados locais
    const [ open, setOpen ] = useState(false)
    const [ filterOpen, setFilterOpen ] = useState(false)
    const [ elementFilter, setElementFilter ] = useState<string | null>(null)
    const [ sortType, setSortType ] = useState<'elemento' | 'level' | 'name'>('name')

    // Hooks e contexto
    const { control, setValue, getValues } = useFormContext<Ficha>()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const magics = useWatch({ control, name: 'magics' })
    
    const points = useWatch({ control, name: 'points' })
    const magicsSpace = useWatch({ control, name: 'magicsSpace' })

    // Ordena e filtra as magias
    const filteredMagics = useMemo(() => {
        if (!magics?.length) return []

        let filtered = [ ...magics ]

        // Aplica filtro de elemento se estiver ativo
        if (elementFilter) {
            filtered = filtered.filter(magic =>
                magic.elemento.toUpperCase() === elementFilter.toUpperCase()
            )
        }

        // Ordena as magias conforme critério selecionado
        switch (sortType) {
        case 'elemento':
            filtered.sort((a, b) => a.elemento.localeCompare(b.elemento))
            break
        case 'level':
            filtered.sort((a, b) => ((b as any).level ?? 0) - ((a as any).level ?? 0))
            break
        case 'name':
        default:
            filtered.sort((a, b) => (a as any).name?.localeCompare((b as any).name) || 0)
            break
        }

        return filtered
    }, [ magics, elementFilter, sortType ])

    // Extrai elementos únicos para os filtros
    const uniqueElements = useMemo(() => {
        if (!magics?.length) return []
        const elements = new Set(magics.map(magic => magic.elemento.toUpperCase()))
        return Array.from(elements)
    }, [ magics ])

    // Estatísticas para o painel superior
    const magicsStats = useMemo(() => {
        if (!magics?.length) {
            return { count: 0, elementDistribution: {} }
        }

        // Contagem de elementos
        const elementDistribution: Record<string, number> = {}
        magics.forEach(magic => {
            const element = magic.elemento.toUpperCase()
            elementDistribution[element] = (elementDistribution[element] || 0) + 1
        })

        return {
            count: magics.length,
            elementDistribution
        }
    }, [ magics ])

    const handleRemoveMagic = useCallback((magicId: string, magicName: string) => {
        const currentMagics = [ ...magics ]
        const magicIndex = currentMagics.findIndex(m => m._id === magicId)

        if (magicIndex !== -1) {
            currentMagics.splice(magicIndex, 1)

            setValue('magics', currentMagics, { shouldValidate: true })
            setValue('points.magics', points.magics + 1, { shouldValidate: true })
            setValue('magicsSpace', magicsSpace + 1, { shouldValidate: true })

            enqueueSnackbar(`Magia ${magicName} removida!`, {
                ...toastDefault('itemDeleted', 'success'),
                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(magicName) }} />
            })
        }
    }, [ magics, points, magicsSpace, enqueueSnackbar, closeSnackbar, setValue ])

    const renderMagicCard = useCallback((magic: MagiaType) => {

        return (
            <Grid
                item
                key={magic._id ?? ''}
                xs={12}
                sm={6}
                md={4}
                lg={4}
            >
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                        delay: Math.random() * 0.1 // Efeito cascata sutil
                    }}
                    whileHover={{
                        y: -5,
                        transition: { duration: 0.2 }
                    }}
                >
                    <Magic
                        as='magic-spell'
                        id={magic._id ?? ''}
                        magic={magic}
                        onIconClick={() => { handleRemoveMagic(magic._id ?? '', magic.nome) }}
                    />
                </motion.div>
            </Grid>
        )
    }, [ handleRemoveMagic, theme.palette.primary.main ])

    const magicsList = useMemo(() => {
        if (!filteredMagics?.length) {
            // Estado vazio com mensagem contextual
            const emptyMessage = elementFilter
                ? `Nenhuma magia de elemento ${elementFilter} encontrada.`
                : 'Nenhuma magia adicionada ainda. Clique no botão acima para adicionar uma magia.';

            return (
                <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        padding: '2rem',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}
                >
                    <AutoAwesome
                        sx={{
                            fontSize: '3rem',
                            opacity: 0.4,
                            color: theme.palette.primary.main
                        }}
                    />
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ maxWidth: '80%' }}
                    >
                        {emptyMessage}
                    </Typography>
                    {elementFilter && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => setElementFilter(null)}
                            sx={{ mt: 1 }}
                        >
                            Limpar filtro
                        </Button>
                    )}
                </motion.div>
            )
        }

        // Agrupa magias por elemento se estiver ordenando por elemento
        if (sortType === 'elemento') {
            const groupedByElement: Record<string, MagiaType[]> = {}

            filteredMagics.forEach(magic => {
                const element = magic.elemento.toUpperCase()
                if (!groupedByElement[element]) groupedByElement[element] = []
                groupedByElement[element].push(magic)
            })

            return Object.entries(groupedByElement).map(([ element, spells ]) => (
                <Box key={element} sx={{ width: '100%', mb: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            pl: 2,
                            gap: 1,
                            borderLeft: `4px solid ${(elementColors as any)[element.toUpperCase()] || theme.palette.primary.main}`
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            {element}
                        </Typography>
                        <Chip
                            size="small"
                            label={spells.length}
                            sx={{
                                bgcolor: alpha((elementColors as any)[element.toUpperCase()] || theme.palette.primary.main, 0.2),
                                color: (elementColors as any)[element.toUpperCase()] || theme.palette.primary.main,
                                fontWeight: 'bold'
                            }}
                        />
                    </Box>
                    <Grid container spacing={2}>
                        {spells.map((magic) => renderMagicCard(magic))}
                    </Grid>
                </Box>
            ))
        }

        // Renderiza lista normal
        return filteredMagics.map(magic => renderMagicCard(magic))
    }, [ filteredMagics, renderMagicCard, elementFilter, sortType, theme, elementColors ])

    return (
        <>
            {/* Header com título, estatísticas e botões */}
            <Paper
                elevation={1}
                sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.98)})`,
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Efeito decorativo */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: -20,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                        zIndex: 0
                    }}
                />

                {/* Header Principal */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    flexWrap={isMobile ? 'wrap' : 'nowrap'}
                    gap={isMobile ? 1 : 0}
                    sx={{ position: 'relative', zIndex: 1 }}
                >
                    {/* Título e botão de adicionar */}
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Badge
                            badgeContent={magicsStats.count}
                            color="primary"
                            max={99}
                            sx={{
                                '.MuiBadge-badge': {
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }
                            }}
                        >
                            <AutoFixHigh
                                sx={{
                                    fontSize: '2rem',
                                    color: theme.palette.primary.main
                                }}
                            />
                        </Badge>
                        <Box>
                            <Typography
                                fontFamily='Sakana'
                                variant={isMobile ? 'h5' : 'h4'}
                                sx={{
                                    lineHeight: 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                Magias
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                            >
                                {`${magics?.length ?? 0} de ${magics?.length ?? 0 + getValues().attributes.log + 1} espaços utilizados`}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Botões de ação */}
                    <Stack direction="row" gap={1}>
                        <Tooltip title="Filtrar magias">
                            <IconButton
                                onClick={() => setFilterOpen(!filterOpen)}
                                color={filterOpen || elementFilter ? 'primary' : 'default'}
                                sx={{
                                    borderRadius: 1.5,
                                    bgcolor: filterOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    border: `1px solid ${alpha(theme.palette.primary.main, filterOpen ? 0.5 : 0.2)}`
                                }}
                            >
                                <Badge
                                    variant="dot"
                                    invisible={!elementFilter}
                                    color="primary"
                                >
                                    <FilterList />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Adicionar magia">
                            <IconButton
                                onClick={() => { setOpen(true) }}
                                color="primary"
                                disabled={magicsSpace === 0 || points.magics === 0}
                                sx={{
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.2s'
                                    },
                                    '&:disabled': {
                                        opacity: 0.5,
                                        cursor: 'not-allowed'
                                    }
                                }}
                            >
                                <AddCircle />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
                
                {/* Painel de informações */}
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    spacing={2}
                    divider={!isMobile ? <Divider orientation="vertical" flexItem /> : null}
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        pb: isMobile && filterOpen ? 1 : 0
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Espaços de Magia:
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                            <Typography fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                {magicsSpace}
                            </Typography>
                            <Tooltip title="Aumenta com Lógica">
                                <Typography variant="caption" color="text.secondary">
                                    (LOG)
                                </Typography>
                            </Tooltip>
                        </Stack>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Pontos de Magia:
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                            <Typography fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                {points?.magics ?? 0}
                            </Typography>
                            <Tooltip title="Pontos para gastar em novas magias">
                                <Typography variant="caption" color="text.secondary">
                                    disponíveis
                                </Typography>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Stack>

                {/* Painel de filtros */}
                <Collapse in={filterOpen}>
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 1.5,
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" fontWeight="medium">
                                Filtros e ordenação
                            </Typography>

                            <Divider />

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 70 }}>
                                    Ordenar por:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {[
                                        { value: 'name', label: 'Nome', icon: <ManageSearch fontSize="small" /> },
                                        { value: 'elemento', label: 'Elemento', icon: <EmojiSymbols fontSize="small" /> },
                                        { value: 'level', label: 'Nível', icon: <HourglassBottom fontSize="small" /> }
                                    ].map(option => (
                                        <Chip
                                            key={option.value}
                                            label={option.label}
                                            icon={option.icon}
                                            size="small"
                                            clickable
                                            color={sortType === option.value ? 'primary' : 'default'}
                                            onClick={() => setSortType(option.value as any)}
                                            variant={sortType === option.value ? 'filled' : 'outlined'}
                                            sx={{ borderRadius: 1.5 }}
                                        />
                                    ))}
                                </Stack>
                            </Stack>

                            {/* Filtros de elemento - só mostra se houver elementos */}
                            {uniqueElements.length > 0 && (
                                <>
                                    <Divider />

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" sx={{ minWidth: 70 }}>
                                            Elemento:
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 0.5
                                        }}>
                                            <Chip
                                                key="all"
                                                label="Todos"
                                                size="small"
                                                clickable
                                                color={!elementFilter ? 'primary' : 'default'}
                                                onClick={() => setElementFilter(null)}
                                                variant={!elementFilter ? 'filled' : 'outlined'}
                                                sx={{ borderRadius: 1.5 }}
                                            />
                                            {uniqueElements.map(element => {
                                                const count = magicsStats.elementDistribution[element] || 0;
                                                const elementColor = (elementColors as any)[element.toUpperCase()] || theme.palette.primary.main;

                                                return (
                                                    <Chip
                                                        key={element}
                                                        label={`${element} (${count})`}
                                                        size="small"
                                                        clickable
                                                        onClick={() => setElementFilter(prev => prev === element ? null : element)}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            bgcolor: elementFilter === element
                                                                ? alpha(elementColor, 0.2)
                                                                : 'transparent',
                                                            color: elementFilter === element
                                                                ? elementColor
                                                                : 'text.primary',
                                                            borderColor: alpha(elementColor, 0.3),
                                                            '&:hover': {
                                                                bgcolor: alpha(elementColor, 0.1)
                                                            }
                                                        }}
                                                        variant="outlined"
                                                    />
                                                )
                                            })}
                                        </Box>
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    </Paper>
                </Collapse>
            </Paper>

            {/* Conteúdo principal - lista de magias */}
            <Paper
                elevation={1}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: filteredMagics?.length ? 'flex-start' : 'center',
                    alignItems: 'center'
                }}
            >
                <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    sx={{ width: '100%' }}
                >
                    <AnimatePresence mode="popLayout">
                        {magicsList}
                    </AnimatePresence>
                </Grid>
            </Paper>

            {/* Modal para adicionar magias */}
            <MagicsModal
                open={open}
                onClose={() => { setOpen(false) }}
            />
        </>
    )
})

Magics.displayName = 'Magics'
export default Magics