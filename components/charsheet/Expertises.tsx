/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Expertise } from '@components/charsheet';
import { Box, Button, Grid, Typography, useTheme, FormHelperText, type ButtonProps, useMediaQuery, TextField } from '@mui/material';
import { blue, green, grey, purple, yellow } from '@mui/material/colors';
import { useFormContext, useWatch, type FieldError } from 'react-hook-form';
import { useState, type ReactElement, useRef, useCallback, useMemo, useEffect } from 'react';
import type { Charsheet } from '@models/entities';
import type { Expertises as ExpertisesType } from '@models';

// TODO: Ajustar limite de acordo com nível (5: Competente, 10: Experiente, 15: Especialista)
export default function Expertises({ disabled }: { disabled?: boolean }): ReactElement {
    const { control, setValue  , formState: { errors } } = useFormContext<Charsheet>()
    const theme = useTheme()

    const buttonRef = useRef<'add' | 'sub' | null>(null)
    
    const [ editValue, setEditValue ] = useState(0)
    const [ multiplier, setMultiplier ] = useState<number>(1)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const points = useWatch<Charsheet, 'points.expertises'>({
        control,
        name: 'points.expertises' as const,
        defaultValue: 0
    }) 

    // Atualiza editValue quando o multiplicador muda e um botão está ativo
    // Também considera os pontos disponíveis para não permitir incrementos impossíveis
    useEffect(() => {
        if (buttonRef.current) {
            if (buttonRef.current === 'add') {
                // Para incremento, usa o menor valor entre multiplicador e pontos disponíveis
                const effectiveIncrement = Math.min(multiplier, points);
                setEditValue(effectiveIncrement);
            } else {
                // Para decremento, o valor será exibido normalmente no botão
                // mas o valor real será calculado no handleExpertiseChange
                setEditValue(-  multiplier);
            }
        }
    }, [ multiplier, points ]);

    // Observa as mudanças nas perícias e atributos para atualizar a interface
    const expertises = useWatch<Charsheet, 'expertises'>({
        control,
        name: 'expertises'
    }) 

    const handleExpertiseChange = useCallback((name: keyof ExpertisesType, newValue: number): void => {
        if (!expertises || disabled) return;
        
        const currentValue = expertises[name]?.value || 0;
        
        // Verifica se está tentando adicionar pontos
        if (newValue > currentValue) {
            const requestedDifference = newValue - currentValue;
            
            // Se não há pontos disponíveis, cancela a operação
            if (points <= 0) {
                setEditValue(0);
                buttonRef.current = null;
                return;
            }
            
            // Se há pontos suficientes, usa a diferença solicitada
            // Se não há pontos suficientes, usa todos os pontos disponíveis
            const actualDifference = Math.min(requestedDifference, points);
            const finalValue = currentValue + actualDifference;
            
            // Atualiza os pontos disponíveis
            setValue('points.expertises', points - actualDifference, { shouldValidate: true });
            // Atualiza o valor da perícia
            setValue(`expertises.${name}.value`, finalValue, { shouldValidate: true });
        } else if (newValue < currentValue) {
            // Se o novo valor seria negativo ou o multiplicador é maior que o valor atual,
            // zera a perícia e devolve todos os pontos
            if (newValue < 0 || Math.abs(newValue - currentValue) > currentValue) {
                // Devolve todos os pontos da perícia
                setValue('points.expertises', points + currentValue, { shouldValidate: true });
                // Zera a perícia
                setValue(`expertises.${name}.value`, 0, { shouldValidate: true });
            } else {
                // Comportamento normal: devolve a diferença
                const difference = currentValue - newValue;
                setValue('points.expertises', points + difference, { shouldValidate: true });
                setValue(`expertises.${name}.value`, newValue, { shouldValidate: true });
            }
        }
        
        // Não limpa o estado de edição para permitir continuar adicionando/subtraindo pontos
        // O usuário terá que clicar novamente no botão ativo para sair do modo de edição
    }, [ disabled, expertises, setValue, points ]);
    
    function ExpertiseButton({ children, type }: { children: ReactElement, type: 'add' | 'sub' } & ButtonProps): ReactElement {
        const isActive = buttonRef.current === type;
        
        const handleClick = () => {
            if (isActive) {
                buttonRef.current = null;
                setEditValue(0);
            } else {
                buttonRef.current = type;
                setEditValue(type === 'add' ? multiplier : -multiplier);
            }
        };
        
        return (
            <Button 
                onClick={handleClick} 
                variant={isActive ? 'contained' : 'outlined'}
                disabled={disabled}
            >
                {children}
            </Button>
        );
    }

    const renderExpertises = useMemo<ReactElement[]>(() => {
        if (!expertises) return [];
        return Object.entries(expertises)
            .map(([ name, expertise ]) => {
                if (!expertise) return null;
                
                const expertiseName = name as keyof ExpertisesType;
                
                return (
                    <Expertise 
                        key={name}
                        name={expertiseName}
                        expertise={expertise}
                        diceQuantity={0}
                        disabled={disabled ?? false}
                        edit={{
                            isEditing: buttonRef.current !== null,
                            value: editValue
                        }}
                        onClick={(value: number) => handleExpertiseChange(expertiseName, value)}
                    />
                );
            })
            .filter((expertise): expertise is ReactElement => expertise !== null);
    }, [ expertises, disabled, editValue, handleExpertiseChange ]);
    
    const renderErrors = (): ReactElement | null => {
        if (!errors.expertises) return null;
        
        const expertiseError = errors.expertises as FieldError | undefined;
        if (expertiseError?.message) {
            return <FormHelperText error>{expertiseError.message}</FormHelperText>;
        }
        
        return null;
    };

    return (
        <Box display='flex' flexDirection='column' gap={3}>
            <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} gap={2}>
                <Typography>Pontos de Perícia: <b style={{ color: theme.palette.primary.main }}>{points}</b></Typography>
                {!disabled && (
                    <Box display='flex' flexDirection='column' gap={1}>
                        <Box display='flex' gap={1}>
                            <ExpertiseButton type='add'>+{multiplier}</ExpertiseButton>
                            <ExpertiseButton type='sub'>-{multiplier}</ExpertiseButton>
                        </Box>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Typography variant="caption" fontWeight="medium">
                                Multiplicador:
                            </Typography>
                            <TextField
                                size="small"
                                type="number"
                                inputProps={{ 
                                    min: 1, 
                                    max: 10, 
                                    style: { padding: '4px 8px', width: '40px' } 
                                }}
                                value={multiplier}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value >= 1 && value <= 10) {
                                        setMultiplier(value);
                                    }
                                }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
            
            {renderErrors()}
            
            <Grid
                sx={{ flexGrow: 1 }}
                justifyContent='center'
                spacing={1.5} 
                container
                columns={isMobile ? 12 : 16}
            >
                {renderExpertises}
            </Grid>
            
            <Box display='flex' width='100%' gap={2} justifyContent='center' flexWrap='wrap'>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={grey[500]}
                >Destreinado: {'< 2'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={green[500]}
                >Treinado: {'< 5'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={blue[500]}
                >Competente: {'< 7'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={purple[500]}
                >Experiente: {'< 9'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={yellow[500]}
                >Especialista: {'10+'}</Typography>
            </Box>
        </Box>
    )
}