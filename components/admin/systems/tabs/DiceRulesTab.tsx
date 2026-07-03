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
    MenuItem
} from '@mui/material'
import type { RPGSystem, DiceRules } from '@models/entities'

interface DiceRulesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

export function DiceRulesTab({ system, updateSystem }: DiceRulesTabProps) {
    const diceRules: DiceRules = system.diceRules || {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        advantageSystem: '2d20_best'
    }

    const updateDiceRules = (updates: Partial<DiceRules>) => {
        updateSystem('diceRules', { ...diceRules, ...updates })
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Regras de Dados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure as regras de rolagem de dados do sistema.
            </Typography>

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
        </Box>
    )
}
