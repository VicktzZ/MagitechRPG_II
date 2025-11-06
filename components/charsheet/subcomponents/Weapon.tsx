import { useMemo, useState, type ReactElement } from 'react'
import { alpha, Box, Chip, Collapse, Divider, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { rarityWeaponBonuses } from '@constants/dataTypes'
import { DiceRollModal } from '@components/misc'
import {
    ArrowDropUp,
    ArrowDropDown,
    CategoryOutlined,
    GpsFixed,
    FitnessCenter,
    LocalFireDepartment,
    Speed,
    Flare,
    Diamond,
    Star
} from '@mui/icons-material'
import type { ItemTyping } from '@models/types/item'
import type { Roll } from '@models/types/misc'

// TODO: CORRIGIR BUG DE ROLAGEM DE DADO
export function Weapon(props: ItemTyping<'weapon'>): ReactElement {
    const theme = useTheme()
    const [ open, setOpen ] = useState(false)
    const [ showStats, setShowStats ] = useState(false)
    const [ rollState  ] = useState<Roll>({
        name: 'Acerto',
        dice: 20,
        diceQuantity: props.diceQuantity,
        visibleDices: true,
        visibleBaseAttribute: true,
        bonus: props.bonusValue,
        sum: false
    })

    // Extrai o número do dado e o bônus do formato de string (ex: "2d6+3")
    const parseDamage = useMemo(() => {
        const extractDamageInfo = (damageStr?: string) => {
            if (!damageStr) return { dice: 0, quantity: 0, bonus: 0, display: 'N/A' }
            const parts = damageStr.match(/(\d+)d(\d+)(\+\d+)?/)
            if (!parts) return { dice: 0, quantity: 0, bonus: 0, display: damageStr }

            const quantity = Number(parts[1])
            const dice = Number(parts[2])
            const bonus = parts[3] ? Number(parts[3].replace('+', '')) : 0

            return {
                dice,
                quantity,
                bonus,
                display: damageStr
            }
        }

        return {
            base: extractDamageInfo(props.effect?.value),
            critical: extractDamageInfo(props.effect?.critValue)
        }
    }, [ props.effect ])

    // Função para rolar dano ou acerto

    return (
        <>
            <Box height='100%' display='flex' flexDirection='column' justifyContent='space-between'>
                {/* Seção de informações gerais */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.3),
                        borderRadius: 2,
                        border: `1px solid ${alpha('#ef5350', 0.2)}`
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                            INFORMAÇÕES DA ARMA
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

                    {/* Grade de estatísticas principais - sempre visível */}
                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                        <Chip
                            icon={<CategoryOutlined />}
                            size="small"
                            label={props.categ}
                            sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '& .MuiChip-icon': { color: theme.palette.error.main }
                            }}
                        />
                        <Chip
                            icon={<GpsFixed />}
                            size="small"
                            label={props.range}
                            sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '& .MuiChip-icon': { color: theme.palette.error.main }
                            }}
                        />
                        <Chip
                            icon={<FitnessCenter />}
                            size="small"
                            label={`${props.weight}kg`}
                            sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '& .MuiChip-icon': { color: theme.palette.error.main }
                            }}
                        />
                    </Stack>

                    {/* Estatísticas detalhadas - expansível */}
                    <Collapse in={showStats}>
                        <Stack spacing={1} divider={<Divider flexItem />}>
                            <Box display='flex' alignItems='center' gap={1}>
                                <LocalFireDepartment fontSize="small" color="error" />
                                <Typography variant="body2">
                                    <strong>Tipo:</strong> {props.kind}
                                </Typography>
                            </Box>

                            <Box display='flex' alignItems='center' gap={1}>
                                <Speed fontSize="small" color="error" />
                                <Typography variant="body2">
                                    <strong>Munição:</strong> {props.ammo}
                                </Typography>
                            </Box>

                            {props.accessories && (
                                <Box display='flex' alignItems='center' gap={1}>
                                    <Flare fontSize="small" color="error" />
                                    <Typography variant="body2">
                                        <strong>Acessórios:</strong> {props.accessories}
                                    </Typography>
                                </Box>
                            )}

                            <Box display='flex' alignItems='center' gap={1}>
                                <Diamond fontSize="small" color="error" />
                                <Tooltip title={`Bônus de raridade: +${rarityWeaponBonuses[props.rarity]}`}>
                                    <Typography variant="body2">
                                        <strong>Dano Base:</strong> {parseDamage.base.display}
                                    </Typography>
                                </Tooltip>
                            </Box>

                            <Box display='flex' alignItems='center' gap={1}>
                                <Star fontSize="small" color="error" />
                                <Tooltip title={`Bônus de raridade (crítico): +${rarityWeaponBonuses[props.rarity] * 2}`}>
                                    <Typography variant="body2">
                                        <strong>Dano Crítico:</strong> {parseDamage.critical.display}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Stack>
                    </Collapse>
                </Paper>

                {/* Seção de botões para rolagem */}
                {/* <Box display='flex' flexDirection='column' gap={1} mt={2}>
                    <Button
                        variant='contained'
                        size='small'
                        color='primary'
                        startIcon={<RPGIcon icon='dice_two' />}
                        onClick={() => damageRoll({ name: 'Acerto' })}
                        sx={{
                            fontWeight: 'bold',
                            transition: '0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                            }
                        }}
                    >
                        Rolar Acerto
                    </Button>
                    <Button
                        variant='contained'
                        size='small'
                        color='secondary'
                        startIcon={<RPGIcon icon='dice_four' />}
                        onClick={() => damageRoll({ name: 'Dano Arma', crit: false })}
                        sx={{
                            fontWeight: 'bold',
                            transition: '0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                            }
                        }}
                    >
                        Rolar Dano
                    </Button>
                    <Button
                        variant='contained'
                        size='small'
                        color='error'
                        startIcon={<RPGIcon icon='dice_six' />}
                        onClick={() => damageRoll({ name: 'Dano Crítico', crit: true })}
                        sx={{
                            fontWeight: 'bold',
                            transition: '0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                            }
                        }}
                    >
                        Rolar Dano Crítico
                    </Button>
                </Box> */}
            </Box>

            {open && <DiceRollModal open={open} onClose={() => { setOpen(false) }} {...rollState} />}
        </>
    )
}