import { RadarChart } from '@components/misc'
import { classesModel } from '@constants/classes'
import { numberWithSpaces } from '@functions'
import { LinearProgressWithLabel } from '@layout'
import { Button, Chip, InputLabel, ListSubheader, MenuItem, Select, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import { FormControl } from '@mui/material'
import { Box } from '@mui/material'
import { useFormikContext } from 'formik'
import { type ReactElement, useState } from 'react'
import type { Classes, Ficha, FinancialCondition } from '@types'
import DiceRollModal from '@components/misc/DiceRollModal'

export default function Attributes({ formik }: { formik: any }): ReactElement {
    const FormikType = useFormikContext<Ficha>()
    const f: typeof FormikType  = formik

    const theme = useTheme()
    const [ modalOpen, setModalOpen ] = useState(false)

    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const setDiligencePoints = (point: 'lp' | 'mp' | 'ap', action: 'add' | 'sub', value: number): void => {
        const classe = classesModel[f.values.class as Classes] || null

        if (action === 'add') {
            if (f.values.points.diligence > 0) {
                f.setFieldValue('points.diligence', f.values.points.diligence - 1)
                f.setFieldValue(`attributes.${point}`, f.values.attributes[point] + value)
            }
        } else {
            if (
                classe ? (f.values.attributes[point] - value >= classe.attributes[point]) :
                    (f.values.attributes[point] - value >= 0)
            ) {
                f.setFieldValue('points.diligence', f.values.points.diligence + 1)
                f.setFieldValue(`attributes.${point}`, f.values.attributes[point] - value)
            }
        }
    }

    const attributePoints = (
        attribute: 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car',
        otherAttrs?: { attr: 'lp' | 'mp' | 'pd' | 'pt' | 'pp', value: number }
    ): ReactElement => {
        const onClick = (action: 'add' | 'sub'): void => {
            const point = 
                otherAttrs?.attr === 'pd' ? 'diligence' :
                    otherAttrs?.attr === 'pt' ? 'expertises' : 'perks'

            if (action === 'add') {
                if (f.values.points.attributes !== 0 && f.values.attributes[attribute] !== 3) {
                    f.setFieldValue('points.attributes', f.values.points.attributes - 1)
                    f.setFieldValue(`attributes.${attribute}`, f.values.attributes[attribute] + 1)

                    if (
                        otherAttrs && otherAttrs.attr !== 'pd' &&
                        otherAttrs.attr !== 'pt' &&
                        otherAttrs.attr !== 'pp'
                    ) {
                        f.setFieldValue(`attributes.${otherAttrs.attr}`, f.values.attributes[otherAttrs.attr] + otherAttrs.value)
                    } else {
                        f.setFieldValue(`points.${point}`, f.values.points[point] + (otherAttrs?.value ?? 0))
                    }   
                }
            } else {
                if (f.values.attributes[attribute] !== -1) {
                    f.setFieldValue('points.attributes', f.values.points.attributes + 1)
                    f.setFieldValue(`attributes.${attribute}`, f.values.attributes[attribute] - 1)

                    if (
                        otherAttrs && otherAttrs.attr !== 'pd' &&
                        otherAttrs.attr !== 'pt' &&
                        otherAttrs.attr !== 'pp'
                    ) {
                        f.setFieldValue(`attributes.${otherAttrs.attr}`, f.values.attributes[otherAttrs.attr] - otherAttrs.value)
                    } else {
                        f.setFieldValue(`points.${point}`, f.values.points[point] - (otherAttrs?.value ?? 0))
                    }
                }
            }
        }

        return (
            <Box display='flex' gap={1}>
                <Button onClick={() => { onClick('add') }} variant='outlined'>+1</Button>
                <Button onClick={() => { onClick('sub') }} variant='outlined'>-1</Button>
            </Box>
        )
    }

    return (
        <Box display='flex' flexDirection={matches ? 'column' : 'row'} width='100%' gap={matches ? 6 : 3}>
            <Box
                height='100%'
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
                                suggestedMax: 10,
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
                    height='100%'
                    display='flex'
                    flexDirection='column'
                    justifyContent='space-between'
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
                        minValue={f.values.attributes.lp}
                        maxValue={f.values.attributes.lp}
                        color='error'
                        MoreComponents={
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
                        minValue={f.values.attributes.mp}
                        maxValue={f.values.attributes.mp}
                        color='info'
                        MoreComponents={
                            <Box ml={1} sx={{
                                display: 'flex',
                                gap: 1,
                                width: '100%',
                                justifyContent: 'end',
                                height: '30px'
                            }}>
                                <Button 
                                    onClick={() => { setDiligencePoints('mp', 'add', 3) }}  
                                    variant='outlined'
                                >+1</Button>
                                <Button
                                    onClick={() => { setDiligencePoints('mp', 'sub', 3) }} 
                                    variant='outlined'
                                >-1</Button>
                            </Box>
                        }
                    />
                    <LinearProgressWithLabel
                        label='AP'
                        minValue={f.values.attributes.ap}
                        maxValue={f.values.attributes.ap}
                        color='warning'
                    />
                </Box>
            </Box>
            <Box 
                display='flex'
                gap={10}
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
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Vigor:</Typography>
                                <Chip
                                    label={f.values.attributes.vig}
                                /> 
                            </Box>
                            {attributePoints('vig', { attr: 'lp', value: 3 })}
                        </Box>
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Destreza:</Typography>
                                <Chip 
                                    label={f.values.attributes.des}
                                /> 
                            </Box>
                            {attributePoints('des')}
                        </Box>
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Foco:</Typography>
                                <Chip 
                                    label={f.values.attributes.foc}
                                /> 
                            </Box>
                            {attributePoints('foc', { attr: 'mp', value: 5 })}
                        </Box>
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Lógica:</Typography>
                                <Chip 
                                    label={f.values.attributes.log}
                                /> 
                            </Box>
                            {attributePoints('log', { attr: 'pd', value: 1 })}
                        </Box>
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Sabedoria:</Typography>
                                <Chip 
                                    label={f.values.attributes.sab}
                                /> 
                            </Box>
                            {attributePoints('sab', { attr: 'pt', value: 1 })}
                        </Box>
                        <Box 
                            display='flex'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Box 
                                display='flex'
                                alignItems='center' 
                                gap={1}
                            >
                                <Typography>Carisma:</Typography>
                                <Chip 
                                    label={f.values.attributes.car}
                                /> 
                            </Box>
                            {attributePoints('car')}
                        </Box>
                    </Box>
                </Box>
                <Box 
                    display='flex'
                    flexDirection='column'
                    gap={5}
                >
                    <Box display='flex' flexDirection='column' gap={1}>
                        <FormControl fullWidth>
                            <InputLabel>Condição financeira *</InputLabel>
                            <Select 
                                name='financialCondition'
                                label='Condição financeira'
                                value={f.values.financialCondition}
                                required
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
                                    f.setFieldValue('inventory.money', financialCondition[value])
                                }}
                            >
                                <ListSubheader>{'< 8'}</ListSubheader>
                                <MenuItem value='Miserável'>Miserável</MenuItem>
                                <ListSubheader>8 - 14</ListSubheader>
                                <MenuItem value='Pobre'>Pobre</MenuItem>
                                <ListSubheader>15 - 20</ListSubheader>
                                <MenuItem value='Estável'>Estável</MenuItem>
                                <ListSubheader>20+</ListSubheader>
                                <MenuItem value='Rico'>Rico</MenuItem>
                            </Select>
                        </FormControl>
                        <Button onClick={() => { setModalOpen(true) }} variant='outlined' >Rolar dados</Button>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={1}>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Typography>Nível:</Typography>
                            <Chip
                                color='primary' 
                                label={f.values.level}
                            />
                        </Box>
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
                                label={'¥' + numberWithSpaces(f.values.inventory.money)}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
            <DiceRollModal
                open={modalOpen}
                onClose={() => { setModalOpen(false) }}
                bonus={[ f.values.attributes.car * 2 ]}
                isDisadvantage={f.values.attributes.car < 0}
                visibleDices
                visibleBaseAttribute
                roll={{
                    dice: 20,
                    quantity: Math.floor((f.values.attributes.car < 0 ? 2 : f.values.attributes.car) / 2) + 1,
                    name: 'Condição Financeira',
                    attribute: 'car'
                }}
            />
        </Box>      
    )
}