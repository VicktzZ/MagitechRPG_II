/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

'use client';

import { type ReactElement, useCallback, useMemo } from 'react'
import { InputLabel, MenuItem, Select, useMediaQuery, type SelectChangeEvent, useTheme, Typography, Button } from '@mui/material'
import { Box, FormControl, TextField } from '@mui/material'
import { clickEffect } from '@public/sounds'
import { classesModel } from '@constants/classes';
import { useFormikContext, type FormikContextType } from 'formik';
import { expertisesDefaultValue, type fichaModel } from '@constants/ficha';
import { blue, green, red, yellow } from '@mui/material/colors';
import { useAudio } from '@hooks';
import { skills } from '@constants/skills';
import { races } from '@constants/races';
import { type ExpertisesOverrided, lineageExpertises, occupationsExpertises } from '@constants/lineageExpertises';
import type { Classes, Race } from '@types';

export default function Characteristics({ disabled }: { disabled?: boolean }): ReactElement {
    const f: FormikContextType<typeof fichaModel> = useFormikContext()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const audio1 = useAudio(clickEffect)

    const changeGameMode = (): void => {
        f.resetForm()
        f.setFieldValue('expertises', expertisesDefaultValue()) // TODO: Bug in "expertises" at changing game mode

        if (f.values.mode === 'Classic') {
            f.setFieldValue('inventory', {
                items: [],
                weapons: [],
                armors: [],
                money: 0            
            })
        }

        f.setFieldValue('mode', f.values.mode === 'Classic' ? 'Apocalypse' : 'Classic')
    }

    const setClass = (e: SelectChangeEvent<any>): void => {
        const classe: Classes = e.target.value
        const expertiseHasValue = Object.values(f.values.expertises as any).some((expertise: any) => expertise.value > 1)

        f.handleChange(e)

        f.setFieldValue('points', {
            ...f.values.points,
            ...classesModel[classe].points,
            diligence: classesModel[classe].points.diligence + (f.values.attributes?.log ?? 0),
            expertises: !expertiseHasValue ? classesModel[classe].points.expertises :
                expertiseHasValue && f.values.lineage as unknown as string !== '' ? classesModel[classe].points.expertises : 0
        })

        f.setFieldValue('skills.class', classesModel[classe].skills)

        audio1.play()
    }

    const setLineage = (e: SelectChangeEvent<any>): void => {
        const lineage = e.target.value
        const skillType = f.values.mode === 'Classic' ? 'lineage' : 'occupation'

        f.handleChange(e)
        f.setFieldValue('lineage', lineage)

        skills[skillType]?.forEach(skill => {
            if (skill.origin === lineage)
                f.setFieldValue('skills.lineage', [ skill ])
        })

        audio1.play()
    }

    const setRace = (e: SelectChangeEvent<any>): void => {
        const race: Race['name'] = e.target.value

        f.handleChange(e)
        f.setFieldValue('race', race)

        audio1.play()
    }

    const lineagePoints = useCallback((expertises: ExpertisesOverrided): string => {
        let pointsStr = ''
        let testsStr = ''
        let result = ''

        if (expertises?.points) {
            pointsStr = `+${expertises.points} Pontos de Perícia`
        }

        if (expertises?.tests) {
            Object.entries(expertises.tests).forEach(([ key, value ]) => {
                testsStr += `${key}: +${value}; `
            })
        }

        result = `${pointsStr}${pointsStr !== '' && testsStr !== '' ? '\n' : ''}${testsStr}`

        return result
    }, [])

    const lineages = useMemo(() => {
        console.log(f.values.mode)
        return Object.entries(f.values.mode === 'Classic' ? lineageExpertises : occupationsExpertises).map(([ lineage, expertises ]) => (
            <MenuItem
                key={lineage}
                value={lineage}
            >
                <Box>
                    <Typography>{lineage}</Typography>
                    <Typography noWrap whiteSpace='pre-wrap' color={green[500]} variant='caption'>
                        {lineagePoints(expertises)}
                    </Typography>
                </Box>
            </MenuItem>
        ))
    }, [ f.values.mode ])

    const classes = useMemo(() => {
        return Object.keys(classesModel).map(classe => (
            <MenuItem key={classe} value={classe}>
                <Box>
                    <Typography>
                        {classesModel[classe as keyof typeof classesModel].name}
                    </Typography>
                    <Box display='flex' gap={2}>
                        <Typography fontWeight={900} variant='caption' color={red[500]}>
                            LP: {classesModel[classe as keyof typeof classesModel].attributes.lp}
                        </Typography>
                        <Typography fontWeight={900} variant='caption' color={blue[300]}>
                            MP: {classesModel[classe as keyof typeof classesModel].attributes.mp}
                        </Typography>
                        <Typography fontWeight={900} variant='caption' color={yellow[500]}>
                            AP: {classesModel[classe as keyof typeof classesModel].attributes.ap}
                        </Typography>
                    </Box>
                </Box>
            </MenuItem>
        ))
    }, [])

    return (
        <Box display='flex' gap={3} width='100%'>
            {!disabled && (
                <Button
                    variant='contained'
                    color={'terciary' as any}
                    type='button'
                    onClick={changeGameMode}
                    sx={{
                        position: 'absolute',
                        top: 30,
                        right: 32
                    }}
                >
                    Modo de jogo: {f.values.mode}
                </Button>
            )}
            <Box display='flex' flexDirection='column' gap={2} width='65%'>
                <TextField
                    name='name'
                    label='Nome'
                    onBlur={f.handleChange}
                    defaultValue={f.values.name}
                    required
                    fullWidth
                    disabled={disabled}
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
                            disabled={disabled}
                            onChange={e => {
                                setClass(e)
                            }}
                            renderValue={(value) => (
                                <Typography>{value as string}</Typography>
                            )}
                        >
                            {classes}
                        </Select>
                    </FormControl>
                    {!matches && (
                        <FormControl sx={{ width: '50%' }}>
                            <InputLabel>{f.values.mode === 'Classic' ? 'Linhagem' : 'Profissão'} *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={f.values.lineage}
                                required
                                fullWidth
                                onChange={setLineage}
                                disabled={disabled}
                                MenuProps={{
                                    sx: { maxHeight: '60vh' }
                                }}
                                renderValue={value => (
                                    <Typography>{value as unknown as string}</Typography>
                                )}
                            >
                                {lineages}
                            </Select>
                        </FormControl>
                    )}
                </Box>
                {matches && (
                    <Box>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel>{f.values.mode === 'Classic' ? 'Linhagem' : 'Profissão'} *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={f.values.lineage}
                                required
                                fullWidth
                                disabled={disabled}
                                onChange={setLineage}
                                MenuProps={{
                                    sx: { maxHeight: '60vh' }
                                }}
                                renderValue={value => (
                                    <Typography>{value as unknown as string}</Typography>
                                )}
                            >
                                {lineages}
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
                        disabled={disabled}
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
                                <Typography variant='caption' color={green[500]}>+{races.Ciborgue.attributes.ap} AP</Typography>
                                <Typography variant='caption' color={red[500]}>{races.Ciborgue.attributes.mp} MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Humanoide'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Humanóide</Typography>
                                <Typography variant='caption' color={green[500]}>+{races.Humanoide.attributes.lp} LP</Typography>
                                <Typography variant='caption' color={green[500]}>+{races.Humanoide.attributes.mp} MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Autômato'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Autômato</Typography>
                                <Typography variant='caption' color={green[500]}>+{races['Autômato'].attributes.mp} MP</Typography>
                                <Typography variant='caption' color={red[500]}>{races['Autômato'].attributes.ap} AP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Mutante'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Mutante</Typography>
                                <Typography variant='caption' color={green[500]}>+{races.Mutante.attributes.lp} LP</Typography>
                                <Typography variant='caption' color={red[500]}>{races.Mutante.attributes.mp} MP</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value='Magia-viva'>
                            <Box display='flex' flexDirection='column'>
                                <Typography>Magia-viva</Typography>
                                <Typography variant='caption' color={green[500]}>+{races['Magia-viva'].attributes.mp} MP</Typography>
                                <Typography variant='caption' color={red[500]}>{races['Magia-viva'].attributes.lp} LP</Typography>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
                <Box display='flex' gap={3}>
                    <TextField
                        name='age'
                        label='Idade'
                        onBlur={f.handleChange}
                        defaultValue={f.values.age}
                        disabled={disabled}
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
                                defaultValue={f.values.gender}
                                disabled={disabled}
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
                            onBlur={f.handleChange}
                            defaultValue={f.values.gender}
                            disabled={disabled}
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