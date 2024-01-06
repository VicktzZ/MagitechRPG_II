/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

'use client';

import { InputLabel, MenuItem, Select, useMediaQuery, type SelectChangeEvent, useTheme, Typography } from '@mui/material'
import { Box, FormControl, TextField } from '@mui/material'
import { clickEffect } from '@public/sounds'
import { classesModel } from '@constants/classes';
import React, { useRef, type ReactElement } from 'react'
import { type Classes } from '@types';
import { type FormikContextType } from 'formik';
import { type fichaModel } from '@constants/ficha';
import { green, red } from '@mui/material/colors';
import { useAudio } from '@hooks';
import { skills } from '@constants/skills';
import type { Race } from '@types';

export default function Characteristics({ formik }: { formik: any }): ReactElement {
    const classRef = useRef<any>(null)
    const raceRef = useRef<Race['name'] | null>(null)
    const attrRef = useRef<{ attr1: number, attr2: number }>({ attr1: 0, attr2: 0 })
        
    const f: FormikContextType<typeof fichaModel> = formik

    const audio1 = useAudio(clickEffect)

    const setRaceBonus = (
        attr1: { name: 'mp' | 'lp' | 'ap', value: number },
        attr2: { name: 'mp' | 'lp' | 'ap', value: number },
        isRef?: boolean
    ): void => {
        if (!isRef) {
            attrRef.current.attr1 = f.values.attributes?.[attr1.name]! <= 0 ? 0 : f.values.attributes?.[attr1.name]!
            attrRef.current.attr2 = f.values.attributes?.[attr2.name]! <= 0 ? 0 : f.values.attributes?.[attr2.name]!

            f.setFieldValue(`attributes.${attr1.name}`, (
                (f.values.attributes?.[attr1.name] ?? 0) + attr1.value
            ) as unknown as string)
            f.setFieldValue(`attributes.${attr2.name}`, (
                (f.values.attributes?.[attr2.name] ?? 0) - attr2.value
            ) as unknown as string)
        } else {
            f.setFieldValue(`attributes.${attr1.name}`, attrRef.current.attr1)
            f.setFieldValue(`attributes.${attr2.name}`, attrRef.current.attr2)

            // f.setFieldValue(`attributes.${attr1.name}`, (
            //     (f.values.attributes?.[attr1.name] ?? 0) + attr1.value
            // ) as unknown as string)
            // f.setFieldValue(`attributes.${attr2.name}`, (
            //     (f.values.attributes?.[attr2.name] ?? 0) - attr2.value
            // ) as unknown as string)
        }

        console.log(attrRef.current.attr1, attrRef.current.attr2);
    }

    const raceFunctions: Record<Race['name'], (isRef?: boolean) => void> = {            
        'Humano': (isRef?: boolean): void => {
            if (!isRef)
                f.setFieldValue('points.attributes', (f.values.points?.attributes ?? 0) + 1)
            else 
                f.setFieldValue('points.attributes', (f.values.points?.attributes ?? 0) - 1)
        },

        'Autômato': (isRef?: boolean): void => {
            setRaceBonus({ name: 'mp', value: 6 }, { name: 'ap', value: 1 }, isRef)
        },

        'Ciborgue': (isRef?: boolean): void => {
            setRaceBonus({ name: 'ap', value: 1 }, { name: 'mp', value: 6 }, isRef)
        },

        'Humanoide': (isRef?: boolean): void => {
            setRaceBonus({ name: 'lp', value: 3 }, { name: 'mp', value: -3 }, isRef)
        },

        'Mutante': (isRef?: boolean): void => {
            setRaceBonus({ name: 'lp', value: 6 }, { name: 'mp', value: 6 }, isRef)
        },

        'Magia-viva': (isRef?: boolean): void => {
            setRaceBonus({ name: 'mp', value: 8 }, { name: 'lp', value: 8 }, isRef)
        }
    }

    const setClass = (e: SelectChangeEvent<any>): void => {
        const classe: Classes = e.target.value

        const expertiseHasValue = Object.values(f.values.expertises as any).some((expertise: any) => expertise.value > 1)

        f.handleChange(e)

        f.setFieldValue('attributes', {
            ...f.values.attributes,
            ...classesModel[classe].attributes,
            lp: classesModel[classe].attributes.lp + (f.values.attributes?.vig ?? 1) * 3,
            mp: classesModel[classe].attributes.mp + (f.values.attributes?.foc ?? 1) * 5,
            ap: classesModel[classe].attributes.ap + 5
        })

        f.setFieldValue('points', {
            ...f.values.points,
            ...classesModel[classe].points,
            diligence: classesModel[classe].points.diligence + (f.values.attributes?.log ?? 0),
            expertises: !expertiseHasValue ? classesModel[classe].points.expertises : 0 
        })

        f.setFieldValue('skills.class', classesModel[classe].skills)
        
        audio1.play()

        classRef.current = classesModel[classe]
    }

    const setLineage = (e: SelectChangeEvent<any>): void => {
        f.handleChange(e)
        f.setFieldValue('lineage', e.target.value)

        skills.lineage?.forEach(skill => {
            if (skill.origin === e.target.value)
                f.setFieldValue('skills.lineage', [ skill ])
        })

        audio1.play()
    }

    const setRace = (e: SelectChangeEvent<any>): void => {
        const race: Race['name'] = e.target.value

        if (raceRef.current) {
            raceFunctions[raceRef.current](true)
        }

        f.handleChange(e)
        f.setFieldValue('race', race)

        raceFunctions[race](false)
        
        audio1.play()
        raceRef.current = race
    }

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <Box display='flex' gap={3} width='100%'>
            <Box display='flex' flexDirection='column' gap={2} width='65%'>
                <TextField 
                    name='name'
                    label='Nome'
                    value={f.values.name}
                    onChange={f.handleChange}
                    required
                    fullWidth
                />
                <Box display='flex' gap={3}>
                    <FormControl fullWidth>
                        <InputLabel>Classe de Mago *</InputLabel>
                        <Select
                            name='class'
                            label='Classe de Mago'
                            value={f.values.class}
                            required
                            fullWidth
                            onChange={e => { 
                                setClass(e)                              
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
                    {!matches && (
                        <FormControl sx={{ width: '50%' }}>
                            <InputLabel>Linhagem *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={f.values.lineage}
                                required
                                fullWidth
                                onChange={setLineage}
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
                    )}
                </Box>
                {matches && (
                    <Box>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel>Linhagem *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={f.values.lineage}
                                required
                                fullWidth
                                onChange={setLineage}
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
                )}
            </Box>
            <Box display='flex' flexDirection='column' gap={2} width='35%'>
                <FormControl>
                    <InputLabel>Raça *</InputLabel>
                    <Select 
                        name='race'
                        label='Raça'
                        value={f.values.race}
                        required
                        fullWidth
                        renderValue={selected => String(selected)}
                        onChange={setRace}
                    >
                        <MenuItem value='Humano'>
                            <Box>
                                <Typography>Humano</Typography>
                                <Typography variant='caption' color={green[500]}>+1 Ponto de Atributo</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Ciborgue'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Ciborgue</Typography>
                                <Typography variant='caption' color={green[500]}>+1 AP</Typography>
                                <Typography variant='caption' color={red[500]}>-6 MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Autômato'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Autômato</Typography>
                                <Typography variant='caption' color={green[500]}>+6 MP</Typography>
                                <Typography variant='caption' color={red[500]}>-1 AP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Humanoide'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Humanóide</Typography>
                                <Typography variant='caption' color={green[500]}>+3 LP</Typography>
                                <Typography variant='caption' color={green[500]}>+3 MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Mutante'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Mutante</Typography>
                                <Typography variant='caption' color={green[500]}>+6 LP</Typography>
                                <Typography variant='caption' color={red[500]}>-6 MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Magia-viva'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Magia-viva</Typography>
                                <Typography variant='caption' color={green[500]}>+8 MP</Typography>
                                <Typography variant='caption' color={red[500]}>-8 LP</Typography>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
                <Box display='flex' gap={3}>
                    <TextField 
                        name='age'
                        label='Idade'
                        value={f.values.age}
                        onChange={f.handleChange}
                        required
                        sx={{ width: !matches ? '50%' : '100%' }}
                    />
                    {!matches && (
                        <FormControl sx={{ width: '50%' }}>
                            <InputLabel>Gênero</InputLabel>
                            <Select 
                                name='gender'
                                label='Gênero'
                                value={f.values.gender}
                                onChange={f.handleChange}
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
                    )}
                </Box>
                {matches && (
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Gênero</InputLabel>
                        <Select 
                            name='gender'
                            label='Gênero'
                            value={f.values.gender}
                            onChange={f.handleChange}
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
                )}
            </Box>
        </Box>
    )
}