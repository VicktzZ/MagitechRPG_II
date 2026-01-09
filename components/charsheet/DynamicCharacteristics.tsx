/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { classesModel } from '@constants/classes';
import { lineageExpertises, occupationsExpertises, type ExpertisesOverrided } from '@constants/lineageExpertises';
import { lineageItems } from '@constants/lineageOccupationItems';
import { races } from '@constants/races';
import { skills } from '@constants/skills';
import { useAudio } from '@hooks';
import type { Race, RPGSystem } from '@models';
import type { Charsheet } from '@models/entities';
import type { ClassNames, LineageNames } from '@models/types/string';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme, type SelectChangeEvent } from '@mui/material';
import { blue, green, red, yellow } from '@mui/material/colors';
import { useCallback, useMemo, type ReactElement } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface DynamicCharacteristicsProps {
    system: RPGSystem | null;
}

export default function DynamicCharacteristics({ system }: DynamicCharacteristicsProps): ReactElement {
    const { control, setValue, getValues } = useFormContext<Charsheet>();
    const charsheet = getValues();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const audio = useAudio('/sounds/cybernetic-technology-affirmation.wav');
    const disabled = !!charsheet.id;

    const isCustomSystem = !!system;

    // Get custom names or use defaults
    const classLabel = system?.conceptNames?.class || 'Classe de Mago';
    const lineageLabel = system?.conceptNames?.lineage || (charsheet.mode === 'Classic' ? 'Linhagem' : 'Profissão');
    const raceLabel = system?.conceptNames?.race || 'Raça';

    const setClass = (e: SelectChangeEvent<any>): void => {
        const previousClass = getValues('class') as ClassNames;
        const newClass = e.target.value as ClassNames;
        
        if (!isCustomSystem) {
            // Lógica padrão do Magitech
            if (previousClass) {
                const previousClassExpertisePoints = classesModel[previousClass]?.points?.expertises || 0;
                const currentPoints = getValues('points.expertises');
                setValue('points.expertises', currentPoints - previousClassExpertisePoints);
            }
            
            const newClassExpertisePoints = classesModel[newClass]?.points?.expertises || 0;
            const updatedPoints = getValues('points.expertises');
            setValue('points.expertises', updatedPoints + newClassExpertisePoints);
            
            setValue('class', newClass, { shouldValidate: true });
            setValue('skills.class', [ skills.class[newClass][0] ]);
        } else {
            // Sistema customizado
            setValue('class', newClass, { shouldValidate: true });
            
            const customClass = system.classes?.find(c => c.name === newClass);
            if (customClass?.skills) {
                setValue('skills.class', customClass.skills.slice(0, 1) as any);
            }
        }
        
        audio.play();
    };

    const setLineage = (e: SelectChangeEvent<any>): void => {
        const previousLineage = getValues('lineage') as unknown as LineageNames;
        const selectedLineage = e.target.value;
        
        if (!isCustomSystem) {
            // Lógica padrão do Magitech
            const isClassicMode = charsheet.mode === 'Classic';
            const antecedentSkills = isClassicMode ? skills.lineage : skills.occupation;
            const antecedentItems = lineageItems[selectedLineage as keyof typeof lineageItems];
            
            if (previousLineage) {
                const previousLineageBonus = isClassicMode 
                    ? lineageExpertises[previousLineage as unknown as keyof typeof lineageExpertises] 
                    : occupationsExpertises[previousLineage as unknown as keyof typeof occupationsExpertises];
                
                if (previousLineageBonus?.tests) {
                    Object.entries(previousLineageBonus.tests).forEach(([ expertise, bonus ]) => {
                        const ex = expertise as keyof typeof charsheet.expertises;
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
                    const oldLineageItems = lineageItems[previousLineage];

                    oldLineageItems.forEach(item => {
                        const type = item.type as 'item' | 'weapon';
                        setValue(`inventory.${type}s`, getValues(`inventory.${type}s`).filter(i => i.name !== item.name) as any);
                    });
                }
            }
            
            const lineageBonus = isClassicMode 
                ? lineageExpertises[selectedLineage as unknown as keyof typeof lineageExpertises] 
                : occupationsExpertises[selectedLineage as unknown as keyof typeof occupationsExpertises];
            
            setValue('lineage', selectedLineage, { shouldValidate: true });
            setValue('skills.lineage', [ antecedentSkills.find(skill => skill.origin === selectedLineage)! ]);
            
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
                    const ex = expertise as keyof typeof charsheet.expertises;
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

            if (selectedLineage === 'Artista') {
                setValue('mods.attributes.car', (charsheet.mods.attributes.car || 0) + 1);
            } else if (previousLineage === 'Artista') {
                setValue('mods.attributes.car', Math.max(0, (charsheet.mods.attributes.car || 0) - 1));
            }
        } else {
            // Sistema customizado
            setValue('lineage', selectedLineage, { shouldValidate: true });
            
            const customLineage = system.lineages?.find(l => l.name === selectedLineage);
            if (customLineage?.skills) {
                setValue('skills.lineage', customLineage.skills.slice(0, 1) as any);
            }
        }

        audio.play();
    };

    const setRace = (e: SelectChangeEvent<any>): void => {
        const selectedRace = e.target.value as Race['name'];
        
        if (!isCustomSystem) {
            setValue('race', selectedRace, { shouldValidate: true });
            setValue('skills.race', [ skills.race.find(skill => skill.origin === selectedRace)! ]);
        } else {
            setValue('race', selectedRace, { shouldValidate: true });
            
            const customRace = system.races?.find(r => r.name === selectedRace);
            if (customRace?.skills) {
                setValue('skills.race', customRace.skills.slice(0, 1) as any);
            }
        }
        
        audio.play();
    };

    const lineagePoints = useCallback((expertises: ExpertisesOverrided): string => {
        let pointsStr = '';
        let testsStr = '';
        let result = '';

        if (expertises?.points) {
            pointsStr = `+${expertises.points} Pontos de Perícia`;
        }

        if (expertises?.tests) {
            Object.entries(expertises.tests).forEach(([ key, value ]) => {
                testsStr += `${key}: +${value}; `;
            });
        }

        result = `${pointsStr}${pointsStr !== '' && testsStr !== '' ? '\n' : ''}${testsStr}`;

        return result;
    }, []);

    // Renderização de linhagens/ocupações
    const lineages = useMemo(() => {
        if (isCustomSystem && system.lineages && system.lineages.length > 0) {
            return system.lineages.map((lineage) => (
                <MenuItem key={lineage.name} value={lineage.name}>
                    <Box>
                        <Typography>{lineage.name}</Typography>
                        {lineage.description && (
                            <Typography variant='caption' color='text.secondary'>
                                {lineage.description}
                            </Typography>
                        )}
                    </Box>
                </MenuItem>
            ));
        }
        
        return Object.entries(charsheet.mode === 'Classic' ? lineageExpertises : occupationsExpertises).map(([ lineage, expertises ]) => (
            <MenuItem key={lineage} value={lineage}>
                <Box>
                    <Typography>{lineage}</Typography>
                    <Typography noWrap whiteSpace='pre-wrap' color={green[500]} variant='caption'>
                        {lineagePoints(expertises)}
                    </Typography>
                </Box>
            </MenuItem>
        ));
    }, [ charsheet.mode, isCustomSystem, system, lineagePoints ]);

    // Renderização de classes
    const classes = useMemo(() => {
        if (isCustomSystem && system.classes && system.classes.length > 0) {
            return system.classes.map(classe => (
                <MenuItem key={classe.name} value={classe.name}>
                    <Box>
                        <Typography>{classe.name}</Typography>
                        {classe.description && (
                            <Typography variant='caption' color='text.secondary'>
                                {classe.description}
                            </Typography>
                        )}
                    </Box>
                </MenuItem>
            ));
        }
        
        return Object.keys(classesModel).map(classe => (
            <MenuItem key={classe} value={classe}>
                <Box>
                    <Typography>
                        {classesModel[classe as keyof typeof classesModel].name}
                    </Typography>
                    <Box display='flex' gap={2}>
                        <Typography fontWeight={900} variant='caption' color={red[500]}>
                            LP: {classesModel[classe as keyof typeof classesModel].stats.lp}
                        </Typography>
                        <Typography fontWeight={900} variant='caption' color={blue[300]}>
                            MP: {classesModel[classe as keyof typeof classesModel].stats.mp}
                        </Typography>
                        <Typography fontWeight={900} variant='caption' color={yellow[500]}>
                            AP: {classesModel[classe as keyof typeof classesModel].stats.ap}
                        </Typography>
                    </Box>
                </Box>
            </MenuItem>
        ));
    }, [ isCustomSystem, system ]);

    // Renderização de raças
    const racesOptions = useMemo(() => {
        if (isCustomSystem && system.races && system.races.length > 0) {
            return system.races.map(race => (
                <MenuItem key={race.name} value={race.name}>
                    <Box display='flex' flexDirection='column'>
                        <Typography>{race.name}</Typography>
                        {race.description && (
                            <Typography variant='caption' color='text.secondary'>
                                {race.description}
                            </Typography>
                        )}
                    </Box>
                </MenuItem>
            ));
        }
        
        return Object.entries(races).map(([ raceName, raceData ]) => (
            <MenuItem key={raceName} value={raceName}>
                <Box display='flex' flexDirection='column'>
                    <Typography>{raceName}</Typography>
                    {raceName === 'Humano' ? (
                        <Typography variant='caption' color={green[500]}>+1 Ponto de Atributo</Typography>
                    ) : (
                        <>
                            {raceData.stats.lp > 0 && (
                                <Typography variant='caption' color={green[500]}>+{raceData.stats.lp} LP</Typography>
                            )}
                            {raceData.stats.lp < 0 && (
                                <Typography variant='caption' color={red[500]}>{raceData.stats.lp} LP</Typography>
                            )}
                            {raceData.stats.mp > 0 && (
                                <Typography variant='caption' color={green[500]}>+{raceData.stats.mp} MP</Typography>
                            )}
                            {raceData.stats.mp < 0 && (
                                <Typography variant='caption' color={red[500]}>{raceData.stats.mp} MP</Typography>
                            )}
                            {raceData.stats.ap > 0 && (
                                <Typography variant='caption' color={green[500]}>+{raceData.stats.ap} AP</Typography>
                            )}
                            {raceData.stats.ap < 0 && (
                                <Typography variant='caption' color={red[500]}>{raceData.stats.ap} AP</Typography>
                            )}
                        </>
                    )}
                </Box>
            </MenuItem>
        ));
    }, [ isCustomSystem, system ]);

    // Verificar campos habilitados
    const showClasses = !isCustomSystem || (system.enabledFields?.class !== false);
    const showRaces = !isCustomSystem || (system.enabledFields?.race !== false);
    const showLineages = !isCustomSystem || (system.enabledFields?.lineage !== false);

    return (
        <Box display='flex' gap={3} width='100%'>
            {/* Coluna esquerda */}
            <Box display='flex' flexDirection='column' gap={2} width={showRaces ? '65%' : '100%'}>
                {/* Nome */}
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

                {/* Classe e Linhagem (desktop) */}
                <Box display='flex' gap={3}>
                    {showClasses && (
                        <Controller
                            name='class'
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl fullWidth error={!!error} disabled={disabled}>
                                    <InputLabel>{classLabel} *</InputLabel>
                                    <Select
                                        {...field}
                                        label={`${classLabel} *`}
                                        required
                                        fullWidth
                                        onChange={(e) => {
                                            setClass(e);
                                            field.onChange((e as SelectChangeEvent<any>).target.value);
                                        }}
                                        renderValue={(value) => (
                                            <Typography>{value as string}</Typography>
                                        )}
                                    >
                                        {classes}
                                    </Select>
                                    {error && (
                                        <FormHelperText error>{String(error.message)}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    )}

                    {!matches && showLineages && (
                        <Controller
                            name='lineage'
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl sx={{ width: showClasses ? '50%' : '100%' }} error={!!error} disabled={disabled}>
                                    <InputLabel>{lineageLabel} *</InputLabel>
                                    <Select
                                        {...field}
                                        label={`${lineageLabel} *`}
                                        required
                                        fullWidth
                                        onChange={(e) => {
                                            setLineage(e);
                                            field.onChange((e as SelectChangeEvent<any>).target.value);
                                        }}
                                        MenuProps={{ sx: { maxHeight: '60vh' } }}
                                        renderValue={value => (
                                            <Typography>{value as unknown as string}</Typography>
                                        )}
                                    >
                                        {lineages}
                                    </Select>
                                    {error && (
                                        <FormHelperText error>{String(error.message)}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    )}
                </Box>

                {/* Linhagem (mobile) */}
                {matches && showLineages && (
                    <Controller
                        name='lineage'
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <FormControl sx={{ width: '100%' }} error={!!error} disabled={disabled}>
                                <InputLabel>{lineageLabel} *</InputLabel>
                                <Select
                                    {...field}
                                    label={`${lineageLabel} *`}
                                    required
                                    fullWidth
                                    onChange={(e) => {
                                        setLineage(e);
                                        field.onChange((e as SelectChangeEvent<any>).target.value);
                                    }}
                                    MenuProps={{ sx: { maxHeight: '60vh' } }}
                                    renderValue={value => (
                                        <Typography>{value as unknown as string}</Typography>
                                    )}
                                >
                                    {lineages}
                                </Select>
                                {error && (
                                    <FormHelperText error>{String(error.message)}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />
                )}
            </Box>

            {/* Coluna direita */}
            {showRaces && (
                <Box display='flex' flexDirection='column' gap={2} width='35%'>
                    {/* Raça */}
                    <Controller
                        name='race'
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <FormControl error={!!error} disabled={disabled}>
                                <InputLabel>{raceLabel} *</InputLabel>
                                <Select
                                    {...field}
                                    label={`${raceLabel} *`}
                                    required
                                    fullWidth
                                    renderValue={selected => String(selected)}
                                    onChange={(e) => {
                                        setRace(e);
                                        field.onChange((e as SelectChangeEvent<any>).target.value);
                                    }}
                                >
                                    {racesOptions}
                                </Select>
                                {error && (
                                    <FormHelperText error>{String(error.message)}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />

                    {/* Idade e Gênero (desktop) */}
                    <Box display='flex' gap={3}>
                        <Controller
                            name='age'
                            control={control}
                            disabled={disabled}
                            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label='Idade'
                                    type='number'
                                    error={!!error}
                                    helperText={error?.message}
                                    required
                                    sx={{ width: !matches ? '50%' : '100%' }}
                                    inputProps={{ min: 0, onWheel: (e) => (e.target as HTMLElement).blur() }}
                                    onChange={(e) => {
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
                                    render={({ field, fieldState: { error } }) => (
                                        <>
                                            <Select
                                                {...field}
                                                label='Gênero *'
                                                error={!!error}
                                                required
                                                fullWidth
                                            >
                                                <MenuItem value='Masculino'>Masculino</MenuItem>
                                                <MenuItem value='Feminino'>Feminino</MenuItem>
                                                <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                                <MenuItem value='Outro'>Outro</MenuItem>
                                                <MenuItem value='Não definido'>Não definido</MenuItem>
                                            </Select>
                                            {error && (
                                                <FormHelperText error>{String(error.message)}</FormHelperText>
                                            )}
                                        </>
                                    )}
                                />
                            </FormControl>
                        )}
                    </Box>

                    {/* Gênero (mobile) */}
                    {matches && (
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel>Gênero</InputLabel>
                            <Controller
                                name='gender'
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Select
                                            {...field}
                                            label='Gênero *'
                                            error={!!error}
                                            required
                                            fullWidth
                                        >
                                            <MenuItem value='Masculino'>Masculino</MenuItem>
                                            <MenuItem value='Feminino'>Feminino</MenuItem>
                                            <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                            <MenuItem value='Outro'>Outro</MenuItem>
                                            <MenuItem value='Não definido'>Não definido</MenuItem>
                                        </Select>
                                        {error && (
                                            <FormHelperText error>{String(error.message)}</FormHelperText>
                                        )}
                                    </>
                                )}
                            />
                        </FormControl>
                    )}
                </Box>
            )}

            {/* Se não mostrar raças, mostrar idade e gênero na coluna esquerda */}
            {!showRaces && (
                <Box display='flex' flexDirection='column' gap={2} width='35%'>
                    <Box display='flex' gap={3}>
                        <Controller
                            name='age'
                            control={control}
                            disabled={disabled}
                            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label='Idade'
                                    type='number'
                                    error={!!error}
                                    helperText={error?.message}
                                    required
                                    sx={{ width: !matches ? '50%' : '100%' }}
                                    inputProps={{ min: 0, onWheel: (e) => (e.target as HTMLElement).blur() }}
                                    onChange={(e) => {
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
                                    render={({ field, fieldState: { error } }) => (
                                        <>
                                            <Select
                                                {...field}
                                                label='Gênero *'
                                                error={!!error}
                                                required
                                                fullWidth
                                            >
                                                <MenuItem value='Masculino'>Masculino</MenuItem>
                                                <MenuItem value='Feminino'>Feminino</MenuItem>
                                                <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                                <MenuItem value='Outro'>Outro</MenuItem>
                                                <MenuItem value='Não definido'>Não definido</MenuItem>
                                            </Select>
                                            {error && (
                                                <FormHelperText error>{String(error.message)}</FormHelperText>
                                            )}
                                        </>
                                    )}
                                />
                            </FormControl>
                        )}
                    </Box>

                    {matches && (
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel>Gênero</InputLabel>
                            <Controller
                                name='gender'
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Select
                                            {...field}
                                            label='Gênero *'
                                            error={!!error}
                                            required
                                            fullWidth
                                        >
                                            <MenuItem value='Masculino'>Masculino</MenuItem>
                                            <MenuItem value='Feminino'>Feminino</MenuItem>
                                            <MenuItem value='Não-binário'>Não-binário</MenuItem>
                                            <MenuItem value='Outro'>Outro</MenuItem>
                                            <MenuItem value='Não definido'>Não definido</MenuItem>
                                        </Select>
                                        {error && (
                                            <FormHelperText error>{String(error.message)}</FormHelperText>
                                        )}
                                    </>
                                )}
                            />
                        </FormControl>
                    )}
                </Box>
            )}
        </Box>
    );
}
