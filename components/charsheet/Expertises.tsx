/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Expertise } from '@components/charsheet';
import { Box, Button, Grid, Typography, useTheme, FormHelperText, useMediaQuery, TextField } from '@mui/material';
import { classColor } from '@constants';
import { useFormContext, useWatch, type FieldError } from 'react-hook-form';
import { useState, type ReactElement, type ReactNode, useRef, useCallback, useMemo, useEffect } from 'react';
import type { Charsheet } from '@models/entities';
import type { Attributes, Expertises as ExpertisesType } from '@models';
import { evaluateFormula } from '@utils/formulaEvaluator';
import { computeAttributeInfluence } from '@utils/systemLookups';
import { computeOriginBonuses } from '@utils/originBonuses';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';

/**
 * Botão de modo de edição (+N / -N). Fica fora do componente de propósito: declarado
 * dentro do render, o React o recria a cada renderização e o botão perde o foco.
 */
function ExpertiseButton({ children, active, disabled, label, onToggle }: {
    children: ReactNode
    active: boolean
    disabled?: boolean
    label: string
    onToggle: () => void
}): ReactElement {
    return (
        <Button
            onClick={onToggle}
            variant={active ? 'contained' : 'outlined'}
            disabled={disabled}
            aria-pressed={active}
            aria-label={label}
        >
            {children}
        </Button>
    );
}

/** Multiplicador digitado: vazio é aceito durante a edição; ao usar, vale de 1 a 10. */
function parseMultiplier(input: string): number {
    const value = parseInt(input, 10);
    if (Number.isNaN(value)) return 1;
    return Math.min(10, Math.max(1, value));
}

export default function Expertises({ disabled }: { disabled?: boolean }): ReactElement {
    const { control, setValue, getValues, formState: { errors } } = useFormContext<Charsheet>()
    const theme = useTheme()
    const charsheet = getValues()

    const buttonRef = useRef<'add' | 'sub' | null>(null)
    
    const [ editValue, setEditValue ] = useState(0)
    const [ multiplierInput, setMultiplierInput ] = useState<string>('1')
    const multiplier = useMemo(() => parseMultiplier(multiplierInput), [ multiplierInput ])
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // Sistema customizado (cache compartilhado em useCharsheetSystem). Falha ao carregar
    // não vira "sistema": a ficha continua com systemId e mostra um aviso.
    const { system: customSystem, loading: loadingSystem } = useCharsheetSystem(charsheet.systemId)
    const systemExpertises = customSystem?.expertises && customSystem.expertises.length > 0 ? customSystem.expertises : null
    const skillPointRules = customSystem?.skillPointRules ?? null
    const systemAttributes = customSystem?.attributes && customSystem.attributes.length > 0 ? customSystem.attributes : null
    const systemLoadFailed = Boolean(charsheet.systemId) && !loadingSystem && !customSystem

    // Inicializa as perícias do sistema que a ficha ainda não tem
    useEffect(() => {
        if (!customSystem?.expertises || customSystem.expertises.length === 0) return

        const currentExpertises = getValues('expertises') || {}
        const newExpertises: any = { ...currentExpertises }
        let hasChanges = false

        customSystem.expertises.forEach(exp => {
            if (!newExpertises[exp.key]) {
                newExpertises[exp.key] = {
                    value: 0,
                    defaultAttribute: exp.defaultAttribute || 'sab'
                }
                hasChanges = true
            }
        })

        if (hasChanges) {
            setValue('expertises', newExpertises, { shouldValidate: false })
        }
    }, [ customSystem, getValues, setValue ])

    const points = useWatch<Charsheet, 'points.expertises'>({
        control,
        name: 'points.expertises' as const,
        defaultValue: 0
    })

    const charsheetLevel = useWatch<Charsheet, 'level'>({
        control,
        name: 'level',
        defaultValue: 1
    })

    const maxPerSkill = useMemo<number>(() => {
        if (!skillPointRules?.maxPointsPerSkillFormula) return 10;
        return Math.max(1, evaluateFormula(skillPointRules.maxPointsPerSkillFormula, { level: charsheetLevel || 1 }, 10));
    }, [ skillPointRules, charsheetLevel ]);

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

    // Valores das perícias ao carregar a ficha: em fichas já salvas, só é
    // possível devolver pontos gastos nesta edição (não abaixo do valor salvo).
    // Guarda só os números: getValues devolve o objeto interno do form, que o setValue altera.
    const [ initialExpertiseValues ] = useState<Record<string, number>>(() => Object.fromEntries(
        Object.entries((getValues('expertises') ?? {}) as unknown as Record<string, { value?: number } | undefined>)
            .map(([ key, expertise ]) => [ key, expertise?.value ?? 0 ])
    ))

    const [ charsheetClass, lineage, occupation, traits, mode ] = useWatch<Charsheet>({
        control,
        name: [ 'class', 'lineage', 'occupation', 'traits', 'mode' ]
    }) as [ string, string, string, unknown[], string ]

    // Bônus concedidos pela origem (classe, linhagem/profissão, traços).
    // Não foram comprados com pontos, então não podem ser devolvidos como pontos.
    const originBonuses = useMemo(() => {
        if (charsheet.systemId && !customSystem) return { attributes: {}, expertises: {} }
        return computeOriginBonuses(
            { class: charsheetClass, lineage, occupation, traits, mode },
            charsheet.systemId ? customSystem : null
        )
    }, [ charsheet.systemId, customSystem, charsheetClass, lineage, occupation, traits, mode ])

    const expertiseFloor = useCallback((name: string): number => {
        const originFloor = originBonuses.expertises[name] ?? 0
        if (!charsheet.id) return originFloor
        return Math.max(originFloor, initialExpertiseValues[name] ?? 0)
    }, [ originBonuses, charsheet.id, initialExpertiseValues ])

    const handleExpertiseChange = useCallback((name: keyof ExpertisesType | string, newValue: number): void => {
        if (!expertises || disabled) return;

        const currentValue = expertises[name as keyof ExpertisesType]?.value || 0;
        const skillCost = skillPointRules?.classSkillCost ?? 1;

        if (newValue > currentValue) {
            const requestedDifference = newValue - currentValue;

            if (points <= 0) {
                setEditValue(0);
                buttonRef.current = null;
                return;
            }

            const maxAffordableRanks = Math.floor(points / skillCost);
            const roomLeftForCap = Math.max(0, maxPerSkill - currentValue);
            const actualDifference = Math.min(requestedDifference, maxAffordableRanks, roomLeftForCap);

            if (actualDifference <= 0) {
                setEditValue(0);
                buttonRef.current = null;
                return;
            }

            const finalValue = currentValue + actualDifference;
            const pointsToSpend = actualDifference * skillCost;

            setValue('points.expertises', points - pointsToSpend, { shouldValidate: true });
            setValue(`expertises.${name}.value` as any, finalValue, { shouldValidate: true });
        } else if (newValue < currentValue) {
            // Só devolve pontos que foram gastos: nunca abaixo dos bônus de origem
            // (senão trocar a origem gerava pontos infinitos) nem abaixo de 0
            const minAllowed = Math.min(currentValue, Math.max(0, expertiseFloor(name)));
            const finalValue = Math.max(newValue, minAllowed);
            if (finalValue >= currentValue) return;

            const difference = currentValue - finalValue;
            setValue('points.expertises', points + difference * skillCost, { shouldValidate: true });
            setValue(`expertises.${name}.value` as any, finalValue, { shouldValidate: true });
        }
    }, [ disabled, expertises, setValue, points, skillPointRules, maxPerSkill, expertiseFloor ]);
    
    const toggleEditMode = (type: 'add' | 'sub'): void => {
        if (buttonRef.current === type) {
            buttonRef.current = null;
            setEditValue(0);
        } else {
            buttonRef.current = type;
            setEditValue(type === 'add' ? multiplier : -multiplier);
        }
    };

    const renderExpertises = useMemo<ReactElement[]>(() => {
        if (!expertises) return [];

        // Sistema customizado: usa exclusivamente as perícias definidas nele —
        // mesmo que ainda não tenha nenhuma, nunca cai para os padrões do Magitech.
        if (charsheet.systemId && (!systemExpertises || systemExpertises.length === 0)) {
            return [];
        }

        // Se há perícias customizadas do sistema, renderizar apenas elas
        if (systemExpertises && systemExpertises.length > 0) {
            const attributesValues = getValues('attributes') as unknown as Record<string, number> | undefined

            return systemExpertises.map((sysExpertise) => {
                // Buscar ou criar expertise
                let expertise = expertises[sysExpertise.key as keyof ExpertisesType]

                // Se não existir, criar temporariamente para renderização
                if (!expertise) {
                    expertise = {
                        value: 0,
                        defaultAttribute: (sysExpertise.defaultAttribute || 'sab') as keyof Attributes
                    }
                }

                // Influência do atributo vinculado (vantagem/soma) e rótulo legível
                const attrDef = systemAttributes?.find(a =>
                    a.key === sysExpertise.defaultAttribute || a.name === sysExpertise.defaultAttribute
                )
                const attrValue = attrDef ? (attributesValues?.[attrDef.key] ?? 0) : 0
                const influence = computeAttributeInfluence(attrDef, attrValue, charsheetLevel || 1)

                return (
                    <Expertise
                        key={sysExpertise.key}
                        name={sysExpertise.key}
                        expertise={expertise}
                        diceQuantity={0}
                        disabled={disabled ?? false}
                        edit={{
                            isEditing: buttonRef.current !== null,
                            value: editValue
                        }}
                        onClick={(value: number) => handleExpertiseChange(sysExpertise.key as any, value)}
                        customLabel={sysExpertise.name}
                        maxValue={maxPerSkill}
                        attributeLabel={attrDef ? attrDef.abbreviation : (sysExpertise.defaultAttribute ? undefined : 'Nenhum')}
                        customInfluence={influence}
                    />
                )
            })
        }
        
        // Caso contrário, renderizar perícias padrão do Magitech
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
                        maxValue={maxPerSkill}
                    />
                );
            })
            .filter((expertise): expertise is ReactElement => expertise !== null);
    }, [ expertises, disabled, editValue, handleExpertiseChange, systemExpertises, maxPerSkill, systemAttributes, charsheetLevel, charsheet.systemId ]);
    
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
                            <ExpertiseButton
                                active={buttonRef.current === 'add'}
                                label={`Adicionar ${multiplier} ponto(s) por clique`}
                                onToggle={() => toggleEditMode('add')}
                            >
                                +{multiplier}
                            </ExpertiseButton>
                            <ExpertiseButton
                                active={buttonRef.current === 'sub'}
                                label={`Remover ${multiplier} ponto(s) por clique`}
                                onToggle={() => toggleEditMode('sub')}
                            >
                                -{multiplier}
                            </ExpertiseButton>
                        </Box>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Typography variant="caption" fontWeight="medium" component='span' id='expertises-multiplier-label'>
                                Multiplicador:
                            </Typography>
                            <TextField
                                size="small"
                                type="number"
                                inputProps={{ 
                                    min: 1, 
                                    max: 10, 
                                    'aria-labelledby': 'expertises-multiplier-label',
                                    style: { padding: '4px 8px', width: '40px' } 
                                }}
                                value={multiplierInput}
                                onChange={(e) => {
                                    // Aceita campo vazio e até 2 dígitos enquanto digita
                                    const value = e.target.value;
                                    if (value === '' || /^\d{0,2}$/.test(value)) {
                                        setMultiplierInput(value);
                                    }
                                }}
                                onBlur={() => setMultiplierInput(String(multiplier))}
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

            {systemLoadFailed && (
                <Typography variant='body2' color='warning.light' role='alert'>
                    Não foi possível carregar as perícias do sistema desta ficha. Recarregue a página para tentar de novo.
                </Typography>
            )}
            
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
                    color='text.secondary'
                >Destreinado: {'< 2'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color='success.main'
                >Treinado: {'< 5'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color='info.main'
                >Competente: {'< 7'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color={classColor.Bruxo}
                >Experiente: {'< 9'}</Typography>
                <Typography 
                    variant='caption'
                    fontWeight={900}
                    color='primary.main'
                >Especialista: {'10+'}</Typography>
            </Box>
        </Box>
    )
}