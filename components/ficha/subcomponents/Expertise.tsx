'use client';

import { 
    Box, 
    Grid, 
    Typography, 
    useMediaQuery, 
    useTheme, 
    Paper,
    Chip,
    Tooltip,
    ButtonBase,
    alpha
} from '@mui/material';
import { useState, type ReactElement, useCallback } from 'react';
import { blue, green, grey, purple, yellow, red } from '@mui/material/colors';
import DiceRollModal from '@components/misc/DiceRollModal';
import { useFormContext } from 'react-hook-form';
import { Casino, Edit, TrendingUp } from '@mui/icons-material';
import type { Attributes, Expertise as ExpertiseType, Expertises } from '@models';
import type { Charsheet } from '@models/entities';

interface ExpertiseProps {
    name: keyof Expertises;
    expertise: ExpertiseType;
    diceQuantity: number;
    disabled: boolean;
    edit?: {
        isEditing: boolean;
        value: number;
    };
    onClick?: (value: number) => void;
}

export default function Expertise({ 
    name,
    expertise,
    disabled,
    edit,
    onClick
}: ExpertiseProps): ReactElement {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [ open, setOpen ] = useState<boolean>(false);
    const [ isHovered, setIsHovered ] = useState<boolean>(false);
    const { getValues } = useFormContext<Charsheet>();

    const determinateColor = useCallback((): string => {
        if (expertise.value < 0) {
            return red[500] // Valores negativos em vermelho
        } else if (expertise.value < 2) {
            return grey[500]
        } else if (expertise.value < 5) {
            return green[500]
        } else if (expertise.value < 7) {
            return blue[500]
        } else if (expertise.value < 9) {
            return purple[500]
        } else {
            return yellow[500]
        }
    }, [ expertise.value ]);

    const getProficiencyLevel = useCallback((): string => {
        if (expertise.value < 2) return 'Destreinado'
        if (expertise.value < 5) return 'Treinado'
        if (expertise.value < 7) return 'Competente'
        if (expertise.value < 9) return 'Experiente'
        return 'Especialista'
    }, [ expertise.value ]);

    const handleClick = useCallback((): void => {
        if (!edit?.isEditing) {
            setOpen(true);
        } else if (onClick) {
            const newValue = expertise.value + edit.value;
            // Permite incrementar pontos em perícias negativas e respeita os limites máximos
            if (edit.value > 0 && expertise.value < 0) {
                onClick(newValue);
            } else if (getValues().id ? newValue >= 0 && newValue <= 10 : newValue >= 0 && newValue <= 3) {
                onClick(newValue);
            }
        }
    }, [ edit, expertise.value, onClick, getValues ]);

    const getEditPreview = useCallback((): number => {
        if (!edit?.isEditing) return expertise.value;
        const newValue = expertise.value + edit.value;
        return Math.max(0, Math.min(10, newValue));
    }, [ edit, expertise.value ]);

    const isEditing = edit?.isEditing ?? false;
    const previewValue = getEditPreview();
    const color = determinateColor();
    const proficiencyLevel = getProficiencyLevel();
    const attr: keyof Attributes = expertise.defaultAttribute;
    const attrModifier = getValues().mods.attributes[attr] || 0;
    
    // Determinar se é vantagem, desvantagem ou normal com base no modificador do atributo
    const isAdvantage = attrModifier > 0;
    const isDisadvantage = attrModifier < 0;
    
    // Determinar quantidade de dados baseada na regra:
    // -1: Desvantagem (2 dados), 0: Normal (1 dado), +1: Vantagem (2 dados), >+1: Vantagem (múltiplos dados)
    const diceQuantity = attrModifier < 0 ? 2 : attrModifier;

    return (
        <>
            <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2}
                key={name}
            >
                <Tooltip 
                    title={
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {name}
                            </Typography>
                            <Typography variant="body2">
                                Nível: {proficiencyLevel}
                            </Typography>
                            <Typography variant="body2">
                                Valor: {expertise.value}
                            </Typography>
                            <Typography variant="body2">
                                Atributo: {expertise.defaultAttribute?.toUpperCase() || 'Nenhum'}
                            </Typography>
                            {isEditing && (
                                <Typography variant="body2" color="warning.main">
                                    Novo valor: {previewValue}
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" mt={1}>
                                {isEditing ? 'Clique para aplicar' : 'Clique para rolar dados'}
                            </Typography>
                        </Box>
                    }
                    placement="top"
                    arrow
                >
                    <ButtonBase
                        onClick={handleClick}
                        disabled={disabled}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        sx={{
                            width: '100%',
                            height: matches ? '140px' : '180px',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[8]
                            },
                            '&:active': {
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <Paper
                            elevation={isHovered ? 8 : 2}
                            sx={{
                                width: '100%',
                                height: '100%',
                                p: matches ? 1.5 : 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: `2px solid ${isEditing ? theme.palette.warning.main : alpha(color, 0.3)}`,
                                borderRadius: 2,
                                bgcolor: isEditing 
                                    ? alpha(theme.palette.warning.main, 0.05)
                                    : alpha(color, 0.05),
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    bgcolor: color,
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            {/* Ícone de edição */}
                            {isEditing && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 1
                                    }}
                                >
                                    <Edit
                                        sx={{
                                            fontSize: '1.2rem',
                                            color: theme.palette.warning.main,
                                            animation: 'pulse 2s infinite',
                                            '@keyframes pulse': {
                                                '0%': { opacity: 0.5 },
                                                '50%': { opacity: 1 },
                                                '100%': { opacity: 0.5 }
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Valor da perícia */}
                            <Box 
                                display='flex' 
                                alignItems='center' 
                                justifyContent='center'
                                sx={{
                                    minHeight: matches ? '45px' : '50px',
                                    width: '100%',
                                    mt: 1
                                }}
                            >
                                <Box 
                                    display='flex' 
                                    alignItems='center' 
                                    gap={0.5}
                                    sx={{
                                        fontSize: matches ? '1.8rem' : '2.2rem',
                                        fontWeight: 'bold',
                                        color,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Typography 
                                        fontSize='inherit' 
                                        fontFamily='D20'
                                        sx={{ 
                                            transform: 'rotate(-15deg)',
                                            display: 'inline-block',
                                            marginRight: '6px'
                                        }}
                                    >
                                        -
                                    </Typography>
                                    <Typography fontSize='inherit' fontWeight='inherit'>
                                        +{isEditing ? previewValue : expertise.value}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Nome da perícia */}
                            <Box sx={{ 
                                width: '100%', 
                                textAlign: 'center',
                                px: 1,
                                py: 1
                            }}>
                                <Typography 
                                    variant={matches ? 'body2' : 'body1'}
                                    fontWeight='bold'
                                    color={color}
                                    sx={{
                                        lineHeight: 1.3,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        wordBreak: 'break-word',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        minHeight: matches ? '32px' : '40px'
                                    }}
                                >
                                    {name}
                                </Typography>
                            </Box>

                            {/* Chip de nível */}
                            <Box sx={{ width: '100%', px: 1, pb: 1 }}>
                                <Chip
                                    label={proficiencyLevel}
                                    size="small"
                                    icon={
                                        expertise.value >= 7 ? <TrendingUp sx={{ fontSize: '1rem' }} /> : 
                                            expertise.value >= 2 ? <Casino sx={{ fontSize: '1rem' }} /> : undefined
                                    }
                                    sx={{
                                        width: '100%',
                                        height: matches ? '22px' : '24px',
                                        fontSize: matches ? '0.65rem' : '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: alpha(color, 0.2),
                                        color,
                                        border: `1px solid ${alpha(color, 0.3)}`,
                                        '& .MuiChip-icon': {
                                            color,
                                            marginLeft: '4px'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Indicador de mudança de valor */}
                            {isEditing && edit?.value !== 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 6,
                                        right: 6,
                                        bgcolor: (edit?.value ?? 0) > 0 ? green[500] : red[500],
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        boxShadow: theme.shadows[2]
                                    }}
                                >
                                    {(edit?.value ?? 0) > 0 ? '+' : ''}{edit?.value ?? 0}
                                </Box>
                            )}
                        </Paper>
                    </ButtonBase>
                </Tooltip>
            </Grid>

            {/* Modal de rolagem de dados */}
            {open && (
                <DiceRollModal 
                    open={open}
                    onClose={() => setOpen(false)}
                    bonus={[ expertise.value ]}
                    isDisadvantage={isDisadvantage}
                    isAdvantage={isAdvantage}
                    visibleBaseAttribute
                    visibleDices
                    roll={{
                        name,
                        dice: 20,
                        attribute: expertise.defaultAttribute,
                        quantity: diceQuantity
                    }}
                />
            )}
        </>
    )
}