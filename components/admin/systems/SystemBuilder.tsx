'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DownloadIcon from '@mui/icons-material/Download'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { RPGSystem, PointsConfig } from '@models/entities'
import { validateSystemForSave, type SystemWarning } from '@utils/systemValidation'
import { downloadSystemJson } from '@utils/systemExportImport'
import { invalidateCharsheetSystemCache } from '@hooks/useCharsheetSystem'

import { GeneralSettingsTab } from './tabs/GeneralSettingsTab'
import { InitialFieldsTab } from './tabs/InitialFieldsTab'
import { FieldsConfigTab } from './tabs/FieldsConfigTab'
import { AttributesTab } from './tabs/AttributesTab'
import { ExpertisesTab } from './tabs/ExpertisesTab'
import { ClassesTab } from './tabs/ClassesTab'
import { LineagesTab } from './tabs/LineagesTab'
import { OccupationsTab } from './tabs/OccupationsTab'
import { RacesTab } from './tabs/RacesTab'
import { TraitsTab } from './tabs/TraitsTab'
import { SpellsTab } from './tabs/SpellsTab'
import { SkillsTab } from './tabs/SkillsTab'
import { DiceRulesTab } from './tabs/DiceRulesTab'
import { ProgressionTab } from './tabs/ProgressionTab'
import { CustomResourcesTab } from './tabs/CustomResourcesTab'

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
        life: { enabled: true, label: 'Vida', required: true, defaultValue: 10, formula: '' },
        mana: { enabled: false, label: 'Mana', required: false, defaultValue: 10, formula: '' },
        armor: { enabled: false, label: 'Armadura', required: false, defaultValue: 0 },
        age: { enabled: true, label: 'Idade', required: true, min: 1, max: 999 },
        gender: {
            enabled: true,
            label: 'Gênero',
            required: true,
            options: [ 'Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido' ]
        },
        financialCondition: {
            enabled: false,
            label: 'Condição Financeira',
            required: false,
            options: [ 'Miserável', 'Pobre', 'Estável', 'Rico' ]
        },
        customInitialFields: []
    },
    // Todos desativados por padrão — o criador habilita apenas o que precisa
    enabledFields: {
        traits: false,
        lineage: false,
        occupation: false,
        subclass: false,
        elementalMastery: false,
        financialCondition: false,
        spells: false,
        race: false,
        class: false,
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
    elements: [ 'Fogo', 'Água', 'Ar', 'Terra', 'Luz', 'Trevas', 'Arcano' ],
    diceRules: {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        advantageSystem: '2d20_best'
    },
    pointsConfig: {
        hasLP: true,
        hasMP: false,
        hasAP: false,
        lpName: 'LP',
        mpName: 'MP',
        apName: 'AP',
        customPoints: []
    },
    maxLevel: 20,
    progressionTable: [],
    skillPointRules: {
        classSkillCost: 1,
        otherSkillCost: 1
    },
    customResources: [],
    symbolicResources: [],
    customItems: { weapons: [], armors: [], items: [] },
    currency: { enabled: true, name: 'Dinheiro' },
    // Limite de pontos por atributo baseado no nível (padrão: o próprio nível)
    attributeCapFormula: 'level'
})

interface SystemBuilderProps {
    /** Sistema completo (edição) ou parcial (seed de import/template) */
    initialData?: Partial<RPGSystem>
}

export function SystemBuilder({ initialData }: SystemBuilderProps) {
    const [ tabValue, setTabValue ] = useState<string>('general')
    // Merge com defaults garante campos novos em sistemas antigos/importados
    const [ system, setSystem ] = useState<Partial<RPGSystem>>(
        initialData ? { ...getDefaultSystem(), ...initialData } : getDefaultSystem()
    )
    const [ saving, setSaving ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    const [ pendingWarnings, setPendingWarnings ] = useState<SystemWarning[] | null>(null)
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const { data: session } = useSession()

    const isEditing = !!initialData?.id

    const updateSystem = <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => {
        setSystem(prev => ({ ...prev, [key]: value }))
    }

    const enabledFields = system.enabledFields
    const cn = {
        class:      system.conceptNames?.class      || 'Classe',
        subclass:   system.conceptNames?.subclass   || 'Subclasse',
        race:       system.conceptNames?.race       || 'Raça',
        lineage:    system.conceptNames?.lineage    || 'Linhagem',
        occupation: system.conceptNames?.occupation || 'Profissão',
        trait:      system.conceptNames?.trait      || 'Traço',
        spell:      system.conceptNames?.spell      || 'Magia',
        skill:      system.conceptNames?.skill      || 'Habilidade'
    }

    // Tabs condicionais: sempre visíveis + as que dependem de enabledFields
    interface TabDef { id: string; label: string; icon: string; visible: boolean }
    const allTabs: TabDef[] = [
        { id: 'general',       label: 'Geral',              icon: '⚙️',  visible: true },
        { id: 'initial_fields',label: 'Campos Iniciais',    icon: '📝',  visible: true },
        { id: 'fields_config', label: 'Campos da Ficha',    icon: '📋',  visible: true },
        { id: 'attributes',    label: 'Atributos',          icon: '💪',  visible: true },
        { id: 'expertises',    label: 'Perícias',           icon: '🎯',  visible: true },
        { id: 'classes',       label: cn.class + 's',       icon: '⚔️',  visible: !!enabledFields?.class },
        { id: 'lineages',      label: cn.lineage + 's',     icon: '🏠',  visible: !!enabledFields?.lineage },
        { id: 'occupations',   label: cn.occupation + 's',  icon: '💼',  visible: !!enabledFields?.occupation },
        { id: 'races',         label: cn.race + 's',        icon: '👥',  visible: !!enabledFields?.race },
        { id: 'traits',        label: cn.trait + 's',       icon: '✨',  visible: !!enabledFields?.traits },
        { id: 'spells',        label: cn.spell + 's',       icon: '🔮',  visible: !!enabledFields?.spells },
        { id: 'skills',        label: cn.skill + 's',       icon: '⚡',  visible: true },
        { id: 'dice',          label: 'Dados',              icon: '🎲',  visible: true },
        { id: 'progression',   label: 'Progressão',         icon: '📈',  visible: true },
        { id: 'resources',     label: 'Recursos',           icon: '🔋',  visible: true }
    ]

    const visibleTabs = allTabs.filter(t => t.visible)

    // Quando a tab atual fica invisível (campo desativado), volta para Geral
    useEffect(() => {
        if (!visibleTabs.find(t => t.id === tabValue)) {
            setTabValue('general')
        }
    }, [ visibleTabs.map(t => t.id).join(',') ])

    const doSave = async () => {
        setSaving(true)
        setError(null)

        try {
            const url = isEditing
                ? `/api/rpg-system/${initialData.id}`
                : '/api/rpg-system'

            const method = isEditing ? 'PUT' : 'POST'

            // Consolida pointsConfig a partir de initialFields (fonte única da verdade)
            const f = system.initialFields
            const pointsConfig: PointsConfig = {
                customPoints: system.pointsConfig?.customPoints ?? [],
                hasLP: !!f?.life?.enabled,
                lpName: f?.life?.label || 'LP',
                lpFormula: f?.life?.formula || undefined,
                hasMP: !!f?.mana?.enabled,
                mpName: f?.mana?.label || 'MP',
                mpFormula: f?.mana?.formula || undefined,
                hasAP: !!f?.armor?.enabled,
                apName: f?.armor?.label || 'AP',
                apFormula: f?.armor?.formula || undefined
            }

            const body = {
                ...system,
                pointsConfig,
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

            // Invalida o cache em memória do sistema para os hooks useCharsheetSystem
            if (isEditing && initialData?.id) {
                invalidateCharsheetSystemCache(initialData.id)
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

    const handleSave = async () => {
        if (!system.name?.trim()) {
            setError('O nome do sistema é obrigatório')
            setTabValue('general')
            return
        }

        const warnings = validateSystemForSave(system)
        if (warnings.length > 0) {
            setPendingWarnings(warnings)
            return
        }

        await doSave()
    }

    const handleExport = () => {
        downloadSystemJson(system)
    }

    const tabContent: Record<string, React.ReactNode> = {
        general:        <GeneralSettingsTab   system={system} updateSystem={updateSystem} />,
        initial_fields: <InitialFieldsTab     system={system} updateSystem={updateSystem} />,
        fields_config:  <FieldsConfigTab      system={system} updateSystem={updateSystem} />,
        attributes:     <AttributesTab        system={system} updateSystem={updateSystem} />,
        expertises:     <ExpertisesTab        system={system} updateSystem={updateSystem} />,
        classes:        <ClassesTab           system={system} updateSystem={updateSystem} />,
        lineages:       <LineagesTab          system={system} updateSystem={updateSystem} />,
        occupations:    <OccupationsTab       system={system} updateSystem={updateSystem} />,
        races:          <RacesTab             system={system} updateSystem={updateSystem} />,
        traits:         <TraitsTab            system={system} updateSystem={updateSystem} />,
        spells:         <SpellsTab            system={system} updateSystem={updateSystem} />,
        skills:         <SkillsTab            system={system} updateSystem={updateSystem} />,
        dice:           <DiceRulesTab         system={system} updateSystem={updateSystem} />,
        progression:    <ProgressionTab       system={system} updateSystem={updateSystem} />,
        resources:      <CustomResourcesTab   system={system} updateSystem={updateSystem} />
    }

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
                    {visibleTabs.map(tab => (
                        <Tab
                            key={tab.id}
                            value={tab.id}
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
                <Box sx={{ py: 1 }}>
                    {tabContent[tabValue]}
                </Box>
            </Paper>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    disabled={saving}
                >
                    Exportar JSON
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
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

            {/* Dialog de avisos de validação */}
            <Dialog open={!!pendingWarnings} onClose={() => setPendingWarnings(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    Avisos de Configuração
                </DialogTitle>
                <DialogContent>
                    <List dense>
                        {(pendingWarnings ?? []).map((warning, idx) => (
                            <ListItem
                                key={idx}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                                onClick={() => {
                                    setTabValue(warning.tabId)
                                    setPendingWarnings(null)
                                }}
                            >
                                <ListItemText primary={warning.message} secondary="Clique para ir à aba" />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingWarnings(null)}>Revisar</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={async () => {
                            setPendingWarnings(null)
                            await doSave()
                        }}
                    >
                        Salvar mesmo assim
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
