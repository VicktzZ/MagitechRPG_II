'use client'

import { useState } from 'react'
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Alert
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { RPGSystem } from '@models/entities'

import { GeneralSettingsTab } from './tabs/GeneralSettingsTab'
import { InitialFieldsTab } from './tabs/InitialFieldsTab'
import { FieldsConfigTab } from './tabs/FieldsConfigTab'
import { AttributesTab } from './tabs/AttributesTab'
import { ExpertisesTab } from './tabs/ExpertisesTab'
import { ClassesTab } from './tabs/ClassesTab'
import { LineagesTab } from './tabs/LineagesTab'
import { RacesTab } from './tabs/RacesTab'
import { TraitsTab } from './tabs/TraitsTab'
import { SpellsTab } from './tabs/SpellsTab'
import { SkillsTab } from './tabs/SkillsTab'
import { DiceRulesTab } from './tabs/DiceRulesTab'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`system-tabpanel-${index}`}
            aria-labelledby={`system-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    )
}

const getDefaultSystem = (): Partial<RPGSystem> => ({
    name: '',
    description: '',
    isPublic: false,
    conceptNames: {
        lineage: 'Linhagem',
        occupation: 'Profissão',
        class: 'Classe',
        subclass: 'Subclasse',
        race: 'Raça',
        trait: 'Traço',
        spell: 'Magia',
        skill: 'Habilidade'
    },
    initialFields: {
        life: { enabled: true, label: 'Vida', required: true, defaultValue: 10, formula: 'VIG * 2 + 10' },
        mana: { enabled: true, label: 'Mana', required: true, defaultValue: 10, formula: 'FOC * 2 + 10' },
        armor: { enabled: true, label: 'Armadura', required: false, defaultValue: 0 },
        age: { enabled: true, label: 'Idade', required: true, min: 1, max: 999 },
        gender: { 
            enabled: true, 
            label: 'Gênero', 
            required: true, 
            options: ['Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido'] 
        },
        financialCondition: { 
            enabled: true, 
            label: 'Condição Financeira', 
            required: false, 
            options: ['Miserável', 'Pobre', 'Estável', 'Rico'] 
        },
        customInitialFields: []
    },
    enabledFields: {
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
    },
    attributes: [],
    expertises: [],
    classes: [],
    subclasses: [],
    races: [],
    lineages: [],
    occupations: [],
    traits: {
        positive: [],
        negative: []
    },
    spells: [],
    skills: [],
    elements: ['Fogo', 'Água', 'Ar', 'Terra', 'Luz', 'Trevas', 'Arcano'],
    diceRules: {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        advantageSystem: '2d20_best'
    },
    pointsConfig: {
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'LP',
        mpName: 'MP',
        apName: 'AP',
        customPoints: []
    }
})

interface SystemBuilderProps {
    initialData?: RPGSystem
}

export function SystemBuilder({ initialData }: SystemBuilderProps) {
    const [ tabValue, setTabValue ] = useState(0)
    const [ system, setSystem ] = useState<Partial<RPGSystem>>(initialData || getDefaultSystem())
    const [ saving, setSaving ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const { data: session } = useSession()

    const isEditing = !!initialData?.id

    const updateSystem = <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => {
        setSystem(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        if (!system.name?.trim()) {
            setError('O nome do sistema é obrigatório')
            setTabValue(0)
            return
        }

        setSaving(true)
        setError(null)

        try {
            const url = isEditing 
                ? `/api/rpg-system/${initialData.id}` 
                : '/api/rpg-system'
            
            const method = isEditing ? 'PUT' : 'POST'

            const body = {
                ...system,
                creatorId: session?.user?.id
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao salvar sistema')
            }

            enqueueSnackbar(
                isEditing ? 'Sistema atualizado com sucesso!' : 'Sistema criado com sucesso!', 
                { variant: 'success' }
            )
            
            router.push('/admin/systems')
        } catch (err: any) {
            setError(err.message)
            enqueueSnackbar(err.message, { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { label: 'Geral', icon: '⚙️' },
        { label: 'Campos Iniciais', icon: '📝' },
        { label: 'Campos da Ficha', icon: '📋' },
        { label: 'Atributos', icon: '💪' },
        { label: 'Perícias', icon: '🎯' },
        { label: 'Classes', icon: '⚔️' },
        { label: system.conceptNames?.lineage || 'Linhagens', icon: '🏠' },
        { label: 'Raças', icon: '👥' },
        { label: 'Traços', icon: '✨' },
        { label: 'Magias', icon: '🔮' },
        { label: 'Habilidades', icon: '⚡' },
        { label: 'Dados', icon: '🎲' }
    ]

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <TabPanel value={tabValue} index={0}>
                    <GeneralSettingsTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <InitialFieldsTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <FieldsConfigTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <AttributesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    <ExpertisesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                    <ClassesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={6}>
                    <LineagesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={7}>
                    <RacesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={8}>
                    <TraitsTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={9}>
                    <SpellsTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={10}>
                    <SkillsTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={11}>
                    <DiceRulesTab 
                        system={system} 
                        updateSystem={updateSystem} 
                    />
                </TabPanel>
            </Paper>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => router.push('/admin/systems')}
                    disabled={saving}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {isEditing ? 'Salvar Alterações' : 'Criar Sistema'}
                </Button>
            </Box>
        </Box>
    )
}
