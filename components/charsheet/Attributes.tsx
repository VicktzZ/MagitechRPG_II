/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { RadarChart } from '@components/misc'
import { LinearProgressWithLabel } from '@layout'
import { Box, TextField, Tooltip } from '@mui/material'
import { type ReactElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import {
    Chip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'

import { Assessment, InfoOutlined, LocalFireDepartment } from '@mui/icons-material'

import { classColor } from '@constants'
import { classesModel } from '@constants/classes'
import { races } from '@constants/races'
import { getMpLimit } from '@utils/mpLimit'
import Attribute from './subcomponents/Attribute'
import LevelAndInfo from './LevelAndInfo'
import type { Charsheet } from '@models/entities'

const DEFAULT_ATTRIBUTE_KEYS = [ 'vig', 'foc', 'des', 'log', 'sab', 'car' ] as const

/**
 * "Overall" da ficha: soma dos atributos + valores de perícia + nível.
 * `attributeKeys` troca os seis atributos do Magitech pelos de um sistema customizado.
 */
export function calculateOverall({ attributes, expertises, level, attributeKeys = DEFAULT_ATTRIBUTE_KEYS }: {
    attributes?: object | null
    expertises?: object | null
    level?: number | null
    attributeKeys?: readonly string[]
}): number {
    const attributeValues = (attributes ?? {}) as Record<string, unknown>
    const attributesSum = attributeKeys.reduce((sum, key) => sum + (Number(attributeValues[key]) || 0), 0)

    const expertisesSum = Object.values(expertises ?? {}).reduce<number>(
        (sum, expertise) => sum + (expertise && typeof expertise === 'object' && 'value' in expertise
            ? (Number((expertise as { value?: unknown }).value) || 0)
            : 0),
        0
    )

    return attributesSum + expertisesSum + (level || 0)
}

/**
 * Mantém `overall` em dia com atributos, perícias e nível.
 *
 * Na criação recalcula assim que a tela abre (comportamento antigo). Em ficha já
 * salva não grava nada até o usuário mexer: recalcular na abertura mudava dados sem
 * ninguém tocar na ficha (ex.: overall guardado 18 virava 67). Depois da primeira
 * alteração passa a gravar, marcando o campo como alterado.
 */
export function useOverallSync({ attributeKeys, enabled = true }: {
    attributeKeys?: readonly string[]
    enabled?: boolean
} = {}): number {
    const { control, setValue, getValues } = useFormContext<Charsheet>()
    const attributes = useWatch({ control, name: 'attributes' })
    const expertises = useWatch({ control, name: 'expertises' })
    const level = useWatch({ control, name: 'level' })
    const isSavedSheet = !!getValues('id')

    const overall = calculateOverall({ attributes, expertises, level, attributeKeys })

    // Valor calculado ao abrir a ficha salva: enquanto não muda, nada foi alterado pelo usuário
    const openedWith = useRef<number | null>(null)
    const changedByUser = useRef(false)

    useEffect(() => {
        if (!enabled) return

        if (isSavedSheet && !changedByUser.current) {
            if (openedWith.current === null) openedWith.current = overall
            if (overall === openedWith.current) return
            changedByUser.current = true
        }

        if (getValues('overall') !== overall) {
            setValue('overall', overall, { shouldDirty: isSavedSheet })
        }
    }, [ enabled, isSavedSheet, overall, getValues, setValue ])

    return overall
}

/** Estatísticas iniciais (LP, MP, AP) de uma ficha em criação. Valores negativos viram 0. */
export function calculateInitialStats({ race, classe, vig, foc, des }: {
    race?: string
    classe?: string
    vig?: number
    foc?: number
    des?: number
}): { lp: number, mp: number, ap: number, limited: Array<'LP' | 'MP' | 'AP'> } {
    const raceStats = races[race as keyof typeof races]?.stats
    const classStats = classesModel[classe as keyof typeof classesModel]?.stats

    const raw = {
        lp: (raceStats?.lp || 0) + (classStats?.lp || 0) + (vig || 0),
        mp: (raceStats?.mp || 0) + (classStats?.mp || 0) + (foc || 0),
        ap: (raceStats?.ap || 0) + (classStats?.ap || 0) + (Math.floor((des || 0) / 10) || 0)
    }

    const limited: Array<'LP' | 'MP' | 'AP'> = []
    if (raw.lp < 0) limited.push('LP')
    if (raw.mp < 0) limited.push('MP')
    if (raw.ap < 0) limited.push('AP')

    return {
        lp: Math.max(0, raw.lp),
        mp: Math.max(0, raw.mp),
        ap: Math.max(0, raw.ap),
        limited
    }
}

function Attributes(): ReactElement {
    const { control, setValue, getValues, formState: { errors }, reset } = useFormContext<Charsheet>()
    const [ multiplier, setMultiplier ] = useState<string>('1')
    // Estatísticas iniciais que o cálculo deixou negativas e que foram limitadas a 0
    const [ limitedStats, setLimitedStats ] = useState<string[]>([])
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const charsheet = getValues()
    const disabled = !!charsheet.id

    // Overall (soma de atributos, perícias e nível), mantido em dia no formulário
    const overallValue = useOverallSync()

    const charsheetDetailsColor = useMemo(() => {
        const classe = charsheet.class
        return classColor?.[classe as keyof typeof classColor] ?? theme.palette.primary.main
    }, [ charsheet.class ])

    const multiplierValue = useMemo(() => {
        const v = parseInt(multiplier);
        if (Number.isNaN(v)) return 1;
        return Math.min(10, Math.max(1, v));
    }, [ multiplier ])

    // Valores dos atributos ao carregar a ficha. Em fichas já salvas, só é
    // possível devolver pontos gastos nesta edição (não abaixo do valor salvo).
    // Cópia: getValues devolve o objeto interno do form, que o setValue altera.
    const [ initialAttributes ] = useState(() => ({ ...getValues('attributes') }))

    const attributePoints = useCallback((attributeName: 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car') => {
        const attributeFloor = disabled ? (initialAttributes?.[attributeName] || 0) : 0

        // Aplica a diferença dos bônus derivados entre o valor antigo e o novo do atributo
        const modAttribute = (oldValue: number, newValue: number) => {
            switch(attributeName) {
            case 'vig':
                const oldVigBonus = Number((oldValue * 0.5).toFixed(1));
                const newVigBonus = Number((newValue * 0.5).toFixed(1));
                const vigBonusDiff = newVigBonus - oldVigBonus;
                
                if (vigBonusDiff !== 0) {
                    const currentCapacity = getValues('capacity.max');
                    const newCapacity = Number(currentCapacity) + Number(vigBonusDiff);
                    setValue('capacity.max', newCapacity);
                }
                break;
                
            case 'foc':
                // Para FOC, o bônus é de 0.33 * valor do atributo para pontos de magia
                const oldFocBonus = Math.floor(oldValue * 0.33);
                const newFocBonus = Math.floor(newValue * 0.33);
                const focBonusDiff = newFocBonus - oldFocBonus;
                
                if (focBonusDiff !== 0) {
                    const currentMagicPoints = getValues('points.magics');
                    const newMagicPoints = currentMagicPoints + focBonusDiff;
                    setValue('points.magics', newMagicPoints);
                }
                break;
                
            case 'des':
                // Para DES, o bônus é de 0.2 * valor do atributo para deslocamento
                const oldDesBonus = Math.floor(oldValue * 0.2);
                const newDesBonus = Math.floor(newValue * 0.2);
                const desBonusDiff = newDesBonus - oldDesBonus;
                
                if (desBonusDiff !== 0) {
                    const currentDisplacement = getValues('displacement');
                    const newDisplacement = currentDisplacement + desBonusDiff;
                    setValue('displacement', newDisplacement);
                }
                break;
                
            case 'log':
                // Para LOG, o bônus é de 0.5 * valor do atributo para espaço de magias
                const oldLogBonus = Math.floor(oldValue * 0.5);
                const newLogBonus = Math.floor(newValue * 0.5);
                const logBonusDiff = newLogBonus - oldLogBonus;
                
                if (logBonusDiff !== 0) {
                    const currentSpellSpace = getValues('spellSpace');
                    const newSpellSpace = currentSpellSpace + logBonusDiff;
                    setValue('spellSpace', newSpellSpace, { shouldValidate: true });
                }

                // A cada 10 níveis adicionados, adicione +1 ponto em "points.skills"
                const oldLogSkillBonus = Math.floor(oldValue / 10);
                const newLogSkillBonus = Math.floor(newValue / 10);
                const logSkillBonusDiff = newLogSkillBonus - oldLogSkillBonus;

                if (logSkillBonusDiff !== 0) {
                    const currentSkillPoints = getValues('points.skills');
                    const newSkillPoints = currentSkillPoints + logSkillBonusDiff;
                    setValue('points.skills', newSkillPoints);
                }
                break;
                
            case 'sab':
                // Para SAB, o bônus é de 1 * valor do atributo para pontos de perícias
                const oldSabBonus = oldValue;
                const newSabBonus = newValue;
                const sabBonusDiff = newSabBonus - oldSabBonus;
                
                if (sabBonusDiff !== 0) {
                    const currentExpertisePoints = getValues('points.expertises');
                    const newExpertisePoints = currentExpertisePoints + sabBonusDiff;
                    setValue('points.expertises', newExpertisePoints);
                }
                break;
            }
        }
       
        const onIncrement = useCallback(() => {
            const updatedAttribute = getValues(`attributes.${attributeName}`);
            const updatedPoints = getValues('points.attributes');

            const possibleIncrements = Math.min(
                multiplierValue,
                updatedPoints,
                30 - updatedAttribute
            );

            if (possibleIncrements > 0) {
                if (updatedAttribute < 30) {
                    const newAttributeValue = updatedAttribute + possibleIncrements;
                    const newPointsValue = updatedPoints - possibleIncrements;
                    
                    setValue(`attributes.${attributeName}`, newAttributeValue);
                    setValue('points.attributes', newPointsValue);
                    modAttribute(updatedAttribute, newAttributeValue)
                }
            }
        }, [ attributeName, getValues, multiplierValue, setValue ])

        const onDecrement = useCallback(() => {
            const updatedAttribute = getValues(`attributes.${attributeName}`);
            const updatedPoints = getValues('points.attributes');

            const possibleDecrements = Math.min(
                multiplierValue,
                updatedAttribute - attributeFloor
            );

            if (possibleDecrements > 0) {
                const newAttributeValue = updatedAttribute - possibleDecrements;
                const newPointsValue = updatedPoints + possibleDecrements;

                setValue(`attributes.${attributeName}`, newAttributeValue);
                setValue('points.attributes', newPointsValue);
                modAttribute(updatedAttribute, newAttributeValue)
            }
        }, [ attributeName, attributeFloor, getValues, multiplierValue, setValue ])

        return { onIncrement, onDecrement, attributeFloor }
    }, [ charsheet, getValues, setValue, reset, disabled, multiplierValue ])

    const vig = useWatch({
        control,
        name: 'attributes.vig'
    })
    const des = useWatch({
        control,
        name: 'attributes.des'
    })
    const foc = useWatch({
        control,
        name: 'attributes.foc'
    })
    const race = useWatch({
        control,
        name: 'race'
    })
    const classe = useWatch({
        control,
        name: 'class'
    })

    const raceRef = useRef(race)
    const attributesRef = useRef({ vig: Number(vig) || 0, foc: Number(foc) || 0, des: Number(des) || 0 })

    // Status Attributes
    useEffect(() => {
        if (disabled) {
            // Ficha salva: aplica só a diferença causada por uma alteração de atributo feita
            // agora. Ao abrir a página nada muda (e nada é gravado).
            // (Number(...) || 0: em sistema customizado os atributos do Magitech não existem e
            // `undefined - undefined` gravava NaN nas estatísticas da ficha salva)
            const current = { vig: Number(vig) || 0, foc: Number(foc) || 0, des: Number(des) || 0 }
            const previous = attributesRef.current
            const vigDiff = current.vig - previous.vig
            const focDiff = current.foc - previous.foc
            const apDiff = Math.floor(current.des / 10) - Math.floor(previous.des / 10)
            attributesRef.current = current

            if (vigDiff === 0 && focDiff === 0 && apDiff === 0) return

            const saved = getValues('stats')
            const options = { shouldDirty: true }
            setValue('stats.lp', Math.max(0, saved.lp + vigDiff), options)
            setValue('stats.maxLp', Math.max(0, saved.maxLp + vigDiff), options)
            setValue('stats.mp', Math.max(0, saved.mp + focDiff), options)
            setValue('stats.maxMp', Math.max(0, saved.maxMp + focDiff), options)
            setValue('stats.ap', Math.max(0, saved.ap + apDiff), options)
            setValue('stats.maxAp', Math.max(0, saved.maxAp + apDiff), options)
            return
        }

        // Criação: estatísticas iniciais da raça + classe + atributo. Nunca negativas
        const initial = calculateInitialStats({ race, classe, vig, foc, des })

        setValue('stats.lp', initial.lp)
        setValue('stats.maxLp', initial.lp)
        setValue('stats.mp', initial.mp)
        setValue('stats.maxMp', initial.mp)
        setValue('stats.ap', initial.ap)
        setValue('stats.maxAp', initial.ap)

        setLimitedStats(previous => (
            previous.join() === initial.limited.join() ? previous : initial.limited
        ))
    }, [ vig, des, foc, race, classe, disabled, getValues, setValue ])

    // Pontos de atributo extras da raça (ex: 'Humano'): aplica só a diferença
    // quando a raça muda — ao montar (ex: rascunho restaurado) nada é alterado
    useEffect(() => {
        if (getValues('id')) return
        const previousRace = raceRef.current
        raceRef.current = race
        if (previousRace === race) return

        const racePoints = (raceName: typeof race) => races[raceName as keyof typeof races]?.stats.pda || 0
        const diff = racePoints(race) - racePoints(previousRace)

        if (diff !== 0) {
            setValue('points.attributes', getValues('points.attributes') + diff)
        }
    }, [ race, getValues, setValue ])
    
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            {/* Layout Responsivo */}
            <Box
                display='flex'
                flexDirection='column'
                gap={matches ? 2 : 3}
                sx={{
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                {/* Seção do Radar Chart e Barras de Progresso */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: matches ? 1 : 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant={matches ? 'subtitle1' : 'h6'} component='h3' fontWeight="bold" color="primary">
                        Atributos Físicos
                    </Typography>
                    <Box display='flex' gap={2} flexDirection={matches ? 'column' : 'row'}>
                        {/* Radar Chart */}
                        <Box
                            sx={{
                                p: matches ? 1 : 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                height: matches ? '250px' : '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                max: '100%'
                            }}
                        >
                            <RadarChart
                                data={{
                                    labels: [ 'VIG', 'DES', 'FOC', 'LOG', 'SAB', 'CAR' ],
                                    datasets: [
                                        {
                                            label: 'Atributos',
                                            data: [
                                                getValues('attributes.vig'),
                                                getValues('attributes.des'),
                                                getValues('attributes.foc'),
                                                getValues('attributes.log'),
                                                getValues('attributes.sab'),
                                                getValues('attributes.car')
                                            ],
                                            backgroundColor: `${charsheetDetailsColor}33`,
                                            borderColor: charsheetDetailsColor,
                                            borderWidth: 2,
                                            pointBackgroundColor: charsheetDetailsColor,
                                            pointBorderColor: charsheetDetailsColor,
                                            pointHoverBackgroundColor: charsheetDetailsColor,
                                            pointHoverBorderColor: charsheetDetailsColor
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        r: {
                                            suggestedMin: -5,
                                            suggestedMax: 25,
                                            angleLines: {
                                                color: theme.palette.divider
                                            },
                                            pointLabels: {
                                                color: theme.palette.text.primary,
                                                font: {
                                                    size: matches ? 10 : 12,
                                                    weight: 'bold'
                                                }
                                            },
                                            grid: {
                                                color: theme.palette.divider
                                            },
                                            ticks: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Pontos de Status */}
                        <Box
                            sx={{
                                p: matches ? 1 : 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                width: '100%'
                            }}
                        >
                            <Box display='flex' flexDirection='column' gap={1.5}>
                                {/* LP */}
                                <Controller
                                    name='stats.lp'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='LP'
                                                minvalue={field.value}
                                                maxvalue={getValues('stats.maxLp')}
                                                color='error'
                                            />
                                            {errors.stats?.lp && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.stats.lp.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {/* MP */}
                                <Controller
                                    name='stats.mp'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='MP'
                                                minvalue={field.value}
                                                maxvalue={getValues('stats.maxMp')}
                                                color='info'
                                            />
                                            {errors.stats?.mp && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.stats.mp.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {/* AP */}
                                <Controller
                                    name='stats.ap'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='AP'
                                                minvalue={field.value}
                                                maxvalue={getValues('stats.maxAp')}
                                                color='warning'
                                            />
                                            {errors.stats?.ap && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.stats.ap.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {limitedStats.length > 0 && (
                                    <Typography variant='caption' color='warning.light' role='status' display='block'>
                                        O cálculo inicial de {limitedStats.join(', ')} ficou negativo com a raça, a classe e os atributos
                                        escolhidos e foi limitado a 0.
                                    </Typography>
                                )}

                                {/* Estatísticas gerais */}
                                <Box sx={{ mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.paper' }}>
                                    {/* Limite de MP por turno */}
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Tooltip title="Máximo de MP que pode ser gasto em magias em cada rodada de combate (zera quando a rodada vira)">
                                            <LocalFireDepartment color="primary" fontSize="small" sx={{ mr: 1 }} />
                                        </Tooltip>
                                        <Box flexGrow={1}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                                                Limite de MP por Turno
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {getMpLimit({
                                                        level: getValues('level'),
                                                        ORMLevel: getValues('ORMLevel'),
                                                        attributes: { foc },
                                                        mpLimit: getValues('mpLimit')
                                                    })}
                                                </Typography>
                                                <Tooltip title="⌈(Nível + Foco) ÷ 2⌉ + Nível de ORM (+ bônus de perks)">
                                                    <InfoOutlined fontSize="inherit" sx={{ ml: 0.5, opacity: 0.6, fontSize: '0.875rem' }} />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Overall (Total de atributos) */}
                                    <Box display="flex" alignItems="center">
                                        <Tooltip title="Soma total de todos os atributos">
                                            <Assessment color="warning" fontSize="small" sx={{ mr: 1 }} />
                                        </Tooltip>
                                        <Box flexGrow={1}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                                                Overall (Total)
                                            </Typography>
                                            
                                            {/* Valor com indicador visual */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {(() => {
                                                    // Define cores com base no valor
                                                    let color = 'text.primary';
                                                    if (overallValue >= 40) color = 'warning.main';
                                                    if (overallValue >= 80) color = 'success.main';
                                                    if (overallValue >= 120) color = 'primary.main';
                                                    if (overallValue >= 180) color = 'error.main';

                                                    return (
                                                        <Typography 
                                                            variant="body1" 
                                                            fontWeight="medium"
                                                            sx={{ 
                                                                color,
                                                                ...(overallValue >= 150 && {
                                                                    fontWeight: 'bold'
                                                                })
                                                            }}
                                                        >
                                                            {overallValue}
                                                        </Typography>
                                                    );
                                                })()} 
                                                
                                                <Tooltip title="Vigor + Foco + Destreza + Lógica + Sabedoria + Carisma + Bônus de Perícias + Nível">
                                                    <InfoOutlined fontSize="inherit" sx={{ ml: 0.5, opacity: 0.6, fontSize: '0.875rem' }} />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Seção dos Atributos Principais */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0, // Importante para evitar overflow
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    {/* Pontos de Atributo */}
                    <Box
                        sx={{
                            p: matches ? 1 : 2,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2} flexWrap='wrap' gap={1}>
                            <Typography variant={matches ? 'subtitle1' : 'h6'} component='h3' fontWeight="bold" color="primary">
                                Atributos Principais
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Box display="flex" alignItems="center" gap={1}>                
                                    <Typography variant="subtitle2" fontWeight="medium" component='span' id='attributes-multiplier-label'>Multiplicador:</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        inputProps={{ 
                                            min: 1, 
                                            max: 10, 
                                            'aria-labelledby': 'attributes-multiplier-label',
                                            style: { padding: '4px 8px', width: '40px' } 
                                        }}
                                        value={multiplier}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v === '' || /^\d{0,2}$/.test(v)) {
                                                setMultiplier(v);
                                            }
                                        }}
                                        onBlur={() => {
                                            // Normaliza para um valor válido entre 1 e 10
                                            setMultiplier(String(multiplierValue));
                                        }}
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                </Box>
                                <Controller
                                    name='points.attributes'
                                    control={control}
                                    render={({ field }) => (
                                        <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                                            <Typography variant="body2" color="text.secondary">
                                                Pontos:
                                            </Typography>
                                            <Chip
                                                label={field.value}
                                                color={field.value > 0 ? 'warning' : 'success'}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>

                            {/* Grid dos Atributos */}
                            <Box display='flex' flexDirection='column' width='100%' gap={1}>
                                {[ 'vig', 'foc', 'des', 'log', 'sab', 'car' ].map((attr) => {
                                    const attributeName = attr as 'vig' | 'foc' | 'des' | 'log' | 'sab' | 'car'
                                    const { onIncrement, onDecrement, attributeFloor } = attributePoints(attributeName)

                                    return (
                                        <Controller
                                            key={attributeName}
                                            name={`attributes.${attributeName}`}
                                            control={control}
                                            render={({ field }) => (
                                                <Box
                                                    sx={{
                                                        p: matches ? 1 : 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: 'background.paper',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            bgcolor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <Attribute
                                                        onIncrement={onIncrement}
                                                        onDecrement={onDecrement}
                                                        minValue={attributeFloor}
                                                        attributeName={attributeName}
                                                        attributeValue={field.value}
                                                        error={errors.attributes?.[attributeName]?.message}
                                                    />
                                                </Box>
                                            )}
                                        />
                                    )
                                })}
                            </Box>

                            {/* Mensagem de erro dos pontos de atributo */}
                            <Controller
                                name='points.attributes'
                                control={control}
                                render={() => (
                                    errors.points?.attributes ? (
                                        <Typography color='error' variant='caption' display='block' mt={1}>
                                            {errors.points.attributes.message}
                                        </Typography>
                                    ) : <></>
                                )}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Seção de nível e informações */}
                <LevelAndInfo />
            </Box>
        </Box>
    )
}

export default memo(Attributes)