/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-case-declarations */

import { useCallback, useState, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTheme } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { toastDefault } from '@constants'
import { type Dice, type DiceConfig, type DiceEffect, type DiceEffectOperation, type DiceEffectType, type DiceEffectTarget, type RollResult, type Ficha } from '@types'

export function useCustomDices({ onClose }: { onClose?: () => void }) {
    const theme = useTheme()
    const { watch, setValue, getValues } = useFormContext<Ficha>()

    // Estados
    const [ editingDiceId, setEditingDiceId ] = useState<string | null>(null)
    const [ newDice, setNewDice ] = useState<Partial<Dice>>({
        name: '',
        dices: [ { faces: 20, quantity: 1 } ],
        modifiers: [],
        effects: [],
        color: theme.palette.primary.main
    })

    const [ variableValues, setVariableValues ] = useState<Record<number, number>>({})
    const [ showCreateForm, setShowCreateForm ] = useState(false)
    const [ rollResult, setRollResult ] = useState<RollResult | null>(null)

    // Dados e Perícias
    const dices = watch('dices') || []
    const expertises = useMemo(() => {
        const values = getValues()
        return Object.entries(values.expertises ?? {}).map(([ name, value ]) => ({
            name,
            value: value.value || 0
        }))
    }, [ getValues ])

    // Handlers para Configurações de Dados
    const handleAddDiceConfig = useCallback(() => {
        setNewDice(prev => ({
            ...prev,
            dices: [ ...(prev.dices ?? []), { faces: 20, quantity: 1 } ]
        }))
    }, [])

    const handleRemoveDiceConfig = useCallback((index: number) => {
        setNewDice(prev => ({
            ...prev,
            dices: prev.dices?.filter((_, i) => i !== index) || []
        }))
    }, [])

    const handleUpdateDiceConfig = useCallback((index: number, field: keyof DiceConfig, value: number) => {
        setNewDice(prev => ({
            ...prev,
            dices: prev.dices?.map((dice, i) => 
                i === index 
                    ? { ...dice, [field]: field === 'quantity' 
                        ? Math.max(1, Math.min(10, value))
                        : value }
                    : dice
            ) || []
        }))
    }, [])

    // Handlers para Modificadores
    const handleAddModifier = useCallback(() => {
        setNewDice(prev => ({
            ...prev,
            modifiers: [ ...(prev.modifiers || []), {} ]
        }))
    }, [])

    const handleRemoveModifier = useCallback((index: number) => {
        setNewDice(prev => ({
            ...prev,
            modifiers: prev.modifiers?.filter((_, i) => i !== index) || []
        }))
    }, [])

    const handleUpdateModifier = useCallback((index: number, field: string, value: any) => {
        setNewDice(prev => ({
            ...prev,
            modifiers: prev.modifiers?.map((mod, i) => 
                i === index ? { ...mod, [field]: value } : mod
            ) || []
        }))
    }, [])

    // Handlers para Efeitos
    const handleAddEffect = useCallback(() => {
        setNewDice(prev => ({
            ...prev,
            effects: [
                ...(prev.effects || []),
                {
                    operation: 'increase' as DiceEffectOperation,
                    type: 'result' as DiceEffectType,
                    target: 'lp' as DiceEffectTarget
                }
            ]
        }))
    }, [])

    const handleRemoveEffect = useCallback((index: number) => {
        setNewDice(prev => ({
            ...prev,
            effects: prev.effects?.filter((_, i) => i !== index)
        }))
    }, [])

    const handleUpdateEffect = useCallback((index: number, field: keyof DiceEffect, value: string | number) => {
        setNewDice(prev => {
            const effects = [ ...(prev.effects || []) ]
            effects[index] = {
                ...effects[index],
                [field]: value,
                ...(field === 'type' && {
                    value: undefined,
                    variableValue: undefined
                })
            }
            return { ...prev, effects }
        })
    }, [])

    // Handler para Editar Dado
    const handleEditDice = useCallback((dice: Dice) => {
        setNewDice({
            ...dice
        })
        setShowCreateForm(true)
        setEditingDiceId(dice.id || null)
    }, [ setNewDice, setShowCreateForm ])

    // Handler para Salvar Dado
    const handleSaveDice = useCallback(() => {
        if (!newDice.name) {
            enqueueSnackbar(
                'O dado precisa ter um nome!',
                toastDefault('diceNameRequired', 'warning')
            )
            return
        }
        
        const normalizedDice = {
            ...newDice,
            modifiers: newDice.modifiers || []
        }

        const currentDices = getValues('dices') || []
        let updatedDices: Dice[];

        if (editingDiceId) {
            // Edição de um dado existente
            updatedDices = currentDices.map(dice => 
                dice.id === editingDiceId ? {
                    ...normalizedDice as Dice,
                    id: editingDiceId,
                    updatedAt: new Date().toISOString()
                } : dice
            )
            
            enqueueSnackbar(
                'Dado personalizado atualizado com sucesso!',
                toastDefault('diceUpdated', 'success')
            )
            
            setEditingDiceId(null)
        } else {
            // Criação de um novo dado
            const newId = `dice_${new Date().getTime()}`
            const dice: Dice = {
                ...normalizedDice as Dice,
                id: newId,
                createdAt: new Date().toISOString()
            }

            updatedDices = [ ...currentDices, dice ]
            
            enqueueSnackbar(
                'Dado personalizado criado com sucesso!',
                toastDefault('diceCreated', 'success')
            )
        }

        setValue('dices', updatedDices, { shouldValidate: true })
        setShowCreateForm(false)
        if (onClose) onClose()
    }, [ newDice, getValues, setValue, onClose ])

    // Handler para Rolar Dado
    const handleRollDice = useCallback((dice: Dice) => {
        const rolls: number[] = []
        let total = 0
        let criticalHit = false
        const modifiersResult: Array<{ name: string; value: number }> = []

        // Rola cada configuração de dado
        dice.dices?.forEach(config => {
            for (let i = 0; i < config.quantity; i++) {
                const roll = Math.floor(Math.random() * config.faces) + 1
                rolls.push(roll)
                total += roll

                // Verifica crítico para cada rolagem
                if (roll === config.faces) {
                    const critChance = dice.modifiers?.reduce((acc, mod) => acc + (mod.critChance || 0), 0) || 0
                    if (Math.random() * 100 <= critChance) {
                        criticalHit = true
                    }
                }
            }
        })

        // Aplica os modificadores
        dice.modifiers?.forEach(mod => {
            // Se tiver atributo, usa o valor do atributo da ficha
            if (mod.attribute) {
                const attrValue = getValues(`attributes.${mod.attribute}`) || 0
                total += attrValue
                modifiersResult.push({ name: mod.attribute.toUpperCase(), value: attrValue })
            } 
            // Se tiver perícia, usa o valor da perícia da ficha
            else if (mod.expertise) {
                const expertiseName = mod.expertise
                
                const expValue = (getValues()?.expertises?.[expertiseName]?.value ) || 0
                total += expValue
                modifiersResult.push({ name: expertiseName, value: expValue })
            } 
            // Se não tiver atributo nem perícia mas tiver bônus, aplica o bônus
            else if (mod.bonus) {
                total += mod.bonus
                modifiersResult.push({ name: 'Bônus', value: mod.bonus })
            }
        })

        // Aplica os efeitos do dado
        if (dice.effects?.length) {
            for (const effect of dice.effects) {
                const { operation, type, target, value } = effect
                let effectValue: number

                switch (type) {
                case 'constant':
                    effectValue = value || 0
                    break
                case 'variable':
                    const effectIndex = dice.effects.indexOf(effect)
                    if (!variableValues[effectIndex]) {
                        enqueueSnackbar(
                            'Insira um valor para todos os efeitos variáveis!',
                            toastDefault('diceEffectError', 'error')
                        )
                        return
                    }
                    effectValue = variableValues[effectIndex]
                    break
                default: // 'result'
                    effectValue = total
                }

                // Atualiza o valor do atributo/munição na ficha
                const currentValue = target === 'ammo' 
                    ? getValues('ammoCounter.current') || 0
                    : getValues(`attributes.${target}`) || 0

                const newValue = operation === 'increase'
                    ? currentValue + effectValue
                    : currentValue - effectValue

                if (target === 'ammo') {
                    setValue('ammoCounter.current', newValue, { shouldValidate: true })
                } else {
                    setValue(`attributes.${target}`, newValue, { shouldValidate: true })
                }

                modifiersResult.push({ 
                    name: `${operation === 'increase' ? '+' : '-'} ${target.toUpperCase()}`, 
                    value: effectValue 
                })
            }
        }

        // Atualiza o histórico de rolagens
        const currentRolls = rollResult?.dice === dice ? rollResult.allRolls : []
        const newRolls = [ ...(currentRolls || []), ...rolls ]
        const rollCount = (rollResult?.dice === dice ? rollResult.rollCount : 0) + 1

        setRollResult({
            dice,
            rolls,
            total,
            modifiersResult,
            criticalHit,
            allRolls: newRolls,
            rollCount
        })

        // Atualiza lastRolled
        const updatedDices = dices.map(d => 
            d === dice ? { ...d, lastRolled: new Date().toISOString() } : d
        )
        setValue('dices', updatedDices, { shouldValidate: true })

    }, [ getValues, setValue, dices, rollResult, variableValues ])

    // Handler para Deletar Dado
    const handleDeleteDice = useCallback((diceToDelete: Dice) => {
        const currentDices = getValues('dices') || []
        const updatedDices = currentDices.filter(d => d.id !== diceToDelete.id)
        setValue('dices', updatedDices, { shouldValidate: true })
        enqueueSnackbar(
            'Dado removido com sucesso!',
            toastDefault('diceDeleted', 'success')
        )
    }, [ getValues, setValue ])

    return {
        newDice,
        setNewDice,
        variableValues,
        setVariableValues,
        showCreateForm,
        setShowCreateForm,
        rollResult,
        setRollResult,
        dices,
        expertises,
        handleAddDiceConfig,
        handleRemoveDiceConfig,
        handleUpdateDiceConfig,
        handleAddModifier,
        handleRemoveModifier,
        handleUpdateModifier,
        handleAddEffect,
        handleRemoveEffect,
        handleUpdateEffect,
        handleSaveDice,
        handleRollDice,
        handleDeleteDice,
        handleEditDice,
        editingDiceId,
        setEditingDiceId
    }
}