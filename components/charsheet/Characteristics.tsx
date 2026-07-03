'use client';

import { classesModel } from '@constants/classes';
import { lineageExpertises, occupationsExpertises, type ExpertisesOverrided } from '@constants/lineageExpertises';
import { lineageItems } from '@constants/lineageOccupationItems';
import { races } from '@constants/races';
import { skills } from '@constants/skills';
import { useAudio } from '@hooks';
import type { Race } from '@models';
import type { Charsheet, RPGSystem } from '@models/entities';
import type { ClassNames, LineageNames } from '@models/types/string';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme, type SelectChangeEvent } from '@mui/material';
import { NumberField } from '@components/misc';
import { blue, green, red, yellow } from '@mui/material/colors';
import { useCallback, useMemo, useState, useEffect, type ReactElement } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export default function Characteristics(): ReactElement {
    const { control, setValue, getValues } = useFormContext<Charsheet>()
    const charsheet = getValues()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const audio = useAudio('/sounds/cybernetic-technology-affirmation.wav')
    const disabled = !!charsheet.id
    
    // Estado para sistema customizado
    const [ customSystem, setCustomSystem ] = useState<RPGSystem | null>(null)
    const [ , setLoadingSystem ] = useState(false)
    
    // Carregar sistema se houver systemId
    useEffect(() => {
        if (charsheet.systemId) {
            setLoadingSystem(true)
            fetch(`/api/rpg-system/${charsheet.systemId}`)
                .then(async res => await res.json())
                .then((data: RPGSystem) => {
                    setCustomSystem(data)
                })
                .catch(err => {
                    console.error('Erro ao carregar sistema:', err)
                    setCustomSystem(null)
                })
                .finally(() => setLoadingSystem(false))
        } else {
            setCustomSystem(null)
        }
    }, [ charsheet.systemId ])
    
    const isCustomSystem = !!customSystem
    
    // Labels dinâmicos baseados no sistema
    const classLabel = customSystem?.conceptNames?.class || 'Classe de Mago'
    const lineageLabel = customSystem?.conceptNames?.lineage || (charsheet.mode === 'Classic' ? 'Linhagem' : 'Profissão')
    const raceLabel = customSystem?.conceptNames?.race || 'Raça'
    const occupationLabel = customSystem?.conceptNames?.occupation || 'Profissão'

    // Opções de gênero e visibilidade de campos iniciais (sistemas customizados)
    const genderOptions = (isCustomSystem && customSystem?.initialFields?.gender?.options?.length)
        ? customSystem.initialFields.gender.options
        : [ 'Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido' ]
    // Sistemas antigos sem initialFields: mostrar por padrão (?? true)
    const showAge = !isCustomSystem || (customSystem?.initialFields?.age?.enabled ?? true)
    const showGender = !isCustomSystem || (customSystem?.initialFields?.gender?.enabled ?? true)
    // Profissão é opt-in: só aparece se explicitamente habilitada
    const showOccupation = isCustomSystem && Boolean(customSystem?.enabledFields?.occupation)
    const customInitialFields = (isCustomSystem && customSystem?.initialFields?.customInitialFields) || []

    const setClass = (e: SelectChangeEvent<any>): void => {
        const previousClass = getValues('class') as ClassNames;
        const newClass = e.target.value as ClassNames;
        
        if (!isCustomSystem) {
            // Lógica padrão Magitech
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
            
            const customClass = customSystem?.classes?.find(c => c.name === newClass);
            if (customClass?.skills && customClass.skills.length > 0) {
                setValue('skills.class', [ customClass.skills[0] ] as any);
            } else {
                setValue('skills.class', []);
            }
        }
        
        audio.play();
    }

    const setLineage = (e: SelectChangeEvent<any>): void => {
        const previousLineage = getValues('lineage') as unknown as LineageNames;
        const selectedLineage = e.target.value;
        
        if (isCustomSystem) {
            // Sistema customizado - lógica simplificada
            setValue('lineage', selectedLineage, { shouldValidate: true });
            
            const customLineage = customSystem?.lineages?.find(l => l.name === selectedLineage);
            if (customLineage?.skills && customLineage.skills.length > 0) {
                setValue('skills.lineage', [ customLineage.skills[0] ] as any);
            } else {
                setValue('skills.lineage', []);
            }
            
            audio.play();
            return;
        }
        
        // Lógica padrão Magitech
        const isClassicMode = charsheet.mode === 'Classic';
        const antecedentSkills = isClassicMode ? skills.lineage : skills.occupation;
        const antecedentItems = lineageItems[selectedLineage as keyof typeof lineageItems]
        
        if (previousLineage) {
            const previousLineageBonus = isClassicMode 
                ? lineageExpertises[previousLineage as unknown as keyof typeof lineageExpertises] 
                : occupationsExpertises[previousLineage as unknown as keyof typeof occupationsExpertises];
            
            if (previousLineageBonus?.tests) {
                Object.entries(previousLineageBonus.tests).forEach(([ expertise, bonus ]) => {
                    const ex = expertise as keyof typeof charsheet.expertises
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
                const ex = expertise as keyof typeof charsheet.expertises
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
            setValue('mods.attributes.car', (charsheet.mods.attributes.car || 0) + 1);
        } else if (previousLineage === 'Artista') {
            setValue('mods.attributes.car', Math.max(0, (charsheet.mods.attributes.car || 0) - 1));
        }

        audio.play();
    }

    const setRace = (e: SelectChangeEvent<any>): void => {
        const selectedRace = e.target.value as Race['name'];
        setValue('race', selectedRace, { shouldValidate: true });
        
        if (!isCustomSystem) {
            // Lógica padrão Magitech
            setValue('skills.race', [ skills.race.find(skill => skill.origin === selectedRace)! ])
        } else {
            // Sistema customizado
            const customRace = customSystem?.races?.find(r => r.name === selectedRace);
            if (customRace?.skills && customRace.skills.length > 0) {
                setValue('skills.race', [ customRace.skills[0] ] as any);
            } else {
                setValue('skills.race', []);
            }
        }
        
        audio.play();
    }

    const setOccupation = (e: SelectChangeEvent<any>): void => {
        const previousOccupation = getValues('occupation');
        const selectedOccupation = e.target.value as string;

        // Reverte bônus da profissão anterior
        if (previousOccupation) {
            const prevOcc = customSystem?.occupations?.find(o => o.name === previousOccupation);
            if (prevOcc?.expertiseBonus) {
                Object.entries(prevOcc.expertiseBonus).forEach(([ expKey, bonus ]) => {
                    const current = (getValues(`expertises.${expKey}` as any) )?.value || 0;
                    setValue(`expertises.${expKey}.value` as any, Math.max(0, current - bonus));
                });
            }
            if (prevOcc?.startingMoney) {
                setValue('inventory.money', Math.max(0, getValues('inventory.money') - prevOcc.startingMoney));
            }
        }

        setValue('occupation', selectedOccupation, { shouldValidate: true });

        const customOccupation = customSystem?.occupations?.find(o => o.name === selectedOccupation);
        if (customOccupation?.skills && customOccupation.skills.length > 0) {
            setValue('skills.occupation' as any, [ customOccupation.skills[0] ] as any);
        } else {
            setValue('skills.occupation' as any, [] as any);
        }

        // Aplica bônus de perícias da profissão
        if (customOccupation?.expertiseBonus) {
            Object.entries(customOccupation.expertiseBonus).forEach(([ expKey, bonus ]) => {
                const currentExpertise = getValues(`expertises.${expKey}` as any) ;
                if (!currentExpertise) {
                    setValue(`expertises.${expKey}` as any, { value: bonus, defaultAttribute: null } as any);
                } else {
                    setValue(`expertises.${expKey}.value` as any, (currentExpertise.value || 0) + bonus);
                }
            });
        }

        // Dinheiro inicial
        if (customOccupation?.startingMoney) {
            setValue('inventory.money', getValues('inventory.money') + customOccupation.startingMoney);
        }

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
        if (isCustomSystem && customSystem?.lineages && customSystem.lineages.length > 0) {
            // Usar linhagens do sistema customizado
            return customSystem.lineages.map((lineage) => (
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
            ))
        }
        
        // Usar linhagens padrão Magitech
        return Object.entries(charsheet.mode === 'Classic' ? lineageExpertises : occupationsExpertises).map(([ lineage, expertises ]) => (
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
    }, [ charsheet.mode, isCustomSystem, customSystem, lineagePoints ])

    const classes = useMemo(() => {
        if (isCustomSystem && customSystem?.classes && customSystem.classes.length > 0) {
            // Usar classes do sistema customizado
            return customSystem.classes.map(classe => (
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
            ))
        }
        
        // Usar classes padrão Magitech
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
        ))
    }, [ isCustomSystem, customSystem ])

    return (
        <Box display='flex' gap={3} width='100%'>
            {/* Coluna esquerda */}
            <Box display='flex' flexDirection='column' gap={2} width='65%'>
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
                                        setClass(e)
                                        field.onChange((e as SelectChangeEvent<any>).target.value)
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

                    {!matches && (!isCustomSystem || customSystem?.enabledFields?.lineage) && (
                        <Controller
                            name='lineage'
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl sx={{ width: '50%' }} error={!!error} disabled={disabled}>
                                    <InputLabel>{lineageLabel} *</InputLabel>
                                    <Select
                                        {...field}
                                        label={`${lineageLabel} *`}
                                        required
                                        fullWidth
                                        onChange={(e) => {
                                            setLineage(e)
                                            field.onChange((e as SelectChangeEvent<any>).target.value)
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
                {matches && (!isCustomSystem || customSystem?.enabledFields?.lineage) && (
                    <Controller
                        name='lineage'
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <FormControl sx={{ width: '100%' }} error={!!error} disabled={disabled}>
                                <InputLabel>{charsheet.mode === 'Classic' ? 'Linhagem' : 'Profissão'} *</InputLabel>
                                <Select
                                    {...field}
                                    label='Linhagem'
                                    required
                                    fullWidth
                                    onChange={(e) => {
                                        setLineage(e)
                                        field.onChange((e as SelectChangeEvent<any>).target.value)
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

                {/* Profissão/Ocupação (sistemas customizados) */}
                {showOccupation && (
                    <Controller
                        name='occupation'
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <FormControl fullWidth error={!!error} disabled={disabled}>
                                <InputLabel>{occupationLabel}</InputLabel>
                                <Select
                                    {...field}
                                    value={field.value || ''}
                                    label={occupationLabel}
                                    fullWidth
                                    onChange={(e) => {
                                        setOccupation(e)
                                        field.onChange((e as SelectChangeEvent<any>).target.value)
                                    }}
                                    MenuProps={{ sx: { maxHeight: '60vh' } }}
                                    renderValue={value => (
                                        <Typography>{value }</Typography>
                                    )}
                                >
                                    {(customSystem?.occupations || []).map(occ => (
                                        <MenuItem key={occ.key} value={occ.name}>
                                            <Box>
                                                <Typography>{occ.name}</Typography>
                                                {occ.description && (
                                                    <Typography variant='caption' color='text.secondary'>
                                                        {occ.description}
                                                    </Typography>
                                                )}
                                                {(occ.startingMoney ?? 0) > 0 && (
                                                    <Typography variant='caption' color={green[500]} display='block'>
                                                        +{occ.startingMoney} de dinheiro inicial
                                                    </Typography>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))}
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
            <Box display='flex' flexDirection='column' gap={2} width='35%'>
                {/* Raça */}
                {(!isCustomSystem || customSystem?.enabledFields?.race) && (
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
                                        setRace(e)
                                        field.onChange((e as SelectChangeEvent<any>).target.value)
                                    }}
                                >
                                    {(isCustomSystem && customSystem?.races && customSystem.races.length > 0) ? (
                                        customSystem.races.map(race => (
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
                                        ))
                                    ) : (
                                        Object.entries(races).map(([ raceName, raceData ]) => (
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
                                        ))
                                    )}
                                </Select>
                                {error && (
                                    <FormHelperText error>{String(error.message)}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />
                )}

                {/* Idade e Gênero (desktop) */}
                {(showAge || showGender) && (
                    <Box display='flex' gap={3}>
                        {showAge && (
                            <Controller
                                name='age'
                                control={control}
                                disabled={disabled}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <NumberField
                                        value={value || 0}
                                        onChange={onChange}
                                        min={customSystem?.initialFields?.age?.min ?? 0}
                                        max={customSystem?.initialFields?.age?.max}
                                        label={customSystem?.initialFields?.age?.label || 'Idade'}
                                        error={!!error}
                                        helperText={error?.message}
                                        required
                                        disabled={disabled}
                                        sx={{ width: (!matches && showGender) ? '50%' : '100%' }}
                                    />
                                )}
                            />
                        )}

                        {!matches && showGender && (
                            <FormControl sx={{ width: showAge ? '50%' : '100%' }}>
                                <InputLabel>{customSystem?.initialFields?.gender?.label || 'Gênero'} *</InputLabel>
                                <Controller
                                    name='gender'
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <>
                                            <Select
                                                {...field}
                                                label={`${customSystem?.initialFields?.gender?.label || 'Gênero'} *`}
                                                error={!!error}
                                                required
                                                fullWidth
                                            >
                                                {genderOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
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

                {/* Gênero (mobile) */}
                {matches && showGender && (
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>{customSystem?.initialFields?.gender?.label || 'Gênero'}</InputLabel>
                        <Controller
                            name='gender'
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <>
                                    <Select
                                        {...field}
                                        label={`${customSystem?.initialFields?.gender?.label || 'Gênero'} *`}
                                        error={!!error}
                                        required
                                        fullWidth
                                    >
                                        {genderOptions.map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                    {error && (
                                        <FormHelperText error>{String(error.message)}</FormHelperText>
                                    )}
                                </>
                            )}
                        />
                    </FormControl>
                )}

                {/* Campos iniciais customizados do sistema (ex: Altura, Peso) */}
                {customInitialFields.map(fieldDef => (
                    <Controller
                        key={fieldDef.key}
                        name={`customFields.${fieldDef.key}` as any}
                        control={control}
                        render={({ field: { onChange, value, ...field }, fieldState: { error } }) => {
                            if (fieldDef.type === 'select') {
                                return (
                                    <FormControl fullWidth error={!!error} disabled={disabled}>
                                        <InputLabel>{fieldDef.label}{fieldDef.required ? ' *' : ''}</InputLabel>
                                        <Select
                                            {...field}
                                            value={(value as string) ?? ''}
                                            label={`${fieldDef.label}${fieldDef.required ? ' *' : ''}`}
                                            onChange={(e) => onChange(e.target.value)}
                                            fullWidth
                                        >
                                            {(fieldDef.options || []).map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                        {error && <FormHelperText error>{String(error.message)}</FormHelperText>}
                                    </FormControl>
                                )
                            }
                            if (fieldDef.type === 'boolean') {
                                return (
                                    <FormControl fullWidth error={!!error} disabled={disabled}>
                                        <InputLabel>{fieldDef.label}</InputLabel>
                                        <Select
                                            {...field}
                                            value={value === true ? 'true' : value === false ? 'false' : ''}
                                            label={fieldDef.label}
                                            onChange={(e) => onChange(e.target.value === 'true')}
                                            fullWidth
                                        >
                                            <MenuItem value='true'>Sim</MenuItem>
                                            <MenuItem value='false'>Não</MenuItem>
                                        </Select>
                                    </FormControl>
                                )
                            }
                            if (fieldDef.type === 'number') {
                                return (
                                    <NumberField
                                        value={(value as number) || 0}
                                        onChange={onChange}
                                        min={fieldDef.min}
                                        max={fieldDef.max}
                                        allowDecimal
                                        label={fieldDef.label}
                                        required={fieldDef.required}
                                        disabled={disabled}
                                        error={!!error}
                                        helperText={error?.message}
                                        fullWidth
                                    />
                                )
                            }
                            return (
                                <TextField
                                    {...field}
                                    value={(value as string) ?? ''}
                                    label={fieldDef.label}
                                    required={fieldDef.required}
                                    disabled={disabled}
                                    error={!!error}
                                    helperText={error?.message}
                                    fullWidth
                                    onChange={(e) => onChange(e.target.value)}
                                />
                            )
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
}