/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/rules-of-hooks */
import { RadarChart } from '@components/misc'
import { LinearProgressWithLabel } from '@layout'
import { Box, TextField, Tooltip } from '@mui/material'
import type { Ficha } from '@types'
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
import { Attribute, LevelAndInfo } from '.'

function Attributes(): ReactElement {
    const { control, setValue, getValues, formState: { errors }, reset } = useFormContext<Ficha>()
    const [ multiplier, setMultiplier ] = useState<number>(1)
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const ficha = getValues()
    const disabled = !!ficha._id

    // Watch para todos os atributos, perícias e nível para atualizar o overall
    const attributes = useWatch({ control, name: 'attributes' })
    const expertises = useWatch({ control, name: 'expertises' })
    const level = useWatch({ control, name: 'level' })
    
    // Efeito para atualizar o overall sempre que qualquer dependência mudar
    useEffect(() => {
        const attributesSum = (
            (attributes?.vig || 0) +
            (attributes?.foc || 0) +
            (attributes?.des || 0) +
            (attributes?.log || 0) +
            (attributes?.sab || 0) +
            (attributes?.car || 0)
        );

        const expertisesSum = Object.values(expertises || {}).reduce(
            (sum, expertise) => sum + (expertise && typeof expertise === 'object' && 'value' in expertise ? (expertise.value || 0) : 0),
            0
        );
        
        const overallValue = attributesSum + expertisesSum + (level || 0);
        setValue('overall', overallValue);
    }, [ attributes, expertises, level, setValue ]);

    const fichaDetailsColor = useMemo(() => {
        const classe = ficha.class
        return classColor?.[classe as keyof typeof classColor] ?? theme.palette.primary.main
    }, [ ficha.class ])

    const attributePoints = useCallback((attributeName: 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car') => {
        
        const modAttribute = (operation: 'increment' | 'decrement', changeAmount: number) => {
            const currentAttributeValue = getValues(`attributes.${attributeName}`);
            
            const newValue = operation === 'increment' ? currentAttributeValue : currentAttributeValue - changeAmount;
            const oldValue = operation === 'increment' ? newValue - changeAmount : newValue + changeAmount;
            
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
                    const currentMagicsSpace = getValues('magicsSpace');
                    const newMagicsSpace = currentMagicsSpace + logBonusDiff;
                    setValue('magicsSpace', newMagicsSpace);
                    
                    // A cada 10 níveis adicionados, adicione +1 ponto em "points.skills"
                    const oldLogSkillBonus = Math.floor(oldValue / 10);
                    const newLogSkillBonus = Math.floor(newValue / 10);
                    const logSkillBonusDiff = newLogSkillBonus - oldLogSkillBonus;
                    
                    if (logSkillBonusDiff !== 0) {
                        const currentSkillPoints = getValues('points.skills');
                        const newSkillPoints = currentSkillPoints + logSkillBonusDiff;
                        setValue('points.skills', newSkillPoints);
                    }
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
                multiplier,
                updatedPoints,
                30 - updatedAttribute
            );

            if (possibleIncrements > 0 && (updatedAttribute < 10 || disabled)) {
                if (updatedAttribute < 30) {
                    const newAttributeValue = updatedAttribute + possibleIncrements;
                    const newPointsValue = updatedPoints - possibleIncrements;
                    
                    setValue(`attributes.${attributeName}`, newAttributeValue);
                    setValue('points.attributes', newPointsValue);
                    modAttribute('increment', possibleIncrements)
                }
            }
        }, [ attributeName, getValues, multiplier, setValue, disabled ])

        const onDecrement = useCallback(() => {
            const updatedAttribute = getValues(`attributes.${attributeName}`);
            const updatedPoints = getValues('points.attributes');
            
            const possibleDecrements = Math.min(
                multiplier,
                updatedAttribute
            );

            if (possibleDecrements > 0) {
                const newAttributeValue = updatedAttribute - possibleDecrements;
                const newPointsValue = updatedPoints + possibleDecrements;
                
                setValue(`attributes.${attributeName}`, newAttributeValue);
                setValue('points.attributes', newPointsValue);
                modAttribute('decrement', possibleDecrements)
            }
        }, [ attributeName, getValues, multiplier, setValue ])

        return { onIncrement, onDecrement }
    }, [ ficha, getValues, setValue, reset, disabled, multiplier ])

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
    const attributesRef = useRef({ vig, foc, des })

    // Status Attributes
    useEffect(() => {
        let baseLP = 0; let baseMaxLP = 0; let baseMP = 0; let baseMaxMP = 0; let baseAP = 0; let baseMaxAP = 0
        
        if (disabled) {
            baseLP = ficha.attributes.lp
            baseMaxLP = ficha.attributes.maxLp
            baseMP = ficha.attributes.mp
            baseMaxMP = ficha.attributes.maxMp
            baseAP = ficha.attributes.ap
            baseMaxAP = ficha.attributes.maxAp

            baseLP += vig - attributesRef.current.vig
            baseMaxLP += vig - attributesRef.current.vig
            baseMP += foc - attributesRef.current.foc
            baseMaxMP += foc - attributesRef.current.foc
            baseAP += Math.floor(des / 10) - Math.floor(attributesRef.current.des / 10)
            baseMaxAP += Math.floor(des / 10) - Math.floor(attributesRef.current.des / 10)
          
            attributesRef.current.vig = vig
            attributesRef.current.foc = foc
            attributesRef.current.des = des
        } else {
            baseLP = (races[race as keyof typeof races]?.attributes.lp || 0) +
                (classesModel[classe as keyof typeof classesModel]?.attributes.lp || 0) +
                (vig || 0)
            baseMaxLP = baseLP
    
            baseMP = (races[race as keyof typeof races]?.attributes.mp || 0) +
                (classesModel[classe as keyof typeof classesModel]?.attributes.mp || 0) +
                (foc || 0)
            baseMaxMP = baseMP
    
            baseAP = (races[race as keyof typeof races]?.attributes.ap || 0) +
                (classesModel[classe as keyof typeof classesModel]?.attributes.ap || 0) +
                (Math.floor(des / 10) || 0)
            baseMaxAP = baseAP
        }
        
        setValue('attributes.lp', baseLP)
        setValue('attributes.maxLp', baseMaxLP)
        setValue('attributes.mp', baseMP)
        setValue('attributes.maxMp', baseMaxMP)
        setValue('attributes.ap', baseAP)
        setValue('attributes.maxAp', baseMaxAP)
    }, [ vig, des, foc, race, classe ])

    // Case race 'Humano'
    useEffect(() => {
        if (ficha._id) return
        let pointsAttributes = ficha.points.attributes + (races[race as keyof typeof races]?.attributes.pda || 0)
       
        if (raceRef.current && raceRef.current === 'Humano') {
            pointsAttributes = ficha.points.attributes - 5
        }

        setValue('points.attributes', pointsAttributes)
        raceRef.current = race
    }, [ race ])
    
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
                        bgcolor: 'background.paper3',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant={matches ? 'subtitle1' : 'h6'} fontWeight="bold" color="primary">
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
                                            backgroundColor: `${fichaDetailsColor}33`,
                                            borderColor: fichaDetailsColor,
                                            borderWidth: 2,
                                            pointBackgroundColor: fichaDetailsColor,
                                            pointBorderColor: fichaDetailsColor,
                                            pointHoverBackgroundColor: fichaDetailsColor,
                                            pointHoverBorderColor: fichaDetailsColor
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
                                    name='attributes.lp'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='LP'
                                                minvalue={field.value}
                                                maxvalue={getValues('attributes.maxLp')}
                                                color='error'
                                            />
                                            {errors.attributes?.lp && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.attributes.lp.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {/* MP */}
                                <Controller
                                    name='attributes.mp'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='MP'
                                                minvalue={field.value}
                                                maxvalue={getValues('attributes.maxMp')}
                                                color='info'
                                            />
                                            {errors.attributes?.mp && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.attributes.mp.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {/* AP */}
                                <Controller
                                    name='attributes.ap'
                                    control={control}
                                    render={({ field }) => (
                                        <Box>
                                            <LinearProgressWithLabel
                                                label='AP'
                                                minvalue={field.value}
                                                maxvalue={getValues('attributes.maxAp')}
                                                color='warning'
                                            />
                                            {errors.attributes?.ap && (
                                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                                    {errors.attributes.ap.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />

                                {/* Estatísticas gerais */}
                                <Box sx={{ mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.paper' }}>
                                    {/* Limite de MP Diário */}
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Tooltip title="Máximo de pontos de magia que podem ser gastos diariamente">
                                            <LocalFireDepartment color="primary" fontSize="small" sx={{ mr: 1 }} />
                                        </Tooltip>
                                        <Box flexGrow={1}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                                                Limite de MP Diário
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {getValues('attributes.maxMp') + getValues('attributes.foc') + getValues('level')}
                                                </Typography>
                                                <Tooltip title="Base + Foco + Nível">
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
                                                    // Soma todos os atributos principais
                                                    const attributesSum = (
                                                        getValues('attributes.vig') +
                                                        getValues('attributes.foc') +
                                                        getValues('attributes.des') +
                                                        getValues('attributes.log') +
                                                        getValues('attributes.sab') +
                                                        getValues('attributes.car')
                                                    );

                                                    // Calcula a somatória dos bônus de perícias
                                                    const expertises = getValues('expertises') || {};
                                                    const expertisesSum = Object.values(expertises).reduce(
                                                        (sum, expertise) => sum + (expertise && typeof expertise === 'object' && 'value' in expertise ? (expertise.value || 0) : 0), 
                                                        0
                                                    );
                                                    
                                                    // Valor total do overall (atributos + perícias)
                                                    const overallValue = attributesSum + expertisesSum + ficha.level;
                                                    setValue('overall', overallValue)
                                                    
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
                                                                    textShadow: '0px 0px 3px rgba(25, 118, 210, 0.5)',
                                                                    fontWeight: 'bold'
                                                                }),
                                                                ...(overallValue >= 180 && {
                                                                    textShadow: '0px 0px 3px rgba(210, 25, 25, 0.5)',
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
                            bgcolor: 'background.paper3',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2} flexWrap='wrap' gap={1}>
                            <Typography variant={matches ? 'subtitle1' : 'h6'} fontWeight="bold" color="primary">
                                Atributos Principais
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Box display="flex" alignItems="center" gap={1}>                
                                    <Typography variant="subtitle2" fontWeight="medium">Multiplicador:</Typography>
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
                                    const { onIncrement, onDecrement } = attributePoints(attributeName)

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