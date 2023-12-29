'use client';

import { Box, Button, Chip, FormControl, IconButton, InputLabel, LinearProgress, MenuItem, Select, Slider, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import React, { useContext, type ReactElement, useState } from 'react'
import { useFormik } from 'formik'
import { User, type Ficha } from '@types';
import { fichaModel } from '@contexts/fichaContext';
import { useSession } from 'next-auth/react';
import { RadarChart } from '@components/misc';
import { LinearProgressWithLabel } from '@layout';
import FormHeader from './FormHeader';
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
    playerName: Yup.string().notRequired().default(''),
    name: Yup.string().notRequired(),
    age: Yup.number().notRequired(),
    gender: Yup.string().notRequired(),
    class: Yup.string().notRequired(),
    race: Yup.string().notRequired(),
    lineage: Yup.string().notRequired(),
    financialCondition: Yup.string().notRequired().default(''),
    capacity: Yup.number().notRequired().default(5),
    displacement: Yup.number().notRequired().default(9),
    skills: Yup.array().of(Yup.string()).notRequired().default([]),
    magics: Yup.array().of(Yup.string()).notRequired().default([]),
    expertises: Yup.array().of(Yup.string()).notRequired().default([]),
    perks: Yup.array().of(Yup.string()).notRequired().default([]),
    penalties: Yup.array().of(Yup.string()).notRequired().default([]),
    attributes: Yup.number().notRequired().default(9),
    subClass: Yup.string().notRequired().default(''),
    level: Yup.number().notRequired().default(0),
    elementMastery: Yup.string().notRequired().default(''),

    inventory: Yup.object().notRequired().default({
        items: [],
        weapons: [],
        armors: [],
        money: 0
    }),

    points: Yup.object().notRequired().default({
        attributes: 9,
        expertises: 0,
        skills: 0,
        magics: 0
    })
})
export default function CreateFichaModal({
    open,
    handleClose 
}: { 
    open: boolean,
    handleClose: () => void
}): ReactElement {
    const { data: session } = useSession()
    const theme = useTheme()

    const initialValues: Ficha = { 
        ...fichaModel as Ficha,
        playerName: session?.user?.name ?? ''
    }

    const formik = useFormik({
        initialValues,
        // validationSchema,
        onSubmit: (values) => {
            console.log(values)
        }
    })

    const setDiligencePoints = (point: 'lp' | 'mp' | 'ap', action: 'add' | 'sub', value: number): void => {
        if (action === 'add') {
            if (formik.values.points.diligence > 0) {
                formik.setFieldValue('points.diligence', formik.values.points.diligence - 1)
                formik.setFieldValue(`attributes.${point}`, formik.values.attributes[point] + value)
            }
        } else {
            if (formik.values.attributes[point] - value >= 0) {
                formik.setFieldValue('points.diligence', formik.values.points.diligence + 1)
                formik.setFieldValue(`attributes.${point}`, formik.values.attributes[point] - value)
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
                if (formik.values.points.attributes !== 0 && formik.values.attributes[attribute] !== 3) {
                    formik.setFieldValue('points.attributes', formik.values.points.attributes - 1)
                    formik.setFieldValue(`attributes.${attribute}`, formik.values.attributes[attribute] + 1)

                    if (
                        otherAttrs && otherAttrs.attr !== 'pd' &&
                        otherAttrs.attr !== 'pt' &&
                        otherAttrs.attr !== 'pp'
                    ) {
                        formik.setFieldValue(`attributes.${otherAttrs.attr}`, formik.values.attributes[otherAttrs.attr] + otherAttrs.value)
                    } else {
                        formik.setFieldValue(`points.${point}`, formik.values.points[point] + (otherAttrs?.value ?? 0))
                    }   
                }
            } else {
                if (formik.values.attributes[attribute] !== -1) {
                    formik.setFieldValue('points.attributes', formik.values.points.attributes + 1)
                    formik.setFieldValue(`attributes.${attribute}`, formik.values.attributes[attribute] - 1)

                    if (
                        otherAttrs && otherAttrs.attr !== 'pd' &&
                        otherAttrs.attr !== 'pt' &&
                        otherAttrs.attr !== 'pp'
                    ) {
                        formik.setFieldValue(`attributes.${otherAttrs.attr}`, formik.values.attributes[otherAttrs.attr] - otherAttrs.value)
                    } else {
                        formik.setFieldValue(`points.${point}`, formik.values.points[point] - (otherAttrs?.value ?? 0))
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
        <Box 
            display='flex' 
            height='100%' 
            width='100%'
            borderRadius='10px'
        >
            <Box 
                display='flex'
                width='100%'
                flexDirection='column'
                p={5} 
                gap={5}
            >
                <Box>
                    <Typography variant='h5'>Criar ficha</Typography>
                </Box>
                <Box width='100%'>
                    <Box
                        component='form'
                        onSubmit={formik.handleSubmit}
                        sx={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: 'column',
                            gap: 5
                        }} 
                    >
                        <FormHeader 
                            formik={formik}
                        />
                        <Box 
                            width='100%'
                            display='flex'
                            flexDirection='column'
                            gap={2.5}
                        >
                            <Box>
                                <Typography variant='h6'>Atributos</Typography>
                            </Box>
                            <Box display='flex' width='100%' gap={3}>
                                <Box 
                                    width='25%'
                                    display='flex' 
                                    flexDirection='column'
                                    gap={4} 
                                >
                                    <RadarChart
                                        data={{
                                            labels: [ 'VIG', 'DES', 'FOC', 'LOG', 'SAB', 'CAR' ],
                                            datasets: [
                                                {
                                                    label: 'Atributos',
                                                    data: [ 
                                                        formik.values.attributes.vig, 
                                                        formik.values.attributes.des,
                                                        formik.values.attributes.foc,
                                                        formik.values.attributes.log,
                                                        formik.values.attributes.sab,
                                                        formik.values.attributes.car
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
                                        display='flex'
                                        flexDirection='column'
                                        gap={1}
                                    >
                                        <Box alignItems='center' display='flex' gap={1}>
                                            <Typography display='flex' gap={1} >Pontos de diligência: 
                                                <Tooltip title='(FOC + LOG) + 1'>
                                                    <b style={{ color: theme.palette.primary.main }}>{formik.values.points.diligence}</b>
                                                </Tooltip>
                                            </Typography>
                                        </Box>
                                        <LinearProgressWithLabel
                                            label='LP'
                                            minValue={formik.values.attributes.lp}
                                            maxValue={formik.values.attributes.lp}
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
                                            minValue={formik.values.attributes.mp}
                                            maxValue={formik.values.attributes.mp}
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
                                            minValue={formik.values.attributes.ap}
                                            maxValue={formik.values.attributes.ap}
                                            color='warning'
                                        />
                                    </Box>
                                </Box>
                                <Box 
                                    display='flex'
                                    gap={3}
                                    flexDirection='column'
                                    width='20%'
                                >
                                    <Box>
                                        <Typography>Pontos de atributo: <b style={{ color: theme.palette.primary.main }}>{formik.values.points.attributes}</b></Typography>
                                    </Box>
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
                                                    label={formik.values.attributes.vig}
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
                                                    label={formik.values.attributes.des}
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
                                                    label={formik.values.attributes.foc}
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
                                                    label={formik.values.attributes.log}
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
                                                    label={formik.values.attributes.sab}
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
                                                    label={formik.values.attributes.car}
                                                /> 
                                            </Box>
                                            {attributePoints('car')}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}