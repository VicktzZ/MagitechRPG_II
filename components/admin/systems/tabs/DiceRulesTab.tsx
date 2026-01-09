'use client'

import {
    Box,
    Typography,
    TextField,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Chip,
    IconButton,
    Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import type { RPGSystem, DiceRules, PointsConfig } from '@models/entities'

interface DiceRulesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

export function DiceRulesTab({ system, updateSystem }: DiceRulesTabProps) {
    const [ newPointName, setNewPointName ] = useState('')
    const [ newPointAbbr, setNewPointAbbr ] = useState('')

    const diceRules: DiceRules = system.diceRules || {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        advantageSystem: '2d20_best'
    }

    const pointsConfig: PointsConfig = system.pointsConfig || {
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'LP',
        mpName: 'MP',
        apName: 'AP',
        customPoints: []
    }

    const updateDiceRules = (updates: Partial<DiceRules>) => {
        updateSystem('diceRules', { ...diceRules, ...updates })
    }

    const updatePointsConfig = (updates: Partial<PointsConfig>) => {
        updateSystem('pointsConfig', { ...pointsConfig, ...updates })
    }

    const handleAddCustomPoint = () => {
        if (!newPointName.trim() || !newPointAbbr.trim()) return

        const newCustomPoint = {
            key: newPointName.toLowerCase().replace(/\s/g, '_'),
            name: newPointName,
            abbreviation: newPointAbbr.toUpperCase()
        }

        updatePointsConfig({
            customPoints: [ ...(pointsConfig.customPoints || []), newCustomPoint ]
        })
        setNewPointName('')
        setNewPointAbbr('')
    }

    const handleRemoveCustomPoint = (key: string) => {
        updatePointsConfig({
            customPoints: (pointsConfig.customPoints || []).filter(p => p.key !== key)
        })
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Regras de Dados e Pontos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure as regras de rolagem de dados e tipos de pontos do sistema.
            </Typography>

            <Grid container spacing={3}>
                {/* Regras de Dados */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            🎲 Regras de Dados
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Dado Padrão"
                                    value={diceRules.defaultDice}
                                    onChange={(e) => updateDiceRules({ defaultDice: e.target.value })}
                                    placeholder="Ex: 1d20, 2d6"
                                    helperText="Dado usado na maioria das rolagens"
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Acerto Crítico"
                                    value={diceRules.criticalRange}
                                    onChange={(e) => updateDiceRules({ criticalRange: parseInt(e.target.value) || 20 })}
                                    helperText="Valor mínimo para crítico"
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Falha Crítica"
                                    value={diceRules.fumbleRange}
                                    onChange={(e) => updateDiceRules({ fumbleRange: parseInt(e.target.value) || 1 })}
                                    helperText="Valor máximo para falha"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Sistema de Vantagem</InputLabel>
                                    <Select
                                        value={diceRules.advantageSystem || 'none'}
                                        label="Sistema de Vantagem"
                                        onChange={(e) => updateDiceRules({ advantageSystem: e.target.value as any })}
                                    >
                                        <MenuItem value="none">Nenhum</MenuItem>
                                        <MenuItem value="2d20_best">2d20 (Melhor resultado)</MenuItem>
                                        <MenuItem value="reroll">Rerolagem</MenuItem>
                                        <MenuItem value="bonus">Bônus fixo</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {diceRules.advantageSystem === 'bonus' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Bônus de Vantagem"
                                        value={diceRules.advantageBonus || 2}
                                        onChange={(e) => updateDiceRules({ advantageBonus: parseInt(e.target.value) || 2 })}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Regras Customizadas"
                                    value={diceRules.customRules || ''}
                                    onChange={(e) => updateDiceRules({ customRules: e.target.value })}
                                    placeholder="Descreva regras especiais de rolagem..."
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Configuração de Pontos Padrão */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            💫 Tipos de Pontos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Configure os tipos de pontos disponíveis (Vida, Mana, etc.)
                        </Typography>

                        <Grid container spacing={2}>
                            {/* LP (Vida) */}
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2">❤️ Pontos de Vida</Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={pointsConfig.hasLP}
                                                    onChange={(e) => updatePointsConfig({ hasLP: e.target.checked })}
                                                />
                                            }
                                            label=""
                                        />
                                    </Box>
                                    {pointsConfig.hasLP && (
                                        <>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Nome"
                                                value={pointsConfig.lpName || 'LP'}
                                                onChange={(e) => updatePointsConfig({ lpName: e.target.value })}
                                                sx={{ mb: 1 }}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Fórmula"
                                                value={pointsConfig.lpFormula || ''}
                                                onChange={(e) => updatePointsConfig({ lpFormula: e.target.value })}
                                                placeholder="Ex: VIG * 2 + 10"
                                            />
                                        </>
                                    )}
                                </Paper>
                            </Grid>

                            {/* MP (Mana) */}
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2">💧 Pontos de Mana</Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={pointsConfig.hasMP}
                                                    onChange={(e) => updatePointsConfig({ hasMP: e.target.checked })}
                                                />
                                            }
                                            label=""
                                        />
                                    </Box>
                                    {pointsConfig.hasMP && (
                                        <>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Nome"
                                                value={pointsConfig.mpName || 'MP'}
                                                onChange={(e) => updatePointsConfig({ mpName: e.target.value })}
                                                sx={{ mb: 1 }}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Fórmula"
                                                value={pointsConfig.mpFormula || ''}
                                                onChange={(e) => updatePointsConfig({ mpFormula: e.target.value })}
                                                placeholder="Ex: FOC * 2 + 10"
                                            />
                                        </>
                                    )}
                                </Paper>
                            </Grid>

                            {/* AP (Armadura) */}
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2">🛡️ Pontos de Armadura</Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={pointsConfig.hasAP}
                                                    onChange={(e) => updatePointsConfig({ hasAP: e.target.checked })}
                                                />
                                            }
                                            label=""
                                        />
                                    </Box>
                                    {pointsConfig.hasAP && (
                                        <>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Nome"
                                                value={pointsConfig.apName || 'AP'}
                                                onChange={(e) => updatePointsConfig({ apName: e.target.value })}
                                                sx={{ mb: 1 }}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Fórmula"
                                                value={pointsConfig.apFormula || ''}
                                                onChange={(e) => updatePointsConfig({ apFormula: e.target.value })}
                                                placeholder="Ex: 10"
                                            />
                                        </>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Pontos Customizados */}
                        <Typography variant="subtitle2" gutterBottom>
                            Pontos Customizados
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {(pointsConfig.customPoints || []).map((point) => (
                                <Chip
                                    key={point.key}
                                    label={`${point.abbreviation} - ${point.name}`}
                                    onDelete={() => handleRemoveCustomPoint(point.key)}
                                />
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            <TextField
                                size="small"
                                label="Nome"
                                value={newPointName}
                                onChange={(e) => setNewPointName(e.target.value)}
                                placeholder="Ex: Sanidade"
                            />
                            <TextField
                                size="small"
                                label="Abreviação"
                                value={newPointAbbr}
                                onChange={(e) => setNewPointAbbr(e.target.value)}
                                placeholder="Ex: SAN"
                                inputProps={{ maxLength: 5 }}
                                sx={{ width: 100 }}
                            />
                            <IconButton 
                                color="primary"
                                onClick={handleAddCustomPoint}
                                disabled={!newPointName.trim() || !newPointAbbr.trim()}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
