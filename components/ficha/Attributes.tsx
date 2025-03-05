/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import { RadarChart } from '@components/misc'
import { classesModel } from '@constants/classes'
import { CustomIconButton, LinearProgressWithLabel } from '@layout'
import { FormControl, TextField } from '@mui/material'
import { Box } from '@mui/material'
import { green } from '@mui/material/colors'
import { useFormikContext } from 'formik'
import { type ReactElement, useState, useRef, useEffect, useMemo, useCallback } from 'react'
import type { Attributes as AttributesType, Classes, Ficha, FinancialCondition, Expertises, Race } from '@types'
import { positiveTraits } from '@constants/traits'
import DiceRollModal from '@components/misc/DiceRollModal'

import { 
    type SelectChangeEvent,
    Button,
    Chip,
    InputLabel,
    ListSubheader,
    MenuItem,
    OutlinedInput,
    Select,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme 
} from '@mui/material'

import { useAudio } from '@hooks'
import { selectEffect } from '@public/sounds'
import { races } from '@constants/races'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { Check, Edit } from '@mui/icons-material'
import Attribute from './Attribute'
import LevelProgress from './LevelProgress'
import { enqueueSnackbar } from '@node_modules/notistack'
import { toastDefault } from '@constants'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

export default function Attributes({ disabled }: { disabled?: boolean }): ReactElement {
    const f = useFormikContext<Ficha>()

    const traitRef = useRef<string | null>(null)
    const raceRef = useRef<Race['name'] | null>(null)

    const theme = useTheme()

    const [ modalOpen, setModalOpen ] = useState(false)
    const [ money, setMoney ] = useState<number>(f.values.inventory.money)
    const [ editMoney, setEditMoney ] = useState<boolean>(false)
    const [ canChangeTrait, setCanChangeTrait ] = useState<boolean>(true)

    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const audio = useAudio(selectEffect)
    const numberWithSpaces = useNumbersWithSpaces()

    const setDiligencePoints = (point: 'lp' | 'mp' | 'ap', action: 'add' | 'sub', value: number): void => {
        const classe = classesModel[f.values.class as Classes] || null
        
        if (action === 'add') {
            if (f.values.points.diligence > 0) {
                f.setFieldValue('points.diligence', f.values.points.diligence - 1)
                f.setFieldValue(`attributes.${point}`, f.values.attributes[point] + value)
                if (disabled) {
                    f.initialValues.attributes[point] += value
                }
            }
        } else {
            if (
                classe ? (f.values.attributes[point] - value >= classe.attributes[point]) :
                    (f.values.attributes[point] - value >= 0)
            ) {
                f.setFieldValue('points.diligence', f.values.points.diligence + 1)
                f.setFieldValue(`attributes.${point}`, f.values.attributes[point] - value)
                if (disabled) {
                    f.initialValues.attributes[point] -= value
                }
            }
        }
    }

    const setTraits = useCallback((e: SelectChangeEvent): void => {
        // TODO: Corrigir bug de traços
        let trait
        let prevTrait
        setCanChangeTrait(true)

        for (const item of positiveTraits) {
            if (item.name === e.target.value) {
                trait = item
            }

            if (item.name === traitRef.current) {
                prevTrait = item
            }
        }

        if (canChangeTrait) {
            if (traitRef.current) {
                if (prevTrait?.target.kind === 'attribute') {
                    f.setFieldValue(
                        `attributes.${prevTrait?.target.name.toLowerCase()}`, 
                        f.values.attributes[prevTrait?.target.name.toLowerCase() as AttributesType] - prevTrait.value
                    )
                } else {
                    f.values.expertises = { 
                        ...f.values.expertises,
                        [(prevTrait?.target.name ?? '') as keyof Expertises]: {
                            ...f.values.expertises[(prevTrait?.target.name ?? '') as keyof Expertises],
                            value: f.values.expertises[(prevTrait?.target.name ?? '') as keyof Expertises].value - (prevTrait?.value ?? 0)
                        }
                    }
                }
            }
        }

        if (trait?.target.kind === 'attribute') {
            if (!disabled && f.values.attributes[trait.target.name.toLowerCase() as AttributesType] !== 3) {
                f.setFieldValue(
                    `attributes.${trait?.target.name.toLowerCase()}`, 
                    f.values.attributes[trait?.target.name.toLowerCase() as AttributesType] + trait?.value
                )
            } else {
                setCanChangeTrait(false)
                enqueueSnackbar('Você não pode adicionar este traço pois ele excede o limite máximo do atributo determinado!', toastDefault('cannotAddTrait', 'warning'))
                return;
            }
        } else {
            f.setFieldValue('expertises', {
                ...f.values.expertises,
                [(trait?.target.name ?? '') as keyof Expertises]: {
                    ...f.values.expertises[(trait?.target.name ?? '') as keyof Expertises],
                    value: f.values.expertises[(trait?.target.name ?? '') as keyof Expertises].value + (trait?.value ?? 0)
                }
            })
        }

        if (canChangeTrait) {
            audio.play()
    
            f.setFieldValue('traits', [ e.target.value ])
            traitRef.current = e.target.value
        }
    }, [ f.values.traits, f.values.attributes ])

    const traitsArr = useMemo(() => {
        return positiveTraits.map((trait) => (
            <MenuItem
                key={trait.name}
                value={trait.name}
            >
                <Box>
                    <Typography>
                        {trait.name}
                    </Typography>
                    <Typography color={green[500]} variant='caption'>
                        +{trait.value} {trait.target.name}
                    </Typography>
                </Box>
            </MenuItem>
        ))
    }, [])

    const attributePoints = (
        attribute: 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car',
        otherAttrs?: { attr: 'pd' | 'pt', value: number }
    ): ReactElement => {
        const onClick = (action: 'add' | 'sub'): void => {
            const point = otherAttrs?.attr === 'pd' ? 'diligence' : 'expertises'

            if (action === 'add') {
                if ((f.values.points.attributes > 0 && f.values.attributes[attribute] < 3) || (disabled && f.values.points.attributes > 0)) {
                    if (f.values.attributes[attribute] < 5) {
                        f.setFieldValue('points.attributes', f.values.points.attributes - 1)
                        f.setFieldValue(`attributes.${attribute}`, f.values.attributes[attribute] + 1)
    
                        if (otherAttrs && otherAttrs.attr !== 'pd' && otherAttrs.attr !== 'pt')
                            f.setFieldValue(`attributes.${otherAttrs?.attr}`, f.values.attributes[otherAttrs.attr] + otherAttrs.value)
                        else
                            f.setFieldValue(`points.${point}`, f.values.points[point] + (otherAttrs?.value ?? 0))
                    }
                }
            } else {
                if (f.values.attributes[attribute] !== -1) {
                    f.setFieldValue('points.attributes', f.values.points.attributes + 1)
                    f.setFieldValue(`attributes.${attribute}`, f.values.attributes[attribute] - 1)

                    if (otherAttrs && otherAttrs.attr !== 'pd' && otherAttrs.attr !== 'pt')
                        f.setFieldValue(`attributes.${otherAttrs.attr}`, f.values.attributes[otherAttrs.attr] - otherAttrs.value)
                    else
                        f.setFieldValue(`points.${point}`, f.values.points[point] - (otherAttrs?.value ?? 0))
                }
            }
        }

        return (
            <>
                <Button onClick={() => { onClick('add') }} variant='outlined'>+1</Button>
                <Button onClick={() => { onClick('sub') }} variant='outlined'>-1</Button>
            </>
        )
    }

    const baseAttrs = useMemo(() => {
        const baseLP = 
            (classesModel[f.values.class as Classes]?.attributes.lp ?? 0) +
            f.values.attributes.vig * 3 +
            (races[f.values.race as Race['name']]?.attributes.lp ?? 0)

        const baseMP = 
            (classesModel[f.values.class as Classes]?.attributes.mp ?? 0) +
            f.values.attributes.foc * 2 +
            (races[f.values.race as Race['name']]?.attributes.mp ?? 0)

        const baseAP = 5 +
            (classesModel[f.values.class as Classes]?.attributes.ap ?? 0) +
            Math.floor(f.values.attributes.des * 1) +
            (races[f.values.race as Race['name']]?.attributes.ap ?? 0)

        return {
            lp: baseLP,
            mp: baseMP,
            ap: baseAP,
            maxLp: baseLP,
            maxMp: baseMP,
            maxAp: baseAP
        }
    }, [
        f.values.class,
        f.values.race,
        f.values.attributes.vig,
        f.values.attributes.des,
        f.values.attributes.foc
    ])

    const humanFn = useCallback(() => {
        if (!disabled) {
            if (raceRef.current === 'Humano') f.setFieldValue('points.attributes', f.values.points.attributes - 1)
            if (f.values.race === 'Humano') f.setFieldValue('points.attributes', f.values.points.attributes + 1)
            
            raceRef.current = f.values.race as Race['name']
        }
    }, [ f.values.race ])

    useEffect(() => {
        const { ap, mp, lp } = baseAttrs

        f.setFieldValue('attributes', {
            ...f.values.attributes,
            lp,
            mp,
            ap,
            maxLp: lp,
            maxMp: mp,
            maxAp: ap
        })
    }, [ baseAttrs ])

    useEffect(humanFn, [ humanFn ])

    return (
        <Box display='flex' flexDirection={matches ? 'column' : 'row'} width='100%' gap={matches ? 6 : 3}>
            <Box
                width={matches ? '100%' : '50%'}
                display='flex' 
                flexDirection='column'
                justifyContent='space-between'
                gap={4} 
            >
                <RadarChart
                    data={{
                        labels: [ 'VIG', 'DES', 'FOC', 'LOG', 'SAB', 'CAR' ],
                        datasets: [
                            {
                                label: 'Atributos',
                                data: [ 
                                    f.values.attributes.vig, 
                                    f.values.attributes.des,
                                    f.values.attributes.foc,
                                    f.values.attributes.log,
                                    f.values.attributes.sab,
                                    f.values.attributes.car
                                ],
                                backgroundColor: `${theme.palette.primary.main}99`,
                                borderColor: `${theme.palette.primary.main}`,
                                borderWidth: 2
                            }
                        ]
                    }}
                    options={{
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            r: {
                                suggestedMin: -1,
                                suggestedMax: 5,
                                angleLines: {
                                    color: '#f4f4f4'
                                },
                                pointLabels: {
                                    color: '#f4f4f4'
                                },
                                grid: {
                                    color: '#f4f4f4'
                                },
                                ticks: {
                                    display: false
                                }
                            }
                        }
                    }}
                />
                <Box
                    display='flex'
                    flexDirection='column'
                    justifyContent='space-between'
                    height='100%'
                    gap={1}
                >
                    <Box alignItems='center' display='flex' gap={1}>
                        <Typography display='flex' gap={1} >Pontos de diligência: 
                            <Tooltip title='LOG'>
                                <b style={{ color: theme.palette.primary.main }}>{f.values.points.diligence}</b>
                            </Tooltip>
                        </Typography>
                    </Box>
                    <LinearProgressWithLabel
                        label='LP'
                        minvalue={!disabled ? f.values.attributes.lp : f.initialValues.attributes.lp}
                        maxvalue={!disabled ? f.values.attributes.lp : f.initialValues.maxLp}
                        color='error'
                        morecomponents={
                            <Box ml={1} sx={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'end',
                                gap: 1,
                                height: '30px'
                            }}>
                                <Button
                                    onClick={() => { setDiligencePoints('lp', 'add', 2) }}  
                                    variant='outlined'
                                >+1</Button>
                                <Button
                                    onClick={() => { setDiligencePoints('lp', 'sub', 2) }} 
                                    variant='outlined'
                                >-1</Button>
                            </Box>
                        }
                    />
                    <LinearProgressWithLabel
                        label='MP'
                        minvalue={!disabled ? f.values.attributes.mp : f.initialValues.attributes.mp}
                        maxvalue={!disabled ? f.values.attributes.mp : f.initialValues.maxMp}
                        color='info'
                        morecomponents={
                            <Box ml={1} sx={{
                                display: 'flex',
                                gap: 1,
                                width: '100%',
                                justifyContent: 'end',
                                height: '30px'
                            }}>
                                <Button 
                                    onClick={() => { setDiligencePoints('mp', 'add', 1) }}  
                                    variant='outlined'
                                >+1</Button>
                                <Button
                                    onClick={() => { setDiligencePoints('mp', 'sub', 1) }} 
                                    variant='outlined'
                                >-1</Button>
                            </Box>
                        }
                    />
                    <LinearProgressWithLabel
                        label='AP'
                        minvalue={Math.floor(!disabled ? f.values.attributes.ap : f.initialValues.attributes.ap)}
                        maxvalue={Math.floor(!disabled ? f.values.attributes.ap : f.initialValues.maxAp)}
                        color='warning'
                    />
                </Box>
            </Box>
            <Box 
                display='flex'
                gap={3}
                flexDirection='column'
                width={matches ? '100%' : '50%'}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    gap={3}
                >
                    <Typography>Pontos de atributo: <b style={{ color: theme.palette.primary.main }}>{f.values.points.attributes}</b></Typography>
                    <Box display='flex' flexDirection='column' gap={1}>
                        <Attribute 
                            setAtrribute={attributePoints('vig')} 
                            attributeName='vig' 
                            attributeValue={f.values.attributes.vig} 
                        />
                        <Attribute 
                            setAtrribute={attributePoints('foc')} 
                            attributeName='foc' 
                            attributeValue={f.values.attributes.foc} 
                        />
                        <Attribute 
                            setAtrribute={attributePoints('des')} 
                            attributeName='des'
                            attributeValue={f.values.attributes.des} 
                        />
                        <Attribute 
                            setAtrribute={attributePoints('log', { attr: 'pd', value: 1 })} 
                            attributeName='log' 
                            attributeValue={f.values.attributes.log} 
                        />
                        <Attribute 
                            setAtrribute={attributePoints('sab', { attr: 'pt', value: 1 })} 
                            attributeName='sab' 
                            attributeValue={f.values.attributes.sab} 
                        />
                        <Attribute 
                            setAtrribute={attributePoints('car')} 
                            attributeName='car' 
                            attributeValue={f.values.attributes.car} 
                        />
                    </Box>
                </Box>
                <Box 
                    display='flex'
                    flexDirection='column'
                    gap={3}
                >
                    <Box display='flex' flexDirection='column' justifyContent='space-between' height='100%' gap={4}>
                        <Box display='flex' flexDirection='column' gap={4}>
                            <LevelProgress amount={10} title='Nível' level={f.values.level} />
                            <LevelProgress barWidth='6.65rem' amount={4} title='Nível do ORM' level={f.values.ORMLevel} />
                        </Box>
                        <Box display='flex' flexDirection='column' gap={1}>
                            <Box display='flex' alignItems='center' gap={1}>
                                <Typography>Deslocamento:</Typography>
                                <Chip
                                    color='primary' 
                                    label={f.values.displacement + 'm'}
                                />
                            </Box>
                            <Box display='flex' alignItems='center' gap={1}>
                                <Typography>Dinheiro:</Typography>
                                <Chip
                                    color='primary' 
                                    label={
                                        <Box display='flex'>
                                            <p>{f.values.mode === 'Classic' ? '¥' : '¢'}</p>
                                            <p id='money'>
                                                {numberWithSpaces(f.values.inventory.money)}
                                            </p>
                                        </Box>
                                    }
                                />
                                {disabled && (
                                    <Box display='flex' gap={3} alignItems='center'>
                                        <CustomIconButton onClick={() => { setEditMoney(prevState => !prevState) }} sx={{ height: 35, width: 35 }}>
                                            <Edit sx={{ height: 20, width: 20 }} />
                                        </CustomIconButton>
                                        {editMoney && (
                                            <Box action='#' component='form' display='flex' alignItems='center' gap={1}>
                                                <TextField 
                                                    defaultValue={f.values.inventory.money}
                                                    onChange={e => { setMoney(Number(e.target.value)) }}
                                                    type='number'
                                                />
                                                <CustomIconButton type='submit' onClick={() => {
                                                    setEditMoney(false)
                                                    f.values.inventory.money = money
                                                }} sx={{ height: 35, width: 35 }}>
                                                    <Check sx={{ height: 20, width: 20 }} />
                                                </CustomIconButton>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={1}>
                        <Box display='flex' flexDirection='column' gap={2.5}>
                            <FormControl fullWidth>
                                <InputLabel>Traços *</InputLabel>
                                <Select
                                    name='traits'
                                    value={String(f.values.traits)}
                                    onChange={setTraits}
                                    input={<OutlinedInput label="Chip" />}
                                    MenuProps={MenuProps}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Chip key={String(selected)} label={String(selected)} />
                                        </Box>
                                    )}
                                >
                                    {traitsArr}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Condição financeira *</InputLabel>
                                <Select 
                                    name='financialCondition'
                                    label='Condição financeira'
                                    value={f.values.financialCondition}
                                    required
                                    disabled={disabled}
                                    fullWidth
                                    onChange={e => {
                                        const financialCondition = {
                                            'Miserável': 10_000,
                                            'Pobre': 50_000,
                                            'Estável': 100_000,
                                            'Rico': 300_000
                                        }

                                        const value = e.target.value as FinancialCondition

                                        f.handleChange(e)
                                        f.setFieldValue('inventory.money', f.values.mode === 'Classic' ? financialCondition[value] : financialCondition[value] / 1000)

                                        audio.play()
                                    }}
                                >
                                    <ListSubheader>{'< 6'}</ListSubheader>
                                    <MenuItem value='Miserável'>Miserável</MenuItem>
                                    <ListSubheader>6 - 12</ListSubheader>
                                    <MenuItem value='Pobre'>Pobre</MenuItem>
                                    <ListSubheader>12 - 17</ListSubheader>
                                    <MenuItem value='Estável'>Estável</MenuItem>
                                    <ListSubheader>{'> 17'}</ListSubheader>
                                    <MenuItem value='Rico'>Rico</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        {!disabled && (
                            <Button onClick={() => { setModalOpen(true) }} variant='outlined' >Rolar dados</Button>
                        )}
                    </Box>
                </Box>
            </Box>
            {modalOpen && (
                <DiceRollModal
                    open={modalOpen}
                    onClose={() => { setModalOpen(false) }}
                    bonus={[ f.values.attributes.car ]}
                    isDisadvantage={f.values.attributes.car === 0}
                    visibleDices
                    visibleBaseAttribute
                    roll={{
                        dice: 20,
                        quantity: f.values.attributes.car || 1,
                        name: 'Condição Financeira',
                        attribute: 'car'
                    }}
                />
            )}
        </Box>      
    )
}