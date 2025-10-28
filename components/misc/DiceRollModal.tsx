/* eslint-disable unused-vars/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-eval */
'use client';

import { 
    Box, Chip, Typography, useMediaQuery, useTheme, Paper, 
    IconButton, Divider, Zoom, Fade, alpha, Avatar, Tooltip, Stack,
    Collapse
} from '@mui/material'
import Modal from '@mui/material/Modal'
import { useMemo, type ReactElement, useEffect, memo, useState, useRef } from 'react'
import type { Dice } from '@models/Dice';
import { rollDice } from '@utils/diceRoller';
import { 
    Casino, Close, Visibility, VisibilityOff, 
    StarRate, Refresh, InfoOutlined
} from '@mui/icons-material';
import type { Roll } from '@models/types/misc';
import type { Attributes } from '@models';
import type { RollResult } from '@models/types/dices';

const DiceRollModal = memo(({
    open,
    onClose,
    roll,
    sum,
    isDisadvantage,
    isAdvantage,
    bonus = [],
    setResult,
    visibleDices,
    visibleBaseAttribute,
    customDice,
    rollResult
}: Partial<Roll> & {
    open: boolean
    onClose: () => void
    isDisadvantage?: boolean
    isAdvantage?: boolean
    setResult?: (result: number | number[]) => void
    // Suporte para dois modos de funcionamento:
    // 1. Roll tradicional (perícias)
    roll?: { 
        dice: number,
        quantity: number
        name: string,
        attribute: keyof Attributes
    },
    // 2. Dado personalizado
    customDice?: Dice,
    // 3. Resultado já processado (para CustomDices)
    rollResult?: RollResult
}): ReactElement => {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    // Armazenar o resultado em uma ref para persistir mesmo quando o componente perde o foco
    const diceRollRef = useRef<any>(null);
    // Ref para memoizar o resultado da rolagem de perícia entre renders
    const skillResultRef = useRef<{
        notation: string;
        result: ReturnType<typeof rollDice>;
    } | null>(null);

    const [ showDetails, setShowDetails ] = useState(false);
    const [ animateRoll, setAnimateRoll ] = useState(true);
    const [ , setRerollCount ] = useState(0);
    
    // Modo 1: Para dados tradicionais de perícias
    // Memoizamos o cálculo inicial, mas usamos a ref para persistir o valor
    const diceRoll = useMemo(() => {
        // Se estamos usando resultados pré-processados de CustomDices
        if (rollResult) {
            // Se já temos um resultado na ref e estamos com o mesmo rollResult, usar o valor da ref
            if (diceRollRef.current && diceRollRef.current.rawResult === rollResult.total) {
                return diceRollRef.current;
            }
            
            // Caso contrário, criar um novo resultado
            const formattedResult = {
                rolls: rollResult.rolls ? `[ ${rollResult.rolls.join(', ')} ]` : '',
                rawRolls: rollResult.rolls || [],
                rawResult: rollResult.total,
                // Garantimos que modifiers sempre existe e no formato correto para exibição
                modifiers: rollResult.modifiersResult || [],
                // Construir a expressão completa garantindo que TODOS os valores sejam mostrados
                result: (() => {
                    // Valor base do dado (sem modificadores)
                    let baseValue;
                    let modString = '';
                    
                    // Obter modificadores - tentamos todas as propriedades possíveis
                    const mods = rollResult.modifiersResult || [];
                    
                    // Se temos valores de rolagem individuais
                    if (rollResult.rolls && rollResult.rolls.length > 0) {
                        baseValue = rollResult.rolls.join(' + ');
                    } else {
                        // Calcular valor base subtraindo os modificadores do total
                        const modsSum = mods.reduce((s: number, m: { value: number }) => s + (m.value || 0), 0);
                        baseValue = rollResult.total - modsSum;
                    }
                    
                    // Adicionar apenas os valores numéricos dos modificadores
                    if (mods && mods.length > 0) {
                        modString = ' + ' + mods.map((m: { value: number }) => m.value).join(' + ');
                    }
                    
                    // Retornar a expressão completa
                    return `${baseValue}${modString} = ${rollResult.total}`;
                })(),
                criticalHit: rollResult.criticalHit,
                dice: rollResult.dice
            };
            
            // Atualizar a ref com o novo resultado
            diceRollRef.current = formattedResult;
            return formattedResult;
        }
        
        // Se não temos nem roll nem customDice, retorna null
        if (!roll && !customDice) return null;
        
        // Modo de perícia tradicional
        if (roll) {
            // Nova regra: quantidade de dados vem diretamente de roll.quantity (mínimo 1)
            const diceQuantity = Math.max(1, Number(roll.quantity ?? 1));
            const notation = `${diceQuantity}d${roll.dice}`;
            
            // Se já temos um resultado memoizado, usamos ele
            // Caso contrário, fazemos uma nova rolagem e guardamos
            if (!skillResultRef.current || skillResultRef.current.notation !== notation) {
                skillResultRef.current = {
                    notation,
                    result: rollDice(notation)
                };
            }
            
            const diceResult = skillResultRef.current.result;
            
            if (!diceResult) return null;

            const rolls = diceResult.rolls;
            const sortedRolls = isDisadvantage ?
                rolls.slice().sort((a, b) => a - b) : rolls.slice().sort((a, b) => b - a);

            const rollsFormatted = `[ ${rolls.join(', ')} ]`;
            let rawResult = sortedRolls[0];
            let rawBonus = 0;

            if (sum) {
                rawResult = rolls.reduce((acc, curr) => acc + curr, 0);
            }

            if (Array.isArray(bonus) && bonus.length > 0) {
                rawBonus = bonus.reduce((acc, curr) => acc + curr, 0);
                rawResult += rawBonus;
            }

            // Constrói a expressão para exibição
            let expression = '';
            
            // Primeiro adicionamos o resultado dos dados
            if (sum) {
                expression = sortedRolls.join(' + ');
            } else {
                expression = String(sortedRolls[0]);
            }
            
            // Depois adicionamos os modificadores com seus nomes
            if (Array.isArray(bonus) && bonus.length > 0) {
                // Preparamos os nomes dos modificadores
                const modifierNames = bonus.map((value, index) => {
                    const name = index === 0 && roll.attribute ? roll.attribute : 
                        (index === 1 && roll.attribute ? roll.attribute.toUpperCase() : `Bônus ${index + 1}`);
                    return `${name}: ${value}`;
                });
                
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                expression = `${expression} + ${modifierNames.join(' + ')}`;
            }

            // Converter os bônus para o formato de modificadores para exibição consistente
            const modifiers = Array.isArray(bonus) ? bonus.map((value, index) => {
                // Primeiro índice é o valor da perícia
                if (index === 0) {
                    return {
                        name: 'Perícia',
                        value
                    };
                }
                // Segundo índice é o valor do atributo correspondente
                else if (index === 1 && roll.attribute) {
                    // Se for negativo, mostramos como -1 em vez de +-1
                    return {
                        name: roll.attribute.toUpperCase(),
                        value
                    };
                } 
                // Outros índices são bônus adicionais
                else {
                    return {
                        name: `Bônus ${index}`,
                        value
                    };
                }
            }).filter(mod => mod.value !== 0) : [];  // Filtra modificadores com valor zero
            
            // Cria um novo resultado apenas se não temos um na ref ou se é um resultado diferente
            if (!diceRollRef.current || diceRollRef.current.rawResult !== rawResult) {
                const formattedResult = {
                    rolls: rollsFormatted,
                    rawRolls: rolls,
                    modifiers,
                    rawResult,
                    result: (() => {
                        // Valor base (dados)
                        let baseValue;
                        
                        // Se estamos somando todos os dados
                        if (sum) {
                            baseValue = sortedRolls.join(' + ');
                        } else {
                            // Se estamos usando apenas o maior/menor valor
                            baseValue = String(sortedRolls[0]);
                        }
                        
                        // Adicionar apenas os valores numéricos dos modificadores
                        let modString = '';
                        if (modifiers && modifiers.length > 0) {
                            modString = ' + ' + modifiers.map(m => m.value).join(' + ');
                        }
                        
                        // Retornar expressão completa
                        return `${baseValue}${modString} = ${rawResult}`;
                    })(),
                    name: roll.name
                };
                
                // Atualiza a ref
                diceRollRef.current = formattedResult;
                return formattedResult;
            }
            
            // Se já temos o mesmo resultado na ref, reutilizamos
            return diceRollRef.current;
        }
        
        // Modo de dado personalizado (será tratado pelo rollResult)
        return null;
    }, [ roll?.dice, roll?.quantity, roll?.name, roll?.attribute, customDice, rollResult, sum, isDisadvantage, Array.isArray(bonus) ? bonus.map(Number).join('|') : '' ]);

    // Garantir que os resultados persistam entre renderizações
    useEffect(() => {
        // Inicializa diceRollRef se necessário para evitar erros de undefined
        if (!diceRollRef.current && diceRoll) {
            diceRollRef.current = diceRoll;
        }
        
        // Resetar showDetails quando o modal é fechado
        if (!open) {
            setShowDetails(false);
        }
        
        // Quando o modal é fechado, preservamos o último resultado na ref
        return () => {
            // Nada a fazer, o resultado já está armazenado na ref
        };
    }, [ open, diceRoll ]);
    
    useEffect(() => {
        if (setResult && open && diceRoll) {
            setResult(diceRoll.rawResult);
        }
    }, [ setResult, diceRoll?.rawResult, open ]);
    
    // Determina o título do modal baseado no tipo de dado
    const modalTitle = useMemo(() => {
        if (rollResult?.dice) {
            return rollResult.dice.name || 'Rolagem de Dado Personalizado';
        }
        
        if (customDice) {
            return customDice.name || 'Rolagem de Dado Personalizado';
        }
        
        if (roll) {
            return roll.name || 'Rolagem de Perícia';
        }
        
        return 'Rolagem de Dados';
    }, [ rollResult?.dice, customDice, roll ]);
    
    // Determina a cor principal baseado no dado
    const diceColor = useMemo(() => {
        if (rollResult?.dice?.color) {
            return rollResult.dice.color;
        }
        
        if (customDice?.color) {
            return customDice.color;
        }
        
        return theme.palette.primary.main;
    }, [ rollResult?.dice?.color, customDice?.color, theme.palette.primary.main ]);

    // Cores temáticas baseadas no tipo de rolagem
    const rollColor = useMemo(() => {
        if (isDisadvantage) return theme.palette.error.main; // Vermelho para desvantagem
        if (isAdvantage) return theme.palette.success.main; // Verde para vantagem
        if (diceRoll?.rawResult && roll?.dice && diceRoll.rawResult >= (roll.dice * 0.8)) return theme.palette.success.main; // Verde para resultados muito altos
        if (diceRoll?.rawResult && roll?.dice && diceRoll.rawResult <= (roll.dice * 0.2)) return theme.palette.error.main; // Vermelho para resultados muito baixos
        return diceColor; // Cor do dado ou cor padrão
    }, [ diceRoll?.rawResult, isDisadvantage, isAdvantage, roll?.dice, theme, diceColor ]);

    // Determina a mensagem de resultado
    const resultMessage = useMemo(() => {
        if (!diceRoll?.rawResult || !roll?.dice) return '';

        const ratio = diceRoll.rawResult / roll.dice;

        if (isDisadvantage) return 'DESVANTAGEM';
        if (ratio >= 0.95) return 'CRÍTICO!';
        if (ratio >= 0.8) return 'EXCELENTE!';
        if (ratio >= 0.6) return 'BOM';
        if (ratio <= 0.1) return 'FALHA CRÍTICA!';
        if (ratio <= 0.2) return 'PÉSSIMO';
        return '';
    }, [ diceRoll?.rawResult, isDisadvantage, roll?.dice ]);

    // Função para reroll
    const handleReroll = () => {
        setAnimateRoll(false);
        setTimeout(() => {
            setRerollCount(prev => prev + 1);
            setAnimateRoll(true);
        }, 300);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%'
            }}
        >
            <Zoom in={open} timeout={300}>
                <Paper
                    elevation={4}
                    sx={{
                        width: matches ? '95%' : 'auto',
                        minWidth: matches ? '95%' : '400px',
                        maxWidth: matches ? '95%' : '600px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        borderRadius: 2,
                        position: 'relative',
                        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${theme.palette.background.paper} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(diceColor, 0.3)}`
                    }}
                >
                    {/* Header colorido */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        px={2.5}
                        py={1.5}
                        sx={{
                            background: `linear-gradient(90deg, ${alpha(diceColor, 0.15)}, ${alpha(diceColor, 0.05)})`,
                            borderBottom: `1px solid ${alpha(diceColor, 0.2)}`
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(diceColor, 0.1),
                                    color: diceColor,
                                    width: 32,
                                    height: 32
                                }}
                            >
                                <Casino />
                            </Avatar>
                            <Typography variant="h6" component="h2" sx={{ color: diceColor }}>
                                {modalTitle}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color="text.secondary">
                                {roll?.quantity && roll?.dice ? `${roll.quantity}d${roll.dice}` : ''}
                            </Typography>
                            {Array.isArray(bonus) && bonus.length > 0 && (
                                <Chip
                                    label={`+${bonus.reduce((a, b) => a + b, 0)}`}
                                    size="small"
                                    color={bonus.reduce((a, b) => a + b, 0) >= 0 ? 'success' : 'error'}
                                    sx={{ height: 18, fontSize: '0.7rem', fontWeight: 'bold' }}
                                />
                            )}
                            {isDisadvantage && (
                                <Chip
                                    label="DESVANTAGEM"
                                    size="small"
                                    color="error"
                                    sx={{ height: 18, fontSize: '0.7rem', fontWeight: 'bold' }}
                                />
                            )}
                            {isAdvantage && (
                                <Chip
                                    label="VANTAGEM"
                                    size="small"
                                    color="success"
                                    sx={{ height: 18, fontSize: '0.7rem', fontWeight: 'bold' }}
                                />
                            )}
                        </Box>
                        <IconButton
                            size="small"
                            onClick={onClose}
                            sx={{
                                color: alpha(theme.palette.text.primary, 0.7),
                                '&:hover': { color: theme.palette.error.main }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Conteúdo principal */}
                    <Box
                        display="flex"
                        flexDirection="column"
                        p={2.5}
                        gap={2}
                        sx={{ height: showDetails ? 'calc(100% - 73px)' : 'auto' }}
                    >
                        <Fade in={animateRoll} timeout={300}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                py={2}
                                sx={{
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Círculo de fundo */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: 160,
                                        height: 160,
                                        borderRadius: '50%',
                                        border: `2px dashed ${alpha(rollColor, 0.3)}`,
                                        animation: 'spin 30s linear infinite',
                                        '@keyframes spin': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(360deg)' }
                                        },
                                        zIndex: 0
                                    }}
                                />

                                {/* Exibição do resultado */}
                                <Box position="relative" zIndex={1} textAlign="center">
                                    <Typography
                                        fontSize={visibleDices ? '3.5rem' : '4rem'}
                                        fontWeight="bold"
                                        sx={{
                                            color: rollColor,
                                            textShadow: `0 0 10px ${alpha(rollColor, 0.5)}`,
                                            mb: 1
                                        }}
                                    >
                                        {diceRoll?.rawResult}
                                    </Typography>
                                    
                                    {resultMessage && (
                                        <Chip
                                            label={resultMessage}
                                            color={resultMessage.includes('CRÍTICO') || resultMessage.includes('EXCELENTE') ? 'success' : 
                                                resultMessage.includes('FALHA') || resultMessage.includes('PÉSSIMO') ? 'error' : 'default'}
                                            sx={{ 
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem', 
                                                mt: 1 
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Fade>

                        {/* Barra divisória com gradiente */}
                        <Divider
                            sx={{
                                '&::before, &::after': {
                                    borderTop: `1px solid ${alpha(rollColor, 0.2)}`
                                }
                            }}
                        >
                            <Chip 
                                label={`Resultado: ${diceRoll?.rawResult || 0}`} 
                                size="small"
                                sx={{
                                    bgcolor: alpha(rollColor, 0.1),
                                    color: rollColor,
                                    border: `1px solid ${alpha(rollColor, 0.3)}`
                                }}
                            />
                        </Divider>

                        {/* Rodapé com detalhes e ações */}
                        <Box 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="center"
                            gap={1}
                        >
                            <Box flex={1}>
                                <Tooltip title="Ver detalhes da rolagem" arrow>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => setShowDetails(!showDetails)}
                                        sx={{ color: alpha(rollColor, 0.8) }}
                                    >
                                        {showDetails ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Rolar novamente" arrow>
                                    <IconButton 
                                        size="small" 
                                        onClick={handleReroll}
                                        sx={{ color: alpha(rollColor, 0.8) }}
                                    >
                                        <Refresh fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            
                            {visibleBaseAttribute && (
                                <Chip
                                    icon={<StarRate fontSize="small" />}
                                    label={`Atributo: ${roll?.attribute?.toUpperCase() ?? 'N/A'}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        height: '24px',
                                        fontSize: '0.7rem',
                                        borderColor: alpha(rollColor, 0.4),
                                        color: rollColor
                                    }}
                                />
                            )}
                        </Box>

                        {/* Área de detalhes */}
                        <Collapse in={showDetails}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                                    borderColor: alpha(rollColor, 0.2),
                                    mt: 1
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                                    Detalhes da Rolagem
                                </Typography>
                                <Stack spacing={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Dados:</Typography>
                                        <Typography variant="body2">{diceRoll?.rolls}</Typography>
                                    </Box>
                                    
                                    {/* Modificadores para Expertises - Removido pois agora usamos o formato unificado */}
                                    
                                    {/* Modificadores (tanto para Perícias quanto para Dados Personalizados) */}
                                    {Array.isArray(diceRoll?.modifiers) && diceRoll.modifiers.length > 0 && (
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Modificadores:</Typography>
                                            <Typography variant="body2">
                                                {diceRoll.modifiers.map((mod: any, i: number) => (
                                                    <span key={i}>
                                                        {mod.name}: {mod.value}
                                                        {i < diceRoll.modifiers.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {/* Crítico */}
                                    {diceRoll?.criticalHit && (
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="error.main" fontWeight="medium">
                                                CRÍTICO!
                                            </Typography>
                                            <Chip 
                                                icon={<StarRate fontSize="small" />}
                                                label="Acerto Crítico" 
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                            />
                                        </Box>
                                    )}
                                    
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Expressão:</Typography>
                                        <Typography variant="body2">{diceRoll?.result}</Typography>
                                    </Box>
                                    
                                    {isDisadvantage && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="error.main" fontWeight="medium">
                                                Rolagem com desvantagem (-1)
                                            </Typography>
                                            <Tooltip title="Usa o menor valor entre os dados" arrow>
                                                <InfoOutlined fontSize="small" color="action" />
                                            </Tooltip>
                                        </Box>
                                    )}
                                    {isAdvantage && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="success.main" fontWeight="medium">
                                                Rolagem com vantagem (+1 ou mais)
                                            </Typography>
                                            <Tooltip title="Usa o maior valor entre os dados" arrow>
                                                <InfoOutlined fontSize="small" color="action" />
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        </Collapse>
                    </Box>
                </Paper>
            </Zoom>
        </Modal>
    );
})

DiceRollModal.displayName = 'DiceRollModal';
export default DiceRollModal;