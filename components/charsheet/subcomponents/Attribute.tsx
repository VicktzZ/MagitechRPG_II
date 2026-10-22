/* eslint-disable @typescript-eslint/no-use-before-define */
import { RPGIcon } from '@components/misc'
import { type IconType } from '@components/misc/rpg-icons'
import type { Charsheet } from '@models/entities'
import {
    alpha,
    Box,
    Button,
    Fade,
    LinearProgress,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from '@mui/material'
import { color } from '@themes/tokens'
import { classColor } from '@constants'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

type MainAttributes = 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car'

interface AttributeConfig {
    icon: IconType
    color: string
    filter: string
    label: string
    description: string
}

function calculateAttributeMod(attributeValue: number): number {
    if (attributeValue <= 4) return -1
    if (attributeValue <= 9) return 1
    return 2 + Math.floor((attributeValue - 10) / 10)
}

// O `filter` pinta o ícone preto de `RPGIcon` com a mesma cor de `color`; ao trocar uma, refaça a outra
const attributeIcons: Record<MainAttributes, AttributeConfig> = {
    vig: {
        color: color.lp,
        icon: 'health',
        filter: 'invert(41%) sepia(39%) saturate(1355%) hue-rotate(320deg) brightness(105%) contrast(76%)',
        label: 'Vigor',
        description: 'Resistência física e pontos de vida'
    },
    foc: {
        color: color.mp,
        icon: 'potion',
        filter: 'invert(61%) sepia(69%) saturate(563%) hue-rotate(165deg) brightness(92%) contrast(96%)',
        label: 'Foco',
        description: 'Concentração e pontos de mana'
    },
    des: {
        color: color.warning,
        icon: 'shield',
        filter: 'invert(77%) sepia(41%) saturate(6226%) hue-rotate(337deg) brightness(94%) contrast(86%)',
        label: 'Destreza',
        description: 'Agilidade e velocidade'
    },
    log: {
        color: classColor.Feiticeiro,
        icon: 'book',
        filter: 'invert(64%) sepia(14%) saturate(5680%) hue-rotate(129deg) brightness(85%) contrast(70%)',
        label: 'Lógica',
        description: 'Inteligência e raciocínio'
    },
    sab: {
        color: classColor.Bruxo,
        icon: 'pawprint',
        filter: 'invert(52%) sepia(81%) saturate(1027%) hue-rotate(219deg) brightness(87%) contrast(82%)',
        label: 'Sabedoria',
        description: 'Percepção e intuição'
    },
    car: {
        color: color.success,
        icon: 'aura',
        filter: 'invert(69%) sepia(9%) saturate(1675%) hue-rotate(91deg) brightness(91%) contrast(91%)',
        label: 'Carisma',
        description: 'Presença e influência social'
    }
}

function Attribute({
    attributeName,
    attributeValue,
    onIncrement,
    onDecrement,
    minValue = 0,
    error
}: { 
    attributeName: MainAttributes,
    attributeValue: number
    onIncrement?: () => void
    onDecrement?: () => void
    /** Valor mínimo até onde o atributo pode ser reduzido (devolvendo pontos) */
    minValue?: number
    error?: string
}) {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const config = attributeIcons[attributeName]
    const { setValue, control, getValues } = useFormContext<Charsheet>()
    const charsheet = getValues()

    const previousAttributeValue = useRef(attributeValue)

    const Bar = useMemo(() => {
        // Criando um componente interno memoizado
        const bar = memo(({ id }: { id: number }) => {
            const filled = attributeValue >= id

            // Determina a cor baseada no nível
            const getBarColor = () => {
                if (!filled) return 'transparent'
                
                // Gradiente de cores baseado no nível
                if (id <= 5) return alpha(config.color, 0.5)
                if (id <= 10) return alpha(config.color, 0.6)
                if (id <= 15) return alpha(config.color, 0.7)
                if (id <= 20) return alpha(config.color, 0.8)
                if (id <= 30) return alpha(config.color, 0.9)
                return config.color
            }

            // Determina a altura baseada no grupo
            const getBarHeight = () => {
                if (isSmall) return '0.8rem'
                if (matches) return '1.2rem'
                return '1.5rem'
            }

            return (
                <Tooltip 
                    title={
                        <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold">
                                {config.label} - Nível {id}
                            </Typography>
                            {filled && (
                                <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                    Ativo
                                </Typography>
                            )}
                        </Box>
                    }
                    arrow
                    placement="top"
                    TransitionComponent={Zoom}
                >
                    <Box 
                        sx={{
                            width: isSmall ? '0.6rem' : matches ? '0.8rem' : '1rem',
                            height: getBarHeight(),
                            border: '1px solid',
                            borderColor: filled ? config.color : alpha(theme.palette.divider, 0.3),
                            bgcolor: getBarColor(),
                            borderRadius: 0.5,
                            transition: 'background-color 120ms, border-color 120ms',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',

                            // Separadores de grupo
                            ...(id % 5 === 0 && id < 30 && {
                                marginRight: isSmall ? '0.3rem' : '0.5rem',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: isSmall ? '-0.3rem' : '-0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '1px',
                                    height: '50%',
                                    bgcolor: theme.palette.divider,
                                    opacity: 0.3
                                }
                            })
                        }}
                    />
                </Tooltip>
            )
        })

        bar.displayName = 'SingleBar'
        return bar
    }, [ attributeValue, config, isSmall, matches, theme.palette.divider ])

    const attributeBars = useMemo(() => {
        const SingleBar = Bar
        return Array.from({ length: 30 }, (_, i) => (
            <SingleBar key={i + 1} id={i + 1} />
        ))
    }, [ Bar ])

    const percentage = Math.round((attributeValue / 30) * 100)

    const getBarGap = useMemo(() => {
        if (isSmall) return '0.1rem'
        if (matches) return '0.15rem'
        return '0.2rem'
    }, [ isSmall, matches ])

    const getValueFontSize = useMemo(() => {
        if (isSmall) return '0.875rem'
        if (matches) return '1rem'
        return '1.25rem'
    }, [ isSmall, matches ])

    const getIconSize = useMemo(() => {
        if (isSmall) return 16
        if (matches) return 20
        return 24
    }, [ isSmall, matches ])

    const getContainerPadding = useMemo(() => {
        if (isSmall) return 1
        if (matches) return 1.25
        return 2
    }, [ isSmall, matches ])

    const getControlButtonSize = useMemo(() => {
        if (isSmall) return '20px'
        if (matches) return '22px'
        return '24px'
    }, [ isSmall, matches ])
    
    const renderControls = useMemo(() => {
        const buttonSize = getControlButtonSize
        const buttonStyle = {
            minWidth: buttonSize,
            width: buttonSize,
            height: buttonSize,
            p: 0,
            fontSize: '0.75rem',
            '&:hover': {
                bgcolor: alpha(config.color, 0.1),
                borderColor: config.color
            }
        }

        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                gap={0.3}
                sx={{ 
                    ml: isSmall ? 0.5 : 1
                }}
            >
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={onIncrement}
                    disabled={attributeValue >= 30}
                    aria-label={`Aumentar ${config.label}`}
                    sx={buttonStyle}
                >
                    +
                </Button>
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={onDecrement}
                    disabled={attributeValue <= Math.max(0, minValue)}
                    aria-label={`Diminuir ${config.label}`}
                    sx={buttonStyle}
                >
                    -
                </Button>
            </Box>
        )
    }, [ isSmall, config.color, config.label, attributeValue, minValue, onIncrement, onDecrement, getControlButtonSize ])

    const attr = useWatch({
        control,
        name: `attributes.${attributeName}`
    })
    
    // Observa os modificadores para exibição
    const attributeMod = useWatch({
        control,
        name: `mods.attributes.${attributeName}`
    }) || 0
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const discountValue = attributeName === 'car' ? useWatch({
        control,
        name: 'mods.discount'
    }) || -10 : 0

    // Ficha já salva: os modificadores guardados só são recalculados depois que o
    // usuário altera este atributo. Recalcular ao abrir a página mudava dados sem
    // ninguém mexer (ex.: o mod de DES guardado como 3 virava 2 só de abrir a ficha).
    const isSavedSheet = !!charsheet.id
    const initialAttr = useRef(attr)
    const attrChangedByUser = useRef(false)

    // Set attributes mods
    useEffect(() => {
        if (isSavedSheet && !attrChangedByUser.current) {
            if (attr === initialAttr.current) return
            attrChangedByUser.current = true
        }

        let lineageBonus = 0
        
        if (attributeName === 'car' && getValues('lineage') === 'Artista') {
            lineageBonus = 1
        }
        
        // Modificador do atributo (ver calculateAttributeMod):
        // 0 a 4: -1 dado (desvantagem) · 5 a 9: 1 · 10 a 19: 2 · 20 a 29: 3 · 30: 4
        const baseMod = calculateAttributeMod(attr)
        const nextMod = baseMod + lineageBonus
        if (getValues(`mods.attributes.${attributeName}`) !== nextMod) {
            setValue(`mods.attributes.${attributeName}`, nextMod, { shouldDirty: isSavedSheet })
        }
        
        const difference = attr - previousAttributeValue.current
        
        if (difference !== 0) {
            if (attributeName === 'car') {
                setValue('mods.discount', attr === 5 ? +1 : (attr * 2) - 10, { shouldDirty: isSavedSheet })
            }
            
            if (attr !== previousAttributeValue.current) {
                previousAttributeValue.current = attr
            }
        }
    }, [ attr, attributeName, isSavedSheet, getValues, setValue ])

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isSmall ? 0.5 : matches ? 1 : 2,
                p: getContainerPadding,
                borderRadius: 2,
                bgcolor: 'background.raised',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'border-color 120ms',
                position: 'relative',
                '&:hover': {
                    borderColor: color.borderStrong
                },
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* Ícone e Nome do Atributo */}
            <Tooltip 
                title={
                    <Box>
                        <Typography variant="body2" fontWeight="bold">
                            {config.label}
                        </Typography>
                        <Typography variant="caption">
                            {config.description}
                        </Typography>
                        <Box mt={1}>
                            <Typography variant="caption" fontWeight="medium">
                                {(() => {
                                    const attributeMessage = attributeMod >= 0 ? `+${attributeMod}` : attributeMod
                                    return `${attributeMessage} No modificador de ${config.label} ( ${attributeMessage} dados [${attributeMod >= 0 ? 'VANTAGEM' : 'DESVANTAGEM'}] )`
                                })()}
                                <br />
                                {attributeName === 'car' && (discountValue > 0 ? `+${discountValue}% de desconto` : `${discountValue}% de desconto`)}
                            </Typography>
                        </Box>
                    </Box>
                }   
                arrow
                placement="left"
            >
                <Box 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: matches ? '80px' : '100px'
                    }}
                >
                    {/* Ícone do atributo */}
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: matches ? 0.5 : 0.8,
                        borderRadius: '50%',
                        bgcolor: alpha(config.color, 0.1),
                        border: '2px solid',
                        borderColor: alpha(config.color, 0.3),
                        position: 'relative'
                    }}>
                        <RPGIcon
                            icon={config.icon}
                            sx={{ 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                filter: config.filter,
                                width: getIconSize,
                                height: getIconSize
                            }} 
                        />
                    </Box>
                    
                    {/* Nome do atributo */}
                    <Typography 
                        variant={matches ? 'body2' : 'body1'} 
                        fontWeight="bold"
                        letterSpacing={1}
                        sx={{ color: config.color }}
                    >
                        {attributeName.toUpperCase()}
                    </Typography>
                </Box>
            </Tooltip>

            {/* Container das barras ou barra de progresso */}
            {isSmall ? (
                <Box 
                    sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        py: 0.5,
                        px: 1,
                        gap: 0.3
                    }}
                >
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(config.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: config.color,
                                borderRadius: 5
                            }
                        }}
                    />
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            fontSize: '0.6rem',
                            textAlign: 'right',
                            color: alpha(config.color, 0.8)
                        }}
                    >
                        {percentage}%
                    </Typography>
                </Box>
            ) : (
                <Box 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: getBarGap,
                        flex: 1,
                        justifyContent: 'center',
                        py: 0.5,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none', // Para Firefox
                        '&::-webkit-scrollbar': {
                            display: 'none' // Para Chrome/Safari
                        },
                        msOverflowStyle: 'none' // Para IE/Edge
                    }}
                >
                    {attributeBars}
                </Box>
            )}

            {/* Valor e Porcentagem */}
            <Fade in timeout={500}>
                <Box 
                    sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: isSmall ? '30px' : matches ? '50px' : '60px',
                        gap: isSmall ? 0 : 0.3
                    }}
                >
                    <Typography 
                        variant={matches ? 'h6' : 'h5'} 
                        fontWeight="bold"
                        sx={{ 
                            color: attributeValue > 15 ? config.color : 'text.primary',
                            fontSize: isSmall ? '1.1rem' : getValueFontSize
                        }}
                    >
                        {attributeValue}
                    </Typography>
                    {/* Modificador de atributo com tooltip */}
                    <Tooltip
                        title={
                            <Typography variant="body2">
                                {attributeMod >= 0 ? `+${attributeMod}` : attributeMod} Dado em testes de {config.label}<br/>
                                {attributeMod >= 0 ? `+${attributeMod}` : attributeMod} no modificador de {config.label}
                            </Typography>
                        }
                        arrow
                        placement="top"
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(attributeMod >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                border: '1px solid',
                                borderColor: alpha(attributeMod >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.3),
                                borderRadius: '4px',
                                px: 0.8,
                                py: 0.1,
                                mt: 0.3,
                                mb: 0.3
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: matches ? '0.6rem' : '0.7rem',
                                    fontWeight: 'medium',
                                    color: attributeMod >= 0 ? 'success.main' : 'error.main'
                                }}
                            >
                                {attributeMod >= 0 ? `+${attributeMod}` : attributeMod}
                            </Typography>
                        </Box>
                    </Tooltip>
                    {/* Desconto para Carisma */}
                    {attributeName === 'car' && (
                        <Tooltip
                            title={
                                <Typography variant="body2">
                                    {discountValue}% de desconto em compras
                                </Typography>
                            }
                            arrow
                            placement="bottom"
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(discountValue < 0 ? theme.palette.error.main : theme.palette.success.main, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(discountValue < 0 ? theme.palette.error.main : theme.palette.success.main, 0.3),
                                    borderRadius: '4px',
                                    px: 0.8,
                                    py: 0.1,
                                    mt: 0.2,
                                    mb: 0.2
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: matches ? '0.55rem' : '0.65rem',
                                        fontWeight: 'medium',
                                        color: alpha(discountValue < 0 ? theme.palette.error.main : theme.palette.success.main, 0.8)
                                    }}
                                >
                                    {discountValue}%
                                </Typography>
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </Fade>

            {/* Mensagem de erro */}
            {error && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'error.main',
                        position: 'absolute',
                        bottom: -18,
                        right: 10,
                        fontSize: '0.7rem'
                    }}
                >
                    {error}
                </Typography>
            )}

            {/* Controles */}
            {renderControls}
        </Box>
    )
}

const MemoizedAttribute = memo(Attribute)
export default MemoizedAttribute
export { MemoizedAttribute as Attribute }
