import { DiceRollModal } from '@components/misc'
import { subclasses } from '@constants/subclasses'
import { negativeTraits, positiveTraits } from '@constants/traits'
import { useAudio } from '@hooks'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { AttachMoney, AutoAwesome, DirectionsRun, Psychology } from '@mui/icons-material'
import { Box, Button, Chip, FormControl, InputLabel, ListSubheader, MenuItem, OutlinedInput, Select, TextField, Typography, useMediaQuery } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { green, orange, purple } from '@node_modules/@mui/material/colors'
import type { Classes, Element, Expertises, Ficha, Subclasses, Trait } from '@types'
import { useCallback, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import ElementalMasteryModal from './dialogs/ElementalMasteryModal'
import SubclassModal from './dialogs/SubclassModal'
import TraitsModal from './dialogs/TraitsModal'
import LevelProgress from './subcomponents/LevelProgress'
import { skills } from '@constants/skills'

export default function LevelAndInfo() {
    const { control, getValues, setValue , formState: { errors } } = useFormContext<Ficha>()
    const [ diceModalOpen, setDiceModalOpen ] = useState<boolean>(false)
    const [ traitsModalOpen, setTraitsModalOpen ] = useState<boolean>(false)
    const [ subclassModalOpen, setSubclassModalOpen ] = useState<boolean>(false)
    const [ elementalMasteryModalOpen, setElementalMasteryModalOpen ] = useState<boolean>(false)
    const [ selectedSubclass, setSelectedSubclass ] = useState<Subclasses | null>(null)
    const traitsRef = useRef<Trait[]>([])
    const audio = useAudio('/sounds/sci-fi-positive-notification.wav')
    const audio2 = useAudio('/sounds/fast-sci-fi-bleep.wav')
    
    const money = useWatch({ control, name: 'inventory.money' })
    const level = useWatch({ control, name: 'level' })
    const playerClass = useWatch({ control, name: 'class' })
    const currentSubclass = useWatch({ control, name: 'subclass' })
    const currentElementalMastery = useWatch({ control, name: 'elementalMastery' })
    const numberWithSpaces = useNumbersWithSpaces()
    const ficha = getValues()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    
    // Elementos disponíveis para maestria elemental
    const elementalOptions: Element[] = [
        'Fogo', 'Água', 'Terra', 'Ar', 'Eletricidade', 'Trevas', 'Luz', 'Não-elemental'
    ]
    
    // Função para obter subclasses baseada na classe atual
    const getAvailableSubclasses = useCallback((): Partial<Record<Subclasses, { description: string; }>> => {
        if (!playerClass) return {}
        const classKey = typeof playerClass === 'string' ? playerClass : playerClass.name
        return subclasses[classKey as Classes] || {}
    }, [ playerClass ])
    
    // Verifica se os campos podem ser editados (nível >= 10 e não salvos ainda)
    const canEditMasteryFields = level >= 10 && !ficha._id
    const isSubclassLocked = !!currentSubclass && !!ficha._id
    const isElementalMasteryLocked = !!currentElementalMastery && !!ficha._id
    
    const handleTraitsChange = useCallback((selectedTraitNames: string[]): void => {
        const currentExpertises = { ...getValues('expertises') };
        
        const previousTraits = [ ...traitsRef.current ];
        const newTraits: Trait[] = [];
        
        previousTraits.forEach(trait => {
            if (trait.target?.name && trait.value) {
                const expertiseName = trait.target.name as keyof Expertises;
                const currentValue = currentExpertises[expertiseName]?.value || 0;
                currentExpertises[expertiseName] = {
                    ...currentExpertises[expertiseName],
                    value: Math.max(0, currentValue - trait.value)
                } as any;
            }
        });

        selectedTraitNames.forEach(traitName => {
            const trait = [ ...positiveTraits, ...negativeTraits ].find(item => item.name === traitName);
            if (trait) {
                if (trait.target?.name && trait.value !== undefined) {
                    const expertiseName = trait.target.name as keyof Expertises;
                    const currentValue = currentExpertises[expertiseName]?.value || 0;
                    currentExpertises[expertiseName] = {
                        ...currentExpertises[expertiseName],
                        value: currentValue + trait.value
                    } as any;
                }
                newTraits.push(trait);
            }
        });
        
        traitsRef.current = newTraits;
        
        setValue('expertises', currentExpertises, { shouldValidate: true });
        setValue('traits', selectedTraitNames as unknown as Trait[], { shouldValidate: true });
        audio?.play()
    }, [ getValues, setValue, traitsRef ])
    
    // Handler para confirmar seleção de subclasse
    const handleSubclassConfirm = useCallback((subclass: Subclasses) => {
        if (subclass) {
            setValue('subclass', subclass, { shouldValidate: true, shouldDirty: true })
            setValue('skills.subclass', [ skills.subclass[subclass][0] ])
            setSelectedSubclass(null)
        }
        audio2?.play()
    }, [ selectedSubclass, setValue, audio2 ])

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
                                    amount={20}
                                    title='Nível de Personagem'
                                    level={field.value}
                                />
                            )}
                        />
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

                        {/* Dinheiro */}
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
                                    Dinheiro
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
                                                label={`${getValues('mode') === 'Classic' ? '¥' : '¢'} ${numberWithSpaces(money || 0)}`}
                                                size="small"
                                                sx={{ fontWeight: 'bold', minWidth: '80px' }}
                                            />
                                            {ficha._id && (
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
                                            onClick={() => !ficha._id && setTraitsModalOpen(true)}
                                            endAdornment={
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    disabled={!!ficha._id}
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
                                                cursor: ficha._id ? 'default' : 'pointer',
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

                        {/* Maestria Elemental - Só aparece a partir do nível 10 */}
                        {level >= 10 && (
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
                                    Especializações (Nível 10+)
                                </Typography>

                                {/* Maestria Elemental */}
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

                                {/* Subclasse */}
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
                                        {level < 10 && (
                                            <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                                Disponível a partir do nível 10
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
                            </>
                        )}

                        {/* Condição Financeira */}
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
                                        disabled={!!ficha._id}
                                        fullWidth
                                        error={!!errors.financialCondition}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            
                                            const moneyValue = {
                                                'Miserável': ficha.mode === 'Classic' ? 10_000 : 10,
                                                'Pobre': ficha.mode === 'Classic' ? 30_000 : 30,
                                                'Estável': ficha.mode === 'Classic' ? 100_000 : 100,
                                                'Rico': ficha.mode === 'Classic' ? 300_000 : 300
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

                        {/* Botão de Rolar Dados */}
                        {!ficha._id && (
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
                    bonus={[ ficha.mods.attributes.car ]}
                    isDisadvantage={ficha.mods.attributes.car === -1}
                    visibleDices
                    visibleBaseAttribute
                    roll={{
                        dice: 20,
                        quantity: ficha.mods.attributes.car || 1,
                        name: 'Condição Financeira',
                        attribute: 'car'
                    }}
                />
            )}

            {/* Modal de Seleção de Subclasse */}
            <SubclassModal
                open={subclassModalOpen}
                onClose={() => setSubclassModalOpen(false)}
                currentClass={playerClass as Classes}
                onConfirm={(subclass) => handleSubclassConfirm(subclass)}
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
