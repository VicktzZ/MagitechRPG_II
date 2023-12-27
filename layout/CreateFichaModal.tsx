'use client';

import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, Slider, TextField, Typography, useTheme } from '@mui/material'
import React, { useContext, type ReactElement, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { User, type Ficha } from '@types';
import { fichaModel } from '@contexts/fichaContext';
import { useSession } from 'next-auth/react';

import { clickEffect } from '@public/sounds';
import { RadarChart } from '@components/misc';
const audio = new Audio(clickEffect)

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

    const { fichas }: User = JSON.parse(localStorage.getItem('user') ?? '{}')

    const initialValues: Ficha = { 
        ...fichaModel as Ficha,
        playerName: session?.user?.name ?? ''
    }

    const [ openModal, setOpenModal ] = useState<boolean>(true)
    const handleModalClose = (): void => { setOpenModal(false) }

    const formik = useFormik({
        initialValues,
        // validationSchema,
        onSubmit: (values) => {
            console.log(values)
        }
    })

    const marks = [
        {
            value: -1,
            label: '-1'
        },
        {
            value: 0,
            label: '0'
        },
        {
            value: 1,
            label: '1'
        },
        {
            value: 2,
            label: '2'
        },
        {
            value: 3,
            label: '3'
        },
        {
            value: 4,
            label: '4'
        },
        {
            value: 5,
            label: '5'
        }
    ]

    return (
        <Modal
            open={fichas?.length < 1 ? openModal : open}
            onClose={fichas?.length < 1 ? handleModalClose : handleClose}
            disableAutoFocus
            disableEnforceFocus
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw' 
            }}
        >
            <Box 
                display='flex' 
                height='95%' 
                width='90%'
                bgcolor='background.paper'
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
                            <Box display='flex' gap={3} width='100%'>
                                <Box display='flex' flexDirection='column' gap={2} width='65%'>
                                    <TextField 
                                        name='name'
                                        label='Nome'
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        required
                                        fullWidth
                                    />
                                    <Box display='flex' gap={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Classe de Mago *</InputLabel>
                                            <Select 
                                                name='class'
                                                label='Classe de Mago'
                                                value={formik.values.class}
                                                required
                                                fullWidth
                                                onChange={e => { 
                                                    formik.handleChange(e)
                                                    audio.play()
                                                }}
                                            >
                                                <MenuItem value='Marcial'>Marcial</MenuItem>
                                                <MenuItem value='Explorador'>Explorador</MenuItem>
                                                <MenuItem value='Feiticeiro'>Feiticeiro</MenuItem>
                                                <MenuItem value='Bruxo'>Bruxo</MenuItem>
                                                <MenuItem value='Monge'>Monge</MenuItem>
                                                <MenuItem value='Druida'>Druida</MenuItem>
                                                <MenuItem value='Arcano'>Arcano</MenuItem>
                                                <MenuItem value='Ladino'>Ladino</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ width: '50%' }}>
                                            <InputLabel>Linhagem *</InputLabel>
                                            <Select
                                                name='lineage'
                                                label='Linhagem'
                                                value={formik.values.lineage}
                                                required
                                                fullWidth
                                                onChange={e => {
                                                    formik.handleChange(e)
                                                    audio.play()
                                                }}
                                                MenuProps={{
                                                    sx: { maxHeight: '60vh' }
                                                }}
                                            >
                                                <MenuItem value='Órfão'>Órfão</MenuItem>
                                                <MenuItem value='Infiltrado'>Infiltrado</MenuItem>
                                                <MenuItem value='Estrangeiro'>Estrangeiro</MenuItem>
                                                <MenuItem value='Camponês'>Camponês</MenuItem>
                                                <MenuItem value='Burguês'>Burguês</MenuItem>
                                                <MenuItem value='Artista'>Artista</MenuItem>
                                                <MenuItem value='Ginasta'>Ginasta</MenuItem>
                                                <MenuItem value='Herdeiro'>Herdeiro</MenuItem>
                                                <MenuItem value='Cobaia'>Cobaia</MenuItem>
                                                <MenuItem value='Gangster'>Gangster</MenuItem>
                                                <MenuItem value='Hacker'>Hacker</MenuItem>
                                                <MenuItem value='Combatente'>Combatente</MenuItem>
                                                <MenuItem value='Aventureiro'>Aventureiro</MenuItem>
                                                <MenuItem value='Trambiqueiro'>Trambiqueiro</MenuItem>
                                                <MenuItem value='Prodígio'>Prodígio</MenuItem>
                                                <MenuItem value='Novato'>Novato</MenuItem>
                                                <MenuItem value='Inventor'>Inventor</MenuItem>
                                                <MenuItem value='Idólatra'>Idólatra</MenuItem>
                                                <MenuItem value='Cismático'>Cismático</MenuItem>
                                                {/* Acresentar no sistema */}
                                                <MenuItem value='Pesquisador'>Pesquisador</MenuItem>
                                                <MenuItem value='Exilado'>Exilado</MenuItem>
                                                <MenuItem value='Investigador'>Investigador</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                                <Box display='flex' flexDirection='column' gap={2} width='35%'>
                                    <FormControl>
                                        <InputLabel>Raça *</InputLabel>
                                        <Select 
                                            name='race'
                                            label='Raça'
                                            value={formik.values.race}
                                            required
                                            fullWidth
                                            onChange={e => { 
                                                formik.handleChange(e)
                                                audio.play()
                                            }}
                                        >
                                            <MenuItem value='Humano'>Humano</MenuItem>
                                            <MenuItem value='Ciborgue'>Ciborgue</MenuItem>
                                            <MenuItem value='Autômato'>Autômato</MenuItem>
                                            <MenuItem value='Humanoide'>Humanoide</MenuItem>
                                            <MenuItem value='Mutante'>Mutante</MenuItem>
                                            <MenuItem value='Magia-viva'>Magia-viva</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Box display='flex' gap={3}>
                                        <TextField 
                                            name='age'
                                            label='Idade'
                                            value={formik.values.age}
                                            onChange={formik.handleChange}
                                            required
                                            sx={{ width: '50%' }}
                                        />
                                        <FormControl sx={{ width: '50%' }}>
                                            <InputLabel>Gênero</InputLabel>
                                            <Select 
                                                name='gender'
                                                label='Gênero'
                                                value={formik.values.gender}
                                                onChange={formik.handleChange}
                                                required
                                                fullWidth
                                            >
                                                <MenuItem value='Masculino'>Masculino</MenuItem>
                                                <MenuItem value='Feminino'>Feminino</MenuItem>
                                                <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                                <MenuItem value='Outro'>Outro</MenuItem>
                                                <MenuItem value='Não definido'>Não definido</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                            </Box>
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
                                    <Box width='25%'>
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
                                                scales: {
                                                    r: {
                                                        suggestedMin: -1,
                                                        suggestedMax: 20,
                                                        angleLines: {
                                                            color: '#f4f4f4'
                                                        },
                                                        pointLabels: {
                                                            color: '#f4f4f4'
                                                        },
                                                        grid: {
                                                            color: '#f4f4f4'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box 
                                        display='flex'
                                        gap={3}
                                        flexDirection='column'
                                        width='20%'
                                    >
                                        <Box>
                                            <Typography>Pontos de atributos: <b>{formik.values.points.attributes}</b></Typography>
                                        </Box>
                                        <Box display='flex' flexDirection='column' gap={2}>
                                            <Box>
                                                <Typography>Vigor: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.vig', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                            <Box>
                                                <Typography>Destreza: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.des', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                            <Box>
                                                <Typography>Foco: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.foc', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                            <Box>
                                                <Typography>Lógica: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.log', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                            <Box>
                                                <Typography>Sabedoria: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.sab', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                            <Box>
                                                <Typography>Carisma: </Typography>
                                                <Slider
                                                    defaultValue={0}
                                                    step={1}
                                                    min={-1}
                                                    max={3}
                                                    marks={marks}
                                                    onChange={(e, value) => { formik.setFieldValue('attributes.car', value) }}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Button type='submit'>Confirmar</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}