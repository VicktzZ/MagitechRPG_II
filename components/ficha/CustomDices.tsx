/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-case-declarations */

import { 
    Box, 
    Button, 
    FormControl, 
    IconButton, 
    InputLabel, 
    MenuItem, 
    Select, 
    TextField, 
    Tooltip, 
    Typography, 
    alpha, 
    useMediaQuery, 
    useTheme 
} from '@mui/material'
import {
    type DiceEffectOperation,
    type DiceEffectTarget,
    type DiceEffectType,
    type Attributes, 
    type ExpertisesNames
} from '@types'
import { type ReactElement } from 'react'
import Fade from '@mui/material/Fade'
import { useCustomDices } from '@hooks/useCustomDices'
import DiceRollModal from '../misc/DiceRollModal'
import { Add, Casino, Delete, Edit, Remove } from '@mui/icons-material'

interface DicePersonalizationProps {
    onClose?: () => void
    enableChatIntegration?: boolean
}

export default function CustomDices({ onClose, enableChatIntegration = true }: DicePersonalizationProps): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('sm'))

    const {
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
        handleDeleteDice,
        handleEditDice,
        editingDiceId,
        handleRollDice
    } = useCustomDices({ onClose, enableChatIntegration })

    const attributes: Attributes[] = [ 'des', 'vig', 'log', 'sab', 'foc', 'car' ]

    const handleCloseResult = () => {
        setRollResult(null)
    }

    return (
        <Box>
            {/* Lista de Dados */}
            <Box display="flex" flexDirection="column" gap={2} mb={4}>
                {dices.map((dice, index) => (
                    <Box
                        key={index}
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha(dice.color || theme.palette.primary.main, 0.1),
                            border: '1px solid',
                            borderColor: dice.color || theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(dice.color || theme.palette.primary.main, 0.2)}`
                            }
                        }}
                    >
                        <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {dice.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dice.dices.map((config, i) => (
                                    <span key={i}>
                                        {i > 0 ? ' + ' : ''}{config.quantity}d{config.faces}
                                    </span>
                                ))}
                                {dice.modifiers?.map((mod, i) => (
                                    <span key={i}>
                                        {mod.attribute ? ` + ${mod.attribute.toUpperCase()}` : ''}
                                        {mod.expertise ? ` + ${mod.expertise}` : ''}
                                        {mod.bonus ? ` + ${mod.bonus}` : ''}
                                    </span>
                                ))}
                                {dice.effects?.map((effect, i) => (
                                    <span key={i}>
                                        {' → '}
                                        {effect.operation === 'increase' ? '+' : '-'}
                                        {' '}
                                        {effect.type === 'constant' 
                                            ? effect.value 
                                            : effect.type === 'variable'
                                                ? '[valor]'
                                                : '[resultado]'
                                        }
                                        {' '}
                                        {effect.target.toUpperCase()}
                                    </span>
                                ))}
                            </Typography>
                            {dice.lastRolled && (
                                <Typography variant="caption" color="text.secondary">
                                    Última rolagem: {new Date(dice.lastRolled).toLocaleString()}
                                </Typography>
                            )}
                        </Box>
                        <Box display="flex" gap={1}>
                            <Tooltip title="Rolar dado">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRollDice(dice)}
                                    sx={{ 
                                        color: dice.color || theme.palette.primary.main,
                                        '&:hover': { bgcolor: alpha(dice.color || theme.palette.primary.main, 0.1) }
                                    }}
                                >
                                    <Casino fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar dado">
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditDice(dice)}
                                    sx={{ 
                                        color: theme.palette.info.main,
                                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                                    }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {dice.effects?.map((effect, i) => (
                                effect.type === 'variable' && (
                                    <TextField
                                        key={i}
                                        type="number"
                                        label={`Valor ${i + 1}`}
                                        size="small"
                                        sx={{ width: '100px' }}
                                        value={variableValues[i] ?? ''}
                                        onChange={(e) => setVariableValues(prev => ({
                                            ...prev,
                                            [i]: Math.max(1, Math.min(999, Number(e.target.value)))
                                        }))}
                                        inputProps={{ min: 1, max: 999 }}
                                    />
                                )
                            ))}
                            <Tooltip title="Remover dado">
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteDice(dice)}
                                    sx={{ 
                                        color: 'error.main',
                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                    }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ))}

                {dices.length === 0 && (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            border: '1px dashed',
                            borderColor: 'divider',
                            textAlign: 'center'
                        }}
                    >
                        <Typography color="text.secondary">
                            Nenhum dado personalizado criado ainda
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Modal de Resultado da Rolagem utilizando o componente versátil */}
            <DiceRollModal 
                open={!!rollResult}
                onClose={handleCloseResult}
                rollResult={rollResult || undefined}
            />

            {/* Botão para mostrar/esconder formulário de criação */}
            <Box display="flex" justifyContent="center" mb={showCreateForm ? 3 : 0}>
                <Button
                    variant={showCreateForm ? 'outlined' : 'contained'}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    startIcon={showCreateForm ? <Remove /> : <Add />}
                    size="small"
                >
                    {showCreateForm ? 'Cancelar' : 'Criar Novo Dado'}
                </Button>
            </Box>

            {/* Formulário de Criação */}
            {showCreateForm && (
                <Fade in>
                    <Box sx={{ p: matches ? 2 : 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {editingDiceId ? 'Editar Dado Personalizado' : 'Criar Dado Personalizado'}
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={2}>
                            {/* Nome e Descrição */}
                            <Box display="flex" gap={2} flexDirection={matches ? 'column' : 'row'}>
                                <TextField
                                    fullWidth
                                    label="Nome do Dado"
                                    value={newDice.name}
                                    onChange={(e) => setNewDice(prev => ({ ...prev, name: e.target.value }))}
                                    size="small"
                                />
                                <TextField
                                    fullWidth
                                    label="Descrição (opcional)"
                                    value={newDice.description}
                                    onChange={(e) => setNewDice(prev => ({ ...prev, description: e.target.value }))}
                                    size="small"
                                />
                            </Box>

                            {/* Configurações dos Dados */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Dados
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {newDice.dices?.map((diceConfig, index) => (
                                        <Box 
                                            key={index}
                                            display="flex"
                                            gap={2}
                                            flexDirection={matches ? 'column' : 'row'}
                                            alignItems={matches ? 'stretch' : 'center'}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>Faces</InputLabel>
                                                <Select
                                                    value={diceConfig.faces}
                                                    label="Faces"
                                                    onChange={(e) => handleUpdateDiceConfig(
                                                        index,
                                                        'faces',
                                                        e.target.value as number
                                                    )}
                                                >
                                                    {[ 4, 6, 8, 10, 12, 20, 100 ].map((faces) => (
                                                        <MenuItem key={faces} value={faces}>
                                                            d{faces}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            
                                            <TextField
                                                type="number"
                                                label="Quantidade"
                                                value={diceConfig.quantity}
                                                onChange={(e) => {
                                                    const value = Math.min(999, Math.max(1, parseInt(e.target.value) || 1));
                                                    handleUpdateDiceConfig(
                                                        index,
                                                        'quantity',
                                                        value
                                                    );
                                                }}
                                                size="small"
                                                inputProps={{ min: 1, max: 999 }}
                                            />

                                            {newDice.dices!.length > 1 && (
                                                <Tooltip title="Remover dado">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveDiceConfig(index)}
                                                        sx={{ 
                                                            color: 'error.main',
                                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                                <Box 
                                    sx={{ 
                                        p: 1.5,
                                        mt: 2,
                                        borderRadius: 1,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                    onClick={handleAddDiceConfig}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        <Add fontSize="small" sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2" color="primary">
                                            Adicionar Dado
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Modificadores */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Modificadores
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {newDice.modifiers?.map((modifier, index) => (
                                        <Box 
                                            key={index}
                                            display="flex"
                                            gap={2}
                                            flexDirection={matches ? 'column' : 'row'}
                                            alignItems={matches ? 'stretch' : 'center'}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                                                <InputLabel>Atributo</InputLabel>
                                                <Select
                                                    value={modifier.attribute || ''}
                                                    label="Atributo"
                                                    onChange={(e) => handleUpdateModifier(
                                                        index,
                                                        'attribute',
                                                        e.target.value as Attributes
                                                    )}
                                                >
                                                    <MenuItem value="">
                                                        <em>Nenhum</em>
                                                    </MenuItem>
                                                    {attributes.map((attr) => (
                                                        <MenuItem key={attr} value={attr}>
                                                            {attr.toUpperCase()}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                                                <InputLabel>Perícia</InputLabel>
                                                <Select
                                                    value={modifier.expertise || ''}
                                                    label="Perícia"
                                                    onChange={(e) => handleUpdateModifier(
                                                        index,
                                                        'expertise',
                                                        e.target.value as ExpertisesNames
                                                    )}
                                                >
                                                    <MenuItem value="">
                                                        <em>Nenhuma</em>
                                                    </MenuItem>
                                                    {expertises.map((exp) => (
                                                        <MenuItem key={exp.name} value={exp.name}>
                                                            {exp.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                type="number"
                                                label="Bônus"
                                                value={modifier.bonus || 0}
                                                onChange={(e) => handleUpdateModifier(
                                                    index,
                                                    'bonus',
                                                    Number(e.target.value)
                                                )}
                                                size="small"
                                                sx={{ width: matches ? '100%' : '100px', minWidth: 120 }}
                                            />

                                            <Tooltip title="Remover modificador">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveModifier(index)}
                                                    sx={{ 
                                                        color: 'error.main',
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                </Box>
                                <Box 
                                    sx={{ 
                                        p: 1.5,
                                        mt: 2,
                                        width: '100%',
                                        borderRadius: 1,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                    onClick={handleAddModifier}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        <Add fontSize="small" sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2" color="primary">
                                            Adicionar Modificador
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Efeitos */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Efeitos
                                </Typography>
                                {newDice.effects?.map((effect, index) => (
                                    <Box key={index} mb={2}>
                                        <Box 
                                            display="flex" 
                                            gap={2}
                                            flexDirection={matches ? 'column' : 'row'}
                                            alignItems={matches ? 'stretch' : 'center'}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                                                <InputLabel>Operação</InputLabel>
                                                <Select
                                                    value={effect.operation}
                                                    label="Operação"
                                                    onChange={(e) => handleUpdateEffect(
                                                        index,
                                                        'operation',
                                                        e.target.value as DiceEffectOperation
                                                    )}
                                                >
                                                    <MenuItem value="increase">Aumentar</MenuItem>
                                                    <MenuItem value="decrease">Diminuir</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                                                <InputLabel>Tipo</InputLabel>
                                                <Select
                                                    value={effect.type}
                                                    label="Tipo"
                                                    onChange={(e) => handleUpdateEffect(
                                                        index,
                                                        'type',
                                                        e.target.value as DiceEffectType
                                                    )}
                                                >
                                                    <MenuItem value="result">Resultado</MenuItem>
                                                    <MenuItem value="constant">Valor (constante)</MenuItem>
                                                    <MenuItem value="variable">Valor (variável)</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
                                                <InputLabel>Alvo</InputLabel>
                                                <Select
                                                    value={effect.target}
                                                    label="Alvo"
                                                    onChange={(e) => handleUpdateEffect(
                                                        index,
                                                        'target',
                                                        e.target.value as DiceEffectTarget
                                                    )}
                                                >
                                                    <MenuItem value="lp">LP</MenuItem>
                                                    <MenuItem value="mp">MP</MenuItem>
                                                    <MenuItem value="ap">AP</MenuItem>
                                                    <MenuItem value="ammo">Munição</MenuItem>
                                                </Select>
                                            </FormControl>

                                            {effect.type === 'constant' && (
                                                <TextField
                                                    type="number"
                                                    label="Valor"
                                                    value={effect.value ?? ''}
                                                    onChange={(e) => handleUpdateEffect(
                                                        index,
                                                        'value',
                                                        Math.max(1, Math.min(999, Number(e.target.value)))
                                                    )}
                                                    size="small"
                                                    sx={{ width: matches ? '100%' : 'auto' }}
                                                    inputProps={{ min: 1, max: 999 }}
                                                />
                                            )}

                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveEffect(index)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                                <Box 
                                    sx={{ 
                                        p: 1.5,
                                        borderRadius: 1,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                    onClick={handleAddEffect}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        <Add fontSize="small" sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2" color="primary">
                                            Adicionar Efeito
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Preview do Dado */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: alpha(newDice.color || theme.palette.primary.main, 0.1),
                                    border: '1px solid',
                                    borderColor: newDice.color || theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Casino sx={{ color: newDice.color || theme.palette.primary.main }} />
                                <Typography variant="body2">
                                    {newDice.dices?.map((dice, index) => (
                                        <span key={index}>
                                            {index > 0 ? ' + ' : ''}{dice.quantity}d{dice.faces}
                                        </span>
                                    ))}
                                    {newDice.modifiers?.map((mod, index) => (
                                        <span key={index}>
                                            {mod.attribute ? ` + ${mod.attribute.toUpperCase()}` : ''}
                                            {mod.expertise ? ` + ${mod.expertise}` : ''}
                                            {mod.bonus ? ` + ${mod.bonus}` : ''}
                                        </span>
                                    ))}
                                    {newDice.effects?.map((effect, index) => (
                                        <span key={index}>
                                            {' → '}
                                            {effect.operation === 'increase' ? '+' : '-'}
                                            {' '}
                                            {effect.type === 'constant' 
                                                ? effect.value 
                                                : effect.type === 'variable'
                                                    ? '[valor]'
                                                    : '[resultado]'
                                            }
                                            {' '}
                                            {effect.target.toUpperCase()}
                                        </span>
                                    ))}
                                </Typography>
                            </Box>

                            {/* Botões de Ação */}
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                {onClose && (
                                    <Button
                                        variant="outlined"
                                        onClick={onClose}
                                        size="small"
                                    >
                                        Cancelar
                                    </Button>
                                )}
                                {/* Cor */}
                                <TextField
                                    type="color"
                                    label="Cor"
                                    value={newDice.color}
                                    onChange={(e) => setNewDice(prev => ({ ...prev, color: e.target.value }))}
                                    size="small"
                                    sx={{ width: '100px' }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        if (newDice.name && newDice.dices && newDice.dices.length > 0) {
                                            handleSaveDice()
                                            /*
                                                {
                                                    ...newDice,
                                                    id: newDice.id || crypto.randomUUID(),
                                                    name: newDice.name,
                                                    dices: newDice.dices,
                                                    modifiers: newDice.modifiers || [],
                                                    effects: newDice.effects || [],
                                                    createdAt: newDice.createdAt || new Date().toISOString()
                                                } as Dice
                                            */
                                        }
                                    }}
                                    disabled={!newDice.name}
                                    startIcon={editingDiceId ? <Edit /> : <Add />}
                                >
                                    {editingDiceId ? 'Atualizar Dado' : 'Criar Dado'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            )}
        </Box>
    )
}