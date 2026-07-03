'use client'

import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    Grid,
    Paper,
    Chip
} from '@mui/material'
import type { RPGSystem, EnabledFields } from '@models/entities'

interface FieldsConfigTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

interface FieldOption {
    key: keyof Omit<EnabledFields, 'customFields'>
    label: string
    description: string
    icon: string
}

export function FieldsConfigTab({ system, updateSystem }: FieldsConfigTabProps) {
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

    const cn = {
        class: conceptNames.class || 'Classe',
        subclass: conceptNames.subclass || 'Subclasse',
        race: conceptNames.race || 'Raça',
        lineage: conceptNames.lineage || 'Linhagem',
        occupation: conceptNames.occupation || 'Profissão',
        trait: conceptNames.trait || 'Traço',
        spell: conceptNames.spell || 'Magia',
        skill: conceptNames.skill || 'Habilidade',
    }

    const fieldOptions: FieldOption[] = [
        {
            key: 'class',
            label: cn.class + 's',
            description: `Permite escolher uma ${cn.class.toLowerCase()} para o personagem`,
            icon: '⚔️'
        },
        {
            key: 'subclass',
            label: cn.subclass + 's',
            description: `Permite escolher uma ${cn.subclass.toLowerCase()}/especialização`,
            icon: '🎖️'
        },
        {
            key: 'race',
            label: cn.race + 's',
            description: `Permite escolher uma ${cn.race.toLowerCase()} para o personagem`,
            icon: '👥'
        },
        {
            key: 'lineage',
            label: cn.lineage + 's',
            description: `Permite escolher uma ${cn.lineage.toLowerCase()}/origem`,
            icon: '🏠'
        },
        {
            key: 'occupation',
            label: cn.occupation + 's',
            description: `Permite escolher uma ${cn.occupation.toLowerCase()}/ocupação`,
            icon: '💼'
        },
        {
            key: 'traits',
            label: cn.trait + 's',
            description: `Permite escolher ${cn.trait.toLowerCase()}s positivos e negativos`,
            icon: '✨'
        },
        {
            key: 'spells',
            label: cn.spell + 's',
            description: `Habilita o sistema de ${cn.spell.toLowerCase()}s`,
            icon: '🔮'
        },
        {
            key: 'elementalMastery',
            label: 'Maestria Elemental',
            description: 'Permite escolher uma maestria elemental',
            icon: '🔥'
        },
        {
            key: 'financialCondition',
            label: 'Condição Financeira',
            description: 'Inclui campo de condição financeira',
            icon: '💰'
        }
    ]

    const enabledFields = system.enabledFields || {
        traits: true,
        lineage: true,
        occupation: true,
        subclass: true,
        elementalMastery: true,
        financialCondition: true,
        spells: true,
        race: true,
        class: true,
        customFields: []
    }

    const handleToggle = (key: keyof Omit<EnabledFields, 'customFields'>) => {
        updateSystem('enabledFields', {
            ...enabledFields,
            [key]: !enabledFields[key]
        })
    }

    const enabledCount = Object.entries(enabledFields)
        .filter(([ key, value ]) => key !== 'customFields' && value === true)
        .length

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Campos da Ficha
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Escolha quais seções estarão disponíveis nas fichas de personagem deste sistema.
                    </Typography>
                </Box>
                <Chip 
                    label={`${enabledCount} seções ativas`} 
                    color="primary" 
                    variant="outlined" 
                />
            </Box>

            <Grid container spacing={2}>
                {fieldOptions.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                height: '100%',
                                border: enabledFields[field.key] ? '2px solid' : '1px solid',
                                borderColor: enabledFields[field.key] ? 'primary.main' : 'divider',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 2
                                }
                            }}
                            onClick={() => handleToggle(field.key)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="h5" component="span">
                                        {field.icon}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {field.label}
                                    </Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={enabledFields[field.key] || false}
                                            onChange={() => handleToggle(field.key)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    }
                                    label=""
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {field.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
