'use client'

import {
    Box,
    TextField,
    FormControlLabel,
    Switch,
    Typography,
    Divider,
    Grid,
    Chip,
    IconButton,
    Paper
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import type { RPGSystem } from '@models/entities'

interface GeneralSettingsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

export function GeneralSettingsTab({ system, updateSystem }: GeneralSettingsTabProps) {
    const [ newElement, setNewElement ] = useState('')

    const conceptNames = system.conceptNames || {
        lineage: 'Linhagem',
        occupation: 'Profissão',
        class: 'Classe',
        subclass: 'Subclasse',
        race: 'Raça',
        trait: 'Traço',
        spell: 'Magia',
        skill: 'Habilidade'
    }

    const elements = system.elements || ['Fogo', 'Água', 'Ar', 'Terra', 'Luz', 'Trevas', 'Arcano']

    const handleAddElement = () => {
        if (newElement.trim() && !elements.includes(newElement.trim())) {
            updateSystem('elements', [ ...elements, newElement.trim() ])
            setNewElement('')
        }
    }

    const handleRemoveElement = (element: string) => {
        updateSystem('elements', elements.filter(e => e !== element))
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Informações Básicas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure o nome, descrição e visibilidade do seu sistema de RPG.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        required
                        label="Nome do Sistema"
                        value={system.name || ''}
                        onChange={(e) => updateSystem('name', e.target.value)}
                        placeholder="Ex: Magitech RPG, D&D 5e Homebrew, etc."
                        helperText="Um nome único e descritivo para o seu sistema"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descrição"
                        value={system.description || ''}
                        onChange={(e) => updateSystem('description', e.target.value)}
                        placeholder="Descreva o seu sistema de RPG, seu tema, mecânicas principais, etc."
                        helperText="Uma descrição detalhada ajuda outros usuários a entenderem o sistema"
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={system.isPublic || false}
                                onChange={(e) => updateSystem('isPublic', e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body1">
                                    Sistema Público
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {system.isPublic 
                                        ? 'Outros usuários podem ver e usar este sistema em suas campanhas'
                                        : 'Apenas você pode ver e usar este sistema'
                                    }
                                </Typography>
                            </Box>
                        }
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Nomes dos Conceitos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Personalize os nomes dos conceitos do sistema (ex: &quot;Linhagem&quot; pode ser &quot;Ancestral&quot;, &quot;Origem&quot;, etc.)
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Linhagem'"
                        value={conceptNames.lineage}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, lineage: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Profissão'"
                        value={conceptNames.occupation}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, occupation: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Classe'"
                        value={conceptNames.class}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, class: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Subclasse'"
                        value={conceptNames.subclass}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, subclass: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Raça'"
                        value={conceptNames.race}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, race: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Traço'"
                        value={conceptNames.trait}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, trait: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Magia'"
                        value={conceptNames.spell}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, spell: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome para 'Habilidade'"
                        value={conceptNames.skill}
                        onChange={(e) => updateSystem('conceptNames', { ...conceptNames, skill: e.target.value })}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Elementos Mágicos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure os elementos disponíveis para magias no sistema.
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {elements.map((element) => (
                                <Chip
                                    key={element}
                                    label={element}
                                    onDelete={() => handleRemoveElement(element)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                placeholder="Novo elemento..."
                                value={newElement}
                                onChange={(e) => setNewElement(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddElement()}
                            />
                            <IconButton color="primary" onClick={handleAddElement}>
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
