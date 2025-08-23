/* eslint-disable @typescript-eslint/no-use-before-define */
import { RPGIcon } from '@components/misc'
import { type IconType } from '@components/misc/rpg-icons'
import {
    AutoAwesome,
    EmojiPeople,
    Favorite,
    FlashOn,
    Psychology,
    Shield
} from '@mui/icons-material'
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
import { blue, deepPurple, green, orange, red, teal } from '@mui/material/colors'
import type { Ficha } from '@types'
import { memo, type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

type MainAttributes = 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car'

interface AttributeConfig {
    icon: IconType
    muiIcon: ReactElement
    color: string
    filter: string
    label: string
    description: string
}

const attributeIcons: Record<MainAttributes, AttributeConfig> = {
    vig: {
        color: red[500],
        icon: 'health',
        muiIcon: <Favorite />,
        filter: 'invert(32%) sepia(55%) saturate(3060%) hue-rotate(343deg) brightness(99%) contrast(93%)',
        label: 'Vigor',
        description: 'Resistência física e pontos de vida'
    },
    foc: {
        color: blue[500],
        icon: 'potion',
        muiIcon: <FlashOn />,
        filter: 'invert(42%) sepia(99%) saturate(584%) hue-rotate(169deg) brightness(101%) contrast(99%)',
        label: 'Foco',
        description: 'Concentração e pontos de mana'
    },
    des: {
        color: orange[500],
        icon: 'shield',
        muiIcon: <Shield />,
        filter: 'invert(57%) sepia(63%) saturate(723%) hue-rotate(357deg) brightness(99%) contrast(107%)',
        label: 'Destreza',
        description: 'Agilidade e velocidade'
    },
    log: {
        color: teal[500],
        icon: 'book',
        muiIcon: <Psychology />,
        filter: 'invert(53%) sepia(48%) saturate(7320%) hue-rotate(150deg) brightness(89%) contrast(101%)',
        label: 'Lógica',
        description: 'Inteligência e raciocínio'
    },
    sab: {
        color: deepPurple[500],
        icon: 'pawprint',
        muiIcon: <AutoAwesome />,
        filter: 'invert(19%) sepia(90%) saturate(2394%) hue-rotate(253deg) brightness(90%) contrast(84%)',
        label: 'Sabedoria',
        description: 'Percepção e intuição'
    },
    car: {
        color: green[500],
        icon: 'aura',
        muiIcon: <EmojiPeople />,
        filter: 'invert(60%) sepia(41%) saturate(642%) hue-rotate(73deg) brightness(91%) contrast(85%)',
        label: 'Carisma',
        description: 'Presença e influência social'
    }
}

function Attribute({
    attributeName,
    attributeValue,
    onIncrement,
    onDecrement,
    error
}: { 
    attributeName: MainAttributes,
    attributeValue: number
    onIncrement?: () => void
    onDecrement?: () => void
    error?: string
}) {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const config = attributeIcons[attributeName]
    const { setValue, control } = useFormContext<Ficha>()

    const initialAttributeValue = useRef(attributeValue)
    const previousAttributeValue = useRef(attributeValue)

    const Bar = useMemo(() => {
        // Criando um componente interno memoizado
        const bar = memo(({ id }: { id: number }) => {
            const filled = attributeValue >= id
            const [ hover, setHover ] = useState(false)
            
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

            // Handlers memoizados para eventos
            const handleMouseEnter = useCallback(() => setHover(true), [])
            const handleMouseLeave = useCallback(() => setHover(false), [])

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
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{
                            width: isSmall ? '0.6rem' : matches ? '0.8rem' : '1rem',
                            height: getBarHeight(),
                            border: '1px solid',
                            borderColor: filled ? config.color : alpha(theme.palette.divider, 0.3),
                            bgcolor: getBarColor(),
                            borderRadius: 0.5,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transform: hover ? 'translateY(-2px)' : 'none',
                            boxShadow: hover && filled ? `0 4px 8px ${alpha(config.color, 0.3)}` : 'none',
                            
                            // Efeito de brilho para barras preenchidas
                            '&::before': filled ? {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.3)}, transparent)`,
                                animation: 'shine 2s infinite'
                            } : {},
                            
                            '@keyframes shine': {
                                '0%': { left: '-100%' },
                                '100%': { left: '100%' }
                            },

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
                    sx={buttonStyle}
                >
                    +
                </Button>
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={onDecrement}
                    disabled={attributeValue <= 0 || initialAttributeValue.current === attributeValue}
                    sx={buttonStyle}
                >
                    -
                </Button>
            </Box>
        )
    }, [ isSmall, config.color, attributeValue, onIncrement, onDecrement, getControlButtonSize ])

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

    // Set attributes mods
    useEffect(() => {
        setValue(`mods.attributes.${attributeName}`, Math.floor((attr / 5) - 1))
        
        const difference = attr - previousAttributeValue.current
        
        if (difference !== 0) {
            if (attributeName === 'car') {
                setValue('mods.discount', attr === 5 ? +1 : (attr * 2) - 10)
            }
            
            if (attr !== previousAttributeValue.current) {
                previousAttributeValue.current = attr
            }
        }
    }, [ attr, attributeName, setValue ])

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isSmall ? 0.5 : matches ? 1 : 2,
                p: getContainerPadding,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                border: '1px solid',
                borderColor: alpha(config.color, 0.15),
                boxShadow: `0 0 0 1px ${alpha(config.color, 0.05)} inset`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 2,
                    padding: '1px',
                    background: `linear-gradient(to right, transparent, ${alpha(config.color, 0.2)}, transparent)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                },
                '&:hover': {
                    transform: isSmall ? 'none' : 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(config.color, 0.15)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderColor: alpha(config.color, 0.35),
                    '&::before': {
                        opacity: 1
                    }
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
                    {/* Ícone com animação */}
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: matches ? 0.5 : 0.8,
                        borderRadius: '50%',
                        bgcolor: alpha(config.color, 0.1),
                        border: '2px solid',
                        borderColor: alpha(config.color, 0.3),
                        position: 'relative',
                        animation: attributeValue > 15 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                            '0%': { boxShadow: `0 0 0 0 ${alpha(config.color, 0.4)}` },
                            '70%': { boxShadow: `0 0 0 10px ${alpha(config.color, 0)}` },
                            '100%': { boxShadow: `0 0 0 0 ${alpha(config.color, 0)}` }
                        }
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
                                borderRadius: 5,
                                backgroundImage: `linear-gradient(90deg, ${alpha(config.color, 0.7)}, ${config.color})`
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
                            textShadow: attributeValue > 20 ? `0 0 10px ${alpha(config.color, 0.5)}` : 'none',
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
                                bgcolor: alpha(attributeMod >= 0 ? green[500] : red[500], 0.1),
                                border: '1px solid',
                                borderColor: alpha(attributeMod >= 0 ? green[500] : red[500], 0.3),
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
                                    color: attributeMod >= 0 ? green[500] : red[500]
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
                                    bgcolor: alpha(discountValue < 0 ? red[500] : green[500], 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(discountValue < 0 ? red[500] : green[500], 0.3),
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
                                        color: alpha(discountValue < 0 ? red[500] : green[500], 0.8)
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
                        color: red[500],
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
