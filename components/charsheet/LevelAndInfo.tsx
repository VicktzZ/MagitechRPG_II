import { DiceRollModal } from '@components/misc'
import { subclasses } from '@constants/subclasses'
import { negativeTraits, positiveTraits } from '@constants/traits'
import { useAudio } from '@hooks'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { AttachMoney, AutoAwesome, DirectionsRun, Psychology } from '@mui/icons-material'
import { Box, Button, Chip, FormControl, IconButton, InputLabel, ListSubheader, MenuItem, OutlinedInput, Select, TextField, Typography, useMediaQuery } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { green, orange, purple } from '@mui/material/colors'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import ElementalMasteryModal from './dialogs/ElementalMasteryModal'
import SubclassModal from './dialogs/SubclassModal'
import TraitsModal from './dialogs/TraitsModal'
import LevelProgress from './subcomponents/LevelProgress'
import { skills } from '@constants/skills'
import type { CharsheetDTO } from '@models/dtos'
import type { Class, Expertises, Lineage, Subclass, Trait } from '@models'
import { type Element } from '@models/types/string'
import type { RPGSystem } from '@models/entities'

export default function LevelAndInfo() {
    const { control, getValues, setValue , formState: { errors } } = useFormContext<CharsheetDTO>()
    const [ diceModalOpen, setDiceModalOpen ] = useState<boolean>(false)
    const [ traitsModalOpen, setTraitsModalOpen ] = useState<boolean>(false)
    const [ subclassModalOpen, setSubclassModalOpen ] = useState<boolean>(false)
    const [ elementalMasteryModalOpen, setElementalMasteryModalOpen ] = useState<boolean>(false)
    const [ selectedSubclass, setSelectedSubclass ] = useState<Subclass['name'] | null>(null)
    const [ customSystem, setCustomSystem ] = useState<RPGSystem | null>(null)
    const traitsRef = useRef<Trait[]>([])
    const audio = useAudio('/sounds/sci-fi-positive-notification.wav')
    const audio2 = useAudio('/sounds/fast-sci-fi-bleep.wav')
    
    const money = useWatch({ control, name: 'inventory.money' })
    const level = useWatch({ control, name: 'level' })
    const playerClass = useWatch({ control, name: 'class' })
    const currentSubclass = useWatch({ control, name: 'subclass' })
    const currentElementalMastery = useWatch({ control, name: 'elementalMastery' })
    const numberWithSpaces = useNumbersWithSpaces()
    const charsheet = getValues()

    useEffect(() => {
        if (charsheet.systemId) {
            fetch(`/api/rpg-system/${charsheet.systemId}`)
                .then(async res => await res.json())
                .then((data: RPGSystem) => setCustomSystem(data))
                .catch(() => setCustomSystem(null))
        } else {
            setCustomSystem(null)
        }
    }, [ charsheet.systemId ])

    const isCustomSystem = !!customSystem

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    
    // Elementos disponíveis para maestria elemental
    const elementalOptions: Element[] = [
        'Fogo', 'Água', 'Terra', 'Ar', 'Eletricidade', 'Trevas', 'Luz', 'Não-elemental'
    ]
    
    // Função para obter subclasses baseada na classe atual
    const getAvailableSubclasses = useCallback((): Partial<Record<Subclass['name'], { description: string; }>> => {
        if (!playerClass) return {}
        const classKey = typeof playerClass === 'string' ? playerClass : playerClass.name

        // Sistema customizado: subclasses do sistema, filtradas pela classe da ficha
        // (parentClass pode referenciar a key OU o name da classe)
        if (isCustomSystem && customSystem?.subclasses && customSystem.subclasses.length > 0) {
            const customClass = customSystem.classes?.find(c => c.name === classKey || c.key === classKey)
            const filtered = customSystem.subclasses.filter(sub =>
                sub.parentClass === classKey ||
                (customClass && (sub.parentClass === customClass.key || sub.parentClass === customClass.name))
            )
            const result: Record<string, { description: string }> = {}
            filtered.forEach(sub => {
                result[sub.name] = { description: sub.description || '' }
            })
            return result as Partial<Record<Subclass['name'], { description: string }>>
        }

        return subclasses[classKey as Class['name']] || {}
    }, [ playerClass, isCustomSystem, customSystem ])
    
    // Nível de desbloqueio das especializações: customizado usa unlockLevel das subclasses do sistema
    const specializationUnlockLevel = (() => {
        if (isCustomSystem && customSystem?.subclasses && customSystem.subclasses.length > 0) {
            const levels = customSystem.subclasses.map(s => s.unlockLevel ?? 10)
            return Math.min(...levels)
        }
        return 10
    })()

    // Sistemas antigos sem o campo: mostrar por padrão (?? true)
    const showSubclassSection = !isCustomSystem || (customSystem?.enabledFields?.subclass ?? true)

    // Verifica se os campos podem ser editados (nível de desbloqueio atingido e não salvos ainda)
    const canEditMasteryFields = level >= specializationUnlockLevel && !charsheet.id
    const isSubclassLocked = !!currentSubclass && !!charsheet.id
    const isElementalMasteryLocked = !!currentElementalMastery && !!charsheet.id
    
    // Pool de traços: do sistema customizado quando existir, senão os do Magitech
    const availableTraits = useCallback((): { positive: Trait[]; negative: Trait[] } => {
        if (isCustomSystem && customSystem?.traits) {
            return {
                positive: (customSystem.traits.positive ?? []) as unknown as Trait[],
                negative: (customSystem.traits.negative ?? []) as unknown as Trait[]
            };
        }
        return { positive: positiveTraits, negative: negativeTraits };
    }, [ isCustomSystem, customSystem ]);

    const handleTraitsChange = useCallback((selectedTraitNames: string[]): void => {
        const currentExpertises = { ...getValues('expertises') };
        const traitPool = availableTraits();

        const previousTraits = [ ...traitsRef.current ];
        const newTraits: Trait[] = [];

        previousTraits.forEach(trait => {
            if (trait.target?.name && trait.value) {
                const expertiseName = trait.target.name as keyof Expertises;
                const currentValue = currentExpertises[expertiseName]?.value || 0;
                currentExpertises[expertiseName] = {
                    ...currentExpertises[expertiseName],
                    value: Math.max(0, currentValue - trait.value)
                } ;
            }
        });

        selectedTraitNames.forEach(traitName => {
            const trait = [ ...traitPool.positive, ...traitPool.negative ].find(item => item.name === traitName);
            if (trait) {
                if (trait.target?.name && trait.value !== undefined) {
                    const expertiseName = trait.target.name as keyof Expertises;
                    const currentValue = currentExpertises[expertiseName]?.value || 0;
                    currentExpertises[expertiseName] = {
                        ...currentExpertises[expertiseName],
                        value: currentValue + trait.value
                    } ;
                }
                newTraits.push(trait);
            }
        });
        
        traitsRef.current = newTraits;
        
        setValue('expertises', currentExpertises, { shouldValidate: true });
        setValue('traits', selectedTraitNames as unknown as Trait[], { shouldValidate: true });
        audio?.play()
    }, [ getValues, setValue, traitsRef, availableTraits ])
    
    // Handler para confirmar seleção de subclasse
    const handleSubclassConfirm = useCallback((subclass: Subclass['name']) => {
        if (subclass) {
            setValue('subclass', subclass, { shouldValidate: true, shouldDirty: true })

            if (isCustomSystem) {
                // Sistema customizado: habilidades vêm do sistema, não das constants
                const customSubclass = customSystem?.subclasses?.find(s => s.name === subclass)
                if (customSubclass?.skills && customSubclass.skills.length > 0) {
                    setValue('skills.subclass', [ customSubclass.skills[0] ] as any)
                } else {
                    setValue('skills.subclass', [])
                }
            } else {
                setValue('skills.subclass', [ skills.subclass[subclass][0] ])
            }
            setSelectedSubclass(null)
        }
        audio2?.play()
    }, [ selectedSubclass, setValue, audio2, isCustomSystem, customSystem ])

    return (
        <Box display='flex' flexDirection={matches ? 'column' : 'row'} gap={matches ? 2 : 3}>
            {/* Seção de Níveis e Informações */}
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    p: 0,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.paper3',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ p: matches ? 1 : 2, pb: 0 }}>
                    <Typography variant={matches ? 'subtitle1' : 'h6'} fontWeight="bold" color="primary" mb={2}>
                        Níveis e Informações
                    </Typography>
                </Box>

                <Box display='flex' flexDirection='column' gap={2.5} p={matches ? 2 : 3} pt={2}>
                    {/* Níveis */}
                    <Box display='flex' flexDirection='column' gap={2}>
                        <Controller
                            name='level'
                            control={control}
                            render={({ field }) => (
                                <LevelProgress
                                    amount={customSystem?.maxLevel ?? 20}
                                    title='Nível de Personagem'
                                    level={field.value}
                                />
                            )}
                        />
                        {/* ORM é conceito do Magitech — oculto em sistemas customizados */}
                        {!isCustomSystem && (
                            <Controller
                                name='ORMLevel'
                                control={control}
                                render={({ field }) => (
                                    <LevelProgress
                                        barWidth={matches ? '4rem' : '6rem'}
                                        amount={4}
                                        title='Nível de ORM'
                                        level={field.value}
                                    />
                                )}
                            />
                        )}
                    </Box>

                    {/* Informações Gerais */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mt: 1
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight="500"
                            sx={{
                                color: theme.palette.text.secondary,
                                borderBottom: '1px dashed',
                                borderColor: alpha(theme.palette.divider, 0.5),
                                pb: 0.5
                            }}
                        >
                            Informações Gerais
                        </Typography>

                        {/* Deslocamento */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap',
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                borderRadius: 2,
                                p: 1.5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.2),
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    borderColor: alpha(theme.palette.primary.main, 0.2)
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main
                                }}
                            >
                                <DirectionsRun />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Deslocamento
                                </Typography>
                                <Controller
                                    name='displacement'
                                    control={control}
                                    render={({ field }) => (
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                            {field.value}m
                                        </Typography>
                                    )}
                                />
                            </Box>
                        </Box>

                        {/* Dinheiro — ocultável e renomeável em sistemas customizados */}
                        {(!isCustomSystem || customSystem?.currency?.enabled !== false) && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                    borderRadius: 2,
                                    p: 1.5,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.2),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                        borderColor: alpha(green[500], 0.3)
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: alpha(green[500], 0.1),
                                        color: green[500]
                                    }}
                                >
                                    <AttachMoney />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {(isCustomSystem && customSystem?.currency?.name) || 'Dinheiro'}
                                    </Typography>
                                    <Controller
                                        name='inventory.money'
                                        control={control}
                                        rules={{
                                            required: 'O valor é obrigatório',
                                            min: { value: 0, message: 'O valor não pode ser negativo' },
                                            validate: {
                                                isNumber: (value) => !isNaN(Number(value)) || 'Deve ser um número válido'
                                            }
                                        }}
                                        render={({ field: { onChange , ...field }, fieldState: { error } }) => (
                                            <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                                                <Chip
                                                    color={error ? 'error' : 'success'}
                                                    label={`${isCustomSystem
                                                        ? (customSystem?.currency?.abbreviation ?? '')
                                                        : (getValues('mode') === 'Classic' ? '¥' : '¢')
                                                    } ${numberWithSpaces(money || 0)}`.trim()}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', minWidth: '80px' }}
                                                />
                                                {charsheet.id && (
                                                    <TextField
                                                        {...field}
                                                        value={money}
                                                        onChange={(e) => {
                                                            const numValue = parseInt(e.target.value, 10) || 0;
                                                            setValue('inventory.money', numValue);
                                                            onChange(numValue);
                                                        }}
                                                        type='number'
                                                        size='small'
                                                        variant='outlined'
                                                        placeholder='Digite o valor'
                                                        error={!!error}
                                                        helperText={error?.message}
                                                        inputProps={{
                                                            min: 0,
                                                            onWheel: (e) => (e.target as HTMLElement).blur()
                                                        }}
                                                        sx={{ width: matches ? '120px' : '140px' }}
                                                    />
                                                )}
                                            </Box>
                                        )}
                                    />
                                </Box>
                            </Box>
                        )}

                        {/* Recursos simbólicos do sistema (ex: Pedras do Nexus) */}
                        {isCustomSystem && (customSystem?.symbolicResources ?? []).map(resource => (
                            <Box
                                key={resource.key}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                    borderRadius: 2,
                                    p: 1.5,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.2),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                        borderColor: alpha(purple[500], 0.3)
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: alpha(purple[500], 0.1),
                                        color: purple[500]
                                    }}
                                >
                                    <AutoAwesome />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {resource.name}
                                        {resource.abbreviation ? ` (${resource.abbreviation})` : ''}
                                    </Typography>
                                    <Controller
                                        name={`customResources.${resource.key}` as any}
                                        control={control}
                                        defaultValue={resource.defaultValue ?? 0}
                                        render={({ field: { onChange, value } }) => {
                                            const current = Number(value ?? resource.defaultValue ?? 0);
                                            return (
                                                <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onChange(Math.max(0, current - 1))}
                                                        sx={{ width: 26, height: 26 }}
                                                    >
                                                        <Typography fontWeight="bold">−</Typography>
                                                    </IconButton>
                                                    <Chip
                                                        color="secondary"
                                                        label={numberWithSpaces(current)}
                                                        size="small"
                                                        sx={{ fontWeight: 'bold', minWidth: '60px' }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onChange(current + 1)}
                                                        sx={{ width: 26, height: 26 }}
                                                    >
                                                        <Typography fontWeight="bold">+</Typography>
                                                    </IconButton>
                                                </Box>
                                            );
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Seção de Traços e Condição Financeira */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        p: matches ? 1 : 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper3',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant={matches ? 'subtitle1' : 'h6'} fontWeight="bold" color="primary" mb={2}>
                        Outras informações
                    </Typography>

                    <Box display='flex' flexDirection='column' gap={2}>
                        {/* Traços */}
                        <FormControl fullWidth size={matches ? 'small' : 'medium'}>
                            <InputLabel>Traços *</InputLabel>
                            <Controller
                                name='traits'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <OutlinedInput
                                            label="Traços"
                                            readOnly
                                            value={Array.isArray(field.value) && field.value.length > 0 ?
                                                field.value.map((t: any) => typeof t === 'object' ? t.name : t).join(', ') :
                                                'Nenhum traço selecionado'}
                                            onClick={() => !charsheet.id && setTraitsModalOpen(true)}
                                            endAdornment={
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    disabled={!!charsheet.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTraitsModalOpen(true);
                                                    }}
                                                    sx={{ height: '80%', mr: 0.5 }}
                                                >
                                                    Selecionar
                                                </Button>
                                            }
                                            sx={{
                                                cursor: charsheet.id ? 'default' : 'pointer',
                                                '.MuiOutlinedInput-input': {
                                                    paddingLeft: 1
                                                }
                                            }}
                                            error={!!errors.traits}
                                        />

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            {Array.isArray(field.value) && field.value.map((value: any) => {
                                                // Extrair o nome do traço (pode ser uma string ou um objeto com name)
                                                const traitName = typeof value === 'object' ? value.name : value;

                                                const traitData = [ ...positiveTraits, ...negativeTraits ].find(
                                                    t => t.name === traitName
                                                );
                                                const isPositive = traitData ? traitData.value > 0 : false;

                                                return (
                                                    <Chip
                                                        key={traitName}
                                                        label={traitName}
                                                        size="small"
                                                        color={isPositive ? 'success' : 'error'}
                                                        sx={{
                                                            fontWeight: 'medium',
                                                            '& .MuiChip-label': {
                                                                px: 1
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}

                                            {/* Modal de seleção de traços */}
                                            <TraitsModal
                                                open={traitsModalOpen}
                                                onClose={() => setTraitsModalOpen(false)}
                                                selectedTraits={Array.isArray(field.value) ? field.value.map((t: any) => typeof t === 'object' ? t.name : t) : []}
                                                onTraitsChange={(newTraits) => {
                                                    handleTraitsChange(newTraits);
                                                    audio.play()
                                                }}
                                                lineage={charsheet.lineage as unknown as Lineage['name']}
                                                customTraits={isCustomSystem ? availableTraits() : undefined}
                                            />
                                        </Box>
                                    </>
                                )}
                            />
                            {errors.traits && (
                                <Typography color='error' variant='caption' display='block' mt={0.5}>
                                    {errors.traits.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* Especializações - aparecem a partir do nível de desbloqueio do sistema */}
                        {level >= specializationUnlockLevel && (
                            <>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="500"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        borderBottom: '1px dashed',
                                        borderColor: alpha(theme.palette.divider, 0.5),
                                        pb: 0.5,
                                        mt: 2
                                    }}
                                >
                                    Especializações (Nível {specializationUnlockLevel}+)
                                </Typography>

                                {/* Maestria Elemental */}
                                {(!isCustomSystem || customSystem?.enabledFields?.elementalMastery) && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            flexWrap: 'wrap',
                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                            borderRadius: 2,
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.2),
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                borderColor: alpha(purple[500], 0.3)
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: alpha(purple[500], 0.1),
                                                color: purple[500]
                                            }}
                                        >
                                            <AutoAwesome />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                            Maestria Elemental
                                            </Typography>
                                            <Controller
                                                name='elementalMastery'
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth size="small" disabled={!(isElementalMasteryLocked || !canEditMasteryFields)}>
                                                        <Select
                                                            {...field}
                                                            displayEmpty
                                                            value={field.value || ''}
                                                            onChange={() => {
                                                            // Ao clicar no select, abre o modal de seleção de maestria elemental
                                                                setElementalMasteryModalOpen(true)
                                                            }}
                                                            sx={{
                                                                '& .MuiSelect-select': {
                                                                    py: 0.5,
                                                                    fontSize: '0.875rem'
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                <em>Selecione um elemento</em>
                                                            </MenuItem>
                                                            {elementalOptions.map((element) => (
                                                                <MenuItem key={element} value={element}>
                                                                    {element}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />
                                            {level < 10 && (
                                                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                                Disponível a partir do nível 10
                                                </Typography>
                                            )}
                                            {isElementalMasteryLocked && (
                                                <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
                                                🔒 Maestria não pode ser alterada
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {/* Subclasse */}
                                {showSubclassSection && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            flexWrap: 'wrap',
                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                            borderRadius: 2,
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.2),
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                borderColor: alpha(orange[500], 0.3)
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: alpha(orange[500], 0.1),
                                                color: orange[500]
                                            }}
                                        >
                                            <Psychology />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                            Subclasse
                                            </Typography>
                                            <Controller
                                                name='subclass'
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth size="small" disabled={!(isSubclassLocked || !canEditMasteryFields)}>
                                                        <Select
                                                            {...field}
                                                            displayEmpty
                                                            value={typeof field.value === 'string' ? field.value : field.value?.name || ''}
                                                            onChange={() => {
                                                            // Ao clicar no select, abre o modal de seleção de subclasse
                                                                setSubclassModalOpen(true)
                                                            }}
                                                            sx={{
                                                                '& .MuiSelect-select': {
                                                                    py: 0.5,
                                                                    fontSize: '0.875rem'
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                <em>Selecione uma subclasse</em>
                                                            </MenuItem>
                                                            {Object.entries(getAvailableSubclasses()).map(([ name ]) => (
                                                                <MenuItem key={name} value={name}>
                                                                    {name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />
                                            {level < specializationUnlockLevel && (
                                                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                                Disponível a partir do nível {specializationUnlockLevel}
                                                </Typography>
                                            )}
                                            {isSubclassLocked && (
                                                <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
                                                🔒 Subclasse não pode ser alterada
                                                </Typography>
                                            )}
                                            {currentSubclass && (
                                                <Chip
                                                    label={typeof currentSubclass === 'string' ? currentSubclass : currentSubclass.name}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ mt: 0.5, fontWeight: 'bold' }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </>
                        )}

                        {/* Condição Financeira */}
                        {(!isCustomSystem || customSystem?.enabledFields?.financialCondition) && (
                            <FormControl fullWidth size={matches ? 'small' : 'medium'}>
                                <InputLabel>Condição financeira *</InputLabel>
                                <Controller
                                    name='financialCondition'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label='Condição financeira'
                                            required
                                            disabled={!!charsheet.id}
                                            fullWidth
                                            error={!!errors.financialCondition}
                                            onChange={(e) => {
                                                field.onChange(e)
                                            
                                                const moneyValue = {
                                                    'Miserável': charsheet.mode === 'Classic' ? 10_000 : 10,
                                                    'Pobre': charsheet.mode === 'Classic' ? 30_000 : 30,
                                                    'Estável': charsheet.mode === 'Classic' ? 100_000 : 100,
                                                    'Rico': charsheet.mode === 'Classic' ? 300_000 : 300
                                                }
                                            
                                                const selectedCondition = e.target.value as keyof typeof moneyValue
                                                if (moneyValue[selectedCondition]) {
                                                    setValue('inventory.money', moneyValue[selectedCondition])
                                                }

                                                audio.play()
                                            }}
                                        >
                                            <ListSubheader>{'< 6'}</ListSubheader>
                                            <MenuItem value='Miserável'>Miserável</MenuItem>
                                            <ListSubheader>6 - 12</ListSubheader>
                                            <MenuItem value='Pobre'>Pobre</MenuItem>
                                            <ListSubheader>12 - 17</ListSubheader>
                                            <MenuItem value='Estável'>Estável</MenuItem>
                                            <ListSubheader>{'> 17'}</ListSubheader>
                                            <MenuItem value='Rico'>Rico</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.financialCondition && (
                                    <Typography color='error' variant='caption' display='block' mt={0.5}>
                                        {errors.financialCondition.message}
                                    </Typography>
                                )}
                            </FormControl>
                        )}

                        {/* Botão de Rolar Dados — some quando condição financeira desabilitada no sistema */}
                        {!charsheet.id && (!isCustomSystem || customSystem?.enabledFields?.financialCondition) && (
                            <Button
                                onClick={() => { setDiceModalOpen(true) }}
                                variant='outlined'
                                color="primary"
                                fullWidth
                                size={matches ? 'small' : 'medium'}
                                sx={{
                                    mt: 1,
                                    fontWeight: 'bold',
                                    fontSize: matches ? '0.75rem' : '0.875rem',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                🎲 Rolar Dados da Condição Financeira
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Modal de Dados */}
            {diceModalOpen && (
                <DiceRollModal
                    open={diceModalOpen}
                    onClose={() => { setDiceModalOpen(false) }}
                    bonus={[ charsheet.mods.attributes.car ]}
                    isDisadvantage={charsheet.mods.attributes.car === -1}
                    visibleDices
                    visibleBaseAttribute
                    roll={{
                        dice: 20,
                        quantity: charsheet.mods.attributes.car || 1,
                        name: 'Condição Financeira',
                        attribute: 'car'
                    }}
                />
            )}

            {/* Modal de Seleção de Subclasse */}
            <SubclassModal
                open={subclassModalOpen}
                onClose={() => setSubclassModalOpen(false)}
                currentClass={playerClass as Class['name']}
                onConfirm={(subclass) => handleSubclassConfirm(subclass)}
                customSubclasses={isCustomSystem ? (() => {
                    const classKey = typeof playerClass === 'string' ? playerClass : (playerClass as any)?.name
                    const customClass = customSystem?.classes?.find(c => c.name === classKey || c.key === classKey)
                    return customSystem?.subclasses?.filter(sub =>
                        sub.parentClass === classKey ||
                        (customClass && (sub.parentClass === customClass.key || sub.parentClass === customClass.name))
                    ) || []
                })() : undefined}
            />

            {/* Modal de Maestria Elemental */}
            <ElementalMasteryModal
                open={elementalMasteryModalOpen}
                onClose={() => {
                    setElementalMasteryModalOpen(false)
                }}
                onElementSelect={(element) => {
                    setValue('elementalMastery', element, { shouldValidate: true, shouldDirty: true })
                    audio2.play()
                    setElementalMasteryModalOpen(false)
                }}
            />
        </Box>
    )
}
