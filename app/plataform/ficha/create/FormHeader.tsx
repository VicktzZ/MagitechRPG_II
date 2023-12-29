'use client';

import { InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import { Box, FormControl, TextField } from '@mui/material'
import { clickEffect } from '@public/sounds'
import React, { type ReactElement } from 'react'

const audio = new Audio(clickEffect)

export default function FormHeader({ formik }: { formik: any }): ReactElement {
    const setClass = (e: SelectChangeEvent<any>): void => {
        formik.handleChange(e)
        audio.play()

        console.log(e.target.value)
    }

    return (
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
    )
}