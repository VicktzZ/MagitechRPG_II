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

export default function Characteristics({ formik }: { formik: any }): ReactElement {
    const classRef = useRef<any>(null)
    const f: FormikContextType<typeof fichaModel> = formik

    const audio = useAudio(clickEffect)
    
    const setClass = (e: SelectChangeEvent<any>): void => {
        const classe: Classes = e.target.value

        f.handleChange(e)

        f.setFieldValue('attributes', {
            ...f.values.attributes,
            ...classesModel[classe].attributes,
            lp: classesModel[classe].attributes.lp + (f.values.attributes?.vig ?? 1) * 3,
            mp: classesModel[classe].attributes.mp + (f.values.attributes?.foc ?? 1) * 5
        })

        f.setFieldValue('points', {
            ...f.values.points,
            ...classesModel[classe].points,
            diligence: classesModel[classe].points.diligence + (f.values.attributes?.log ?? 0)
        })

        f.setFieldValue('skills.class', classesModel[classe].skills)
        
        audio.play()

        classRef.current = classesModel[classe]
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
                                onChange={e => {
                                    f.handleChange(e)
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
                                onChange={e => {
                                    f.handleChange(e)
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
                        onChange={e => { 
                            f.handleChange(e)
                            audio.play()
                        }}
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