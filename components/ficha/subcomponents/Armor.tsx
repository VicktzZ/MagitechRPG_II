import { rarityArmorBonuses } from '@constants/dataTypes'
import { useTheme, Box, Paper, alpha, Stack, Typography, IconButton, LinearProgress, Chip, Collapse, Divider, Tooltip } from '@mui/material'
import { ArrowDropUp, ArrowDropDown, CategoryOutlined, Speed, FitnessCenter, Shield, Star, InfoOutlined } from '@mui/icons-material'
import { type ReactElement, useState, useMemo } from 'react'
import type { ItemTyping } from '@models/types/item'

export function Armor(props: ItemTyping<'armor'>): ReactElement {
    const theme = useTheme()
    const [ showStats, setShowStats ] = useState(false)

    // Calcula o bônus de raridade para armadura
    const rarityBonus = useMemo(() => {
        return rarityArmorBonuses[props.rarity] || 0
    }, [ props.rarity ])

    // Calcula o valor total de proteção (valor base + bônus de raridade)
    const totalProtection = useMemo(() => {
        return (props.value || 0) + rarityBonus
    }, [ props.value, rarityBonus ])

    return (
        <Box height='100%' display='flex' flexDirection='column' justifyContent='space-between'>
            {/* Seção principal de informações */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.3),
                    borderRadius: 2,
                    border: `1px solid ${alpha('#42a5f5', 0.2)}`
                }}
            >
                <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="info.main">
                        INFORMAÇÕES DA ARMADURA
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowStats(!showStats)}
                        sx={{
                            transform: showStats ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    >
                        {showStats ? <ArrowDropUp /> : <ArrowDropDown />}
                    </IconButton>
                </Stack>

                {/* Indicador visual do nível de proteção */}
                <Box mb={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">
                            Proteção
                        </Typography>
                        <Box flex={1}>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min((totalProtection / 15) * 100, 100)} // 30 como valor máximo hipotético
                                sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 1,
                                        backgroundColor: theme.palette.info.main
                                    }
                                }}
                            />
                        </Box>
                        <Chip
                            label={totalProtection}
                            size="small"
                            color="info"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Stack>
                </Box>

                {/* Grade de estatísticas principais - sempre visível */}
                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    <Chip
                        icon={<CategoryOutlined />}
                        size="small"
                        label={props.categ}
                        sx={{
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '& .MuiChip-icon': { color: theme.palette.info.main }
                        }}
                    />
                    <Chip
                        icon={<Speed />}
                        size="small"
                        label={`Pen. ${props.displacementPenalty}`}
                        sx={{
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '& .MuiChip-icon': { color: theme.palette.info.main }
                        }}
                    />
                    <Chip
                        icon={<FitnessCenter />}
                        size="small"
                        label={`${props.weight}kg`}
                        sx={{
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '& .MuiChip-icon': { color: theme.palette.info.main }
                        }}
                    />
                </Stack>

                {/* Estatísticas detalhadas - expansível */}
                <Collapse in={showStats}>
                    <Stack spacing={1} divider={<Divider flexItem />}>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Shield fontSize="small" color="info" />
                            <Typography variant="body2">
                                <strong>Tipo de Defesa:</strong> {props.kind}
                            </Typography>
                        </Box>

                        <Box display='flex' alignItems='center' gap={1}>
                            <Star fontSize="small" color="info" />
                            <Tooltip title={`Bônus de raridade: +${rarityBonus}`}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2">
                                        <strong>Proteção Base:</strong> {props.value}
                                    </Typography>
                                    <Chip
                                        label={`+${rarityBonus}`}
                                        size="small"
                                        sx={{
                                            height: 16,
                                            fontSize: '0.6rem',
                                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                                            color: theme.palette.info.main
                                        }}
                                    />
                                </Box>
                            </Tooltip>
                        </Box>
                    </Stack>
                </Collapse>
            </Paper>

            {/* Área de informação adicional */}
            <Box mt={2} p={1} bgcolor={alpha(theme.palette.info.main, 0.05)} borderRadius={1}>
                <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                    <InfoOutlined fontSize="inherit" color="info" />
                    Proteção total: {props.value} (base) + {rarityBonus} (raridade) = {totalProtection}
                </Typography>
            </Box>
        </Box>
    )
}