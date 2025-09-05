'use client';

import { classesModel } from '@constants/classes';
import { lineageExpertises, occupationsExpertises, type ExpertisesOverrided } from '@constants/lineageExpertises';
import { lineageItems } from '@constants/lineageItems';
import { races } from '@constants/races';
import { skills } from '@constants/skills';
import { useAudio } from '@hooks';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme, type SelectChangeEvent } from '@mui/material';
import { blue, green, red, yellow } from '@mui/material/colors';
import type { Classes, Ficha, LineageNames, Race } from '@types';
import { useCallback, useMemo, type ReactElement } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export default function Characteristics(): ReactElement {
    const { control, formState: { errors }, setValue, getValues } = useFormContext<Ficha>()
    const ficha = getValues()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const audio = useAudio('/sounds/cybernetic-technology-affirmation.wav')
    const disabled = !!ficha._id

    const setClass = (e: SelectChangeEvent<any>): void => {
        const previousClass = getValues('class') as Classes;
        const newClass = e.target.value as Classes;
        
        // Remover pontos de expertise da classe anterior (se existir)
        if (previousClass) {
            const previousClassExpertisePoints = classesModel[previousClass]?.points?.expertises || 0;
            const currentPoints = getValues('points.expertises');
            setValue('points.expertises', currentPoints - previousClassExpertisePoints);
        }
        
        // Adicionar pontos de expertise da nova classe
        const newClassExpertisePoints = classesModel[newClass]?.points?.expertises || 0;
        const updatedPoints = getValues('points.expertises');
        setValue('points.expertises', updatedPoints + newClassExpertisePoints);
        
        // Atualizar a classe e habilidade de classe
        setValue('class', newClass, { shouldValidate: true });
        setValue('skills.class', [ skills.class[newClass][0] ]);
        
        audio.play();
    }

    const setLineage = (e: SelectChangeEvent<any>): void => {
        const previousLineage = getValues('lineage') as unknown as LineageNames;
        const selectedLineage = e.target.value;
        const isClassicMode = ficha.mode === 'Classic';
        const antecedentSkills = isClassicMode ? skills.lineage : skills.occupation;
        const antecedentItems = lineageItems[selectedLineage as keyof typeof lineageItems]
        
        if (previousLineage) {
            const previousLineageBonus = isClassicMode 
                ? lineageExpertises[previousLineage as unknown as keyof typeof lineageExpertises] 
                : occupationsExpertises[previousLineage as unknown as keyof typeof occupationsExpertises];
            
            if (previousLineageBonus?.tests) {
                Object.entries(previousLineageBonus.tests).forEach(([ expertise, bonus ]) => {
                    const ex = expertise as keyof typeof ficha.expertises
                    const currentExpertise = getValues(`expertises.${ex}`) as any;
                    const currentValue = currentExpertise?.value || 0;
                    
                    setValue(`expertises.${ex}.value`, Math.max(0, currentValue - bonus));
                });
            }
            
            if (previousLineageBonus?.points) {
                const currentPoints = getValues('points.expertises');
                setValue('points.expertises', currentPoints - previousLineageBonus.points);
            }

            if (lineageItems[previousLineage]) {
                const oldLineageItems = lineageItems[previousLineage]

                oldLineageItems.forEach(item => {
                    const type = item.type as 'item' | 'weapon'
                    setValue(`inventory.${type}s`, getValues(`inventory.${type}s`).filter(i => i.name !== item.name) as any)
                })
            }
        }
        
        const lineageBonus = isClassicMode 
            ? lineageExpertises[selectedLineage as unknown as keyof typeof lineageExpertises] 
            : occupationsExpertises[selectedLineage as unknown as keyof typeof occupationsExpertises];
        
        setValue('lineage', selectedLineage, { shouldValidate: true });
        setValue('skills.lineage', [ antecedentSkills.find(skill => skill.origin === selectedLineage)! ]);
        
        // Adicionar itens da nova linhagem
        if (antecedentItems) {
            const currentItems = getValues('inventory.items');
            const currentWeapons = getValues('inventory.weapons');
            
            antecedentItems.forEach(item => {
                if (item.type === 'weapon') {
                    currentWeapons.push(item as any);
                } else {
                    currentItems.push(item as any);
                }
            });
            
            setValue('inventory.items', currentItems);
            setValue('inventory.weapons', currentWeapons);
        }
        
        if (lineageBonus?.tests) {
            Object.entries(lineageBonus.tests).forEach(([ expertise, bonus ]) => {
                const ex = expertise as keyof typeof ficha.expertises
                const currentExpertise = getValues(`expertises.${ex}`);

                if (!currentExpertise) {
                    setValue(`expertises.${ex}`, {
                        value: bonus,
                        defaultAttribute: 'sab'
                    });
                } else {
                    const currentValue = currentExpertise?.value || 0;
                    setValue(`expertises.${ex}.value`, currentValue + bonus);
                }
            });
        }
        
        if (lineageBonus?.points) {
            const currentPoints = getValues('points.expertises');
            setValue('points.expertises', currentPoints + lineageBonus.points);
        }

        // Bônus de linhagem
        if (selectedLineage === 'Artista') {
            setValue('mods.attributes.car', (ficha.mods.attributes.car || 0) + 1);
        } else if (previousLineage === 'Artista') {
            setValue('mods.attributes.car', Math.max(0, (ficha.mods.attributes.car || 0) - 1));
        }

        audio.play();
    }

    const setRace = (e: SelectChangeEvent<any>): void => {
        const selectedRace = e.target.value as Race['name'];
        setValue('race', selectedRace, { shouldValidate: true });
        setValue('skills.race', [ skills.race.find(skill => skill.origin === selectedRace)! ])
        audio.play();
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
        return Object.entries(ficha.mode === 'Classic' ? lineageExpertises : occupationsExpertises).map(([ lineage, expertises ]) => (
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
    }, [ ficha.mode ])

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
            <Box display='flex' flexDirection='column' gap={2} width='65%'>
                <Controller
                    name='name'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <TextField
                            {...field}
                            label='Nome'
                            error={!!error}
                            disabled={disabled}
                            helperText={error?.message}
                            required
                            fullWidth
                        />
                    )}
                />
                <Box display='flex' gap={3}>
                    <FormControl fullWidth>
                        <InputLabel>Classe de Mago *</InputLabel>
                        <Select
                            name='class'
                            label='Classe de Mago'
                            value={ficha.class}
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
                            <InputLabel>{ficha.mode === 'Classic' ? 'Linhagem' : 'Profissão'} *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={ficha.lineage}
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
                    )}
                </Box>
                {matches && (
                    <Box>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel>{ficha.mode === 'Classic' ? 'Linhagem' : 'Profissão'} *</InputLabel>
                            <Select
                                name='lineage'
                                label='Linhagem'
                                value={ficha.lineage}
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
                        disabled={disabled}
                        label='Raça'
                        value={ficha.race}
                        required
                        fullWidth
                        renderValue={selected => String(selected)}
                        onChange={setRace}
                    >
                        {Object.entries(races).map(([ raceName, raceData ]) => (
                            <MenuItem key={raceName} value={raceName}>
                                <Box display='flex' flexDirection='column'>
                                    <Typography>{raceName}</Typography>
                                    {raceName === 'Humano' ? (
                                        <Typography variant='caption' color={green[500]}>+1 Ponto de Atributo</Typography>
                                    ) : (
                                        <>
                                            {raceData.attributes.lp > 0 &&
                                                <Typography variant='caption' color={green[500]}>+{raceData.attributes.lp} LP</Typography>}
                                            {raceData.attributes.lp < 0 &&
                                                <Typography variant='caption' color={red[500]}>{raceData.attributes.lp} LP</Typography>}
                                            {raceData.attributes.mp > 0 &&
                                                <Typography variant='caption' color={green[500]}>+{raceData.attributes.mp} MP</Typography>}
                                            {raceData.attributes.mp < 0 &&
                                                <Typography variant='caption' color={red[500]}>{raceData.attributes.mp} MP</Typography>}
                                            {raceData.attributes.ap > 0 &&
                                                <Typography variant='caption' color={green[500]}>+{raceData.attributes.ap} AP</Typography>}
                                            {raceData.attributes.ap < 0 &&
                                                <Typography variant='caption' color={red[500]}>{raceData.attributes.ap} AP</Typography>}
                                        </>
                                    )}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box display='flex' gap={3}>
                    <Controller
                        name='age'
                        control={control}
                        disabled={disabled}
                        rules={{
                            required: 'Idade é obrigatória',
                            min: { value: 0, message: 'A idade não pode ser negativa' }
                        }}
                        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label='Idade'
                                type='number'
                                error={!!error}
                                helperText={error?.message}
                                required
                                sx={{ width: !matches ? '50%' : '100%' }}
                                inputProps={{
                                    min: 0,
                                    onWheel: (e) => (e.target as HTMLElement).blur()
                                }}
                                onChange={(e) => {
                                    // Converte o valor para número antes de enviar para o formulário
                                    const value = parseInt(e.target.value, 10) || 0;
                                    onChange(value);
                                }}
                            />
                        )}
                    />
                    {!matches && (
                        <FormControl sx={{ width: '50%' }}>
                            <InputLabel>Gênero *</InputLabel>
                            <Controller
                                name='gender'
                                control={control}
                                disabled={disabled}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label='Gênero *'
                                        error={!!errors.gender}
                                        required
                                        fullWidth
                                    >
                                        <MenuItem value='Masculino'>Masculino</MenuItem>
                                        <MenuItem value='Feminino'>Feminino</MenuItem>
                                        <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                        <MenuItem value='Outro'>Outro</MenuItem>
                                        <MenuItem value='Não definido'>Não definido</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.gender && (
                                <FormHelperText error>{String(errors.gender.message)}</FormHelperText>
                            )}
                        </FormControl>
                    )}
                </Box>
                {matches && (
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>Gênero</InputLabel>
                        <Controller
                            name='gender'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label='Gênero *'
                                    error={!!errors.gender}
                                    required
                                    fullWidth
                                >
                                    <MenuItem value='Masculino'>Masculino</MenuItem>
                                    <MenuItem value='Feminino'>Feminino</MenuItem>
                                    <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                    <MenuItem value='Outro'>Outro</MenuItem>
                                    <MenuItem value='Não definido'>Não definido</MenuItem>
                                </Select>
                            )}
                        />
                        {errors.gender && (
                            <FormHelperText error>{String(errors.gender.message)}</FormHelperText>
                        )}
                    </FormControl>
                )}
            </Box>
        </Box>
    )
}