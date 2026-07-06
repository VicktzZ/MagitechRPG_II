'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { NumberField } from '@components/misc'
import type { RPGSystem, SkillPointRules, SystemProgressionLevel } from '@models/entities'

interface ProgressionTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyLevel = (level: number): SystemProgressionLevel => ({
    level,
    label: '',
    hpBonus: 0,
    skillPoints: 0,
    attributePoints: 0,
    unlocksClassAbility: false,
    customResourceBonuses: {},
    fieldBonuses: {},
    customLabel: ''
})

/** Garante que a tabela tem exactamente `maxLevel` linhas, preservando edições. */
function syncTable(
    table: SystemProgressionLevel[],
    maxLevel: number
): SystemProgressionLevel[] {
    const result: SystemProgressionLevel[] = []
    for (let i = 1; i <= maxLevel; i++) {
        result.push(table.find(r => r.level === i) ?? emptyLevel(i))
    }
    return result
}

export function ProgressionTab({ system, updateSystem }: ProgressionTabProps) {
    const maxLevel = system.maxLevel ?? 20
    const progressionTable = system.progressionTable ?? []
    const skillPointRules: SkillPointRules = system.skillPointRules ?? {
        classSkillCost: 1,
        otherSkillCost: 1
    }
    const customResources = system.customResources ?? []

    const [ detailsOpen, setDetailsOpen ] = useState(false)
    const [ detailsData, setDetailsData ] = useState<SystemProgressionLevel | null>(null)

    const table = syncTable(progressionTable, maxLevel)

    const handleMaxLevelChange = (raw: string) => {
        const value = Math.max(1, Math.min(100, parseInt(raw) || 1))
        updateSystem('maxLevel', value)
        updateSystem('progressionTable', syncTable(progressionTable, value))
    }

    const updateRow = (level: number, changes: Partial<SystemProgressionLevel>) => {
        const updated = table.map(r => r.level === level ? { ...r, ...changes } : r)
        updateSystem('progressionTable', updated)
    }

    const openDetails = (row: SystemProgressionLevel) => {
        setDetailsData({
            ...row,
            customResourceBonuses: { ...(row.customResourceBonuses ?? {}) },
            fieldBonuses: { ...(row.fieldBonuses ?? {}) }
        })
        setDetailsOpen(true)
    }

    const saveDetails = () => {
        if (detailsData) updateRow(detailsData.level, detailsData)
        setDetailsOpen(false)
        setDetailsData(null)
    }

    const hasResources = customResources.length > 0

    // Campos de bônus genéricos disponíveis com base na configuração do sistema
    const fieldBonusOptions: Array<{ key: string; label: string }> = []
    if (system.pointsConfig?.hasMP !== false) {
        fieldBonusOptions.push({ key: 'mp', label: `${system.pointsConfig?.mpName || 'Mana'} (máx)` })
    }
    if (system.pointsConfig?.hasAP !== false) {
        fieldBonusOptions.push({ key: 'ap', label: `${system.pointsConfig?.apName || 'Armadura'} (máx)` })
    }
    if (system.enabledFields?.spells !== false) {
        fieldBonusOptions.push({ key: 'magicPoints', label: 'Pontos de Magia' })
        fieldBonusOptions.push({ key: 'spellSpaces', label: 'Espaços de Magia' })
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Progressão de Nível</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure o nível máximo, o custo de pontos de perícia e as recompensas de cada nível do sistema.
            </Typography>

            {/* ── Nível máximo e inicial ── */}
            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Nível Máximo"
                        value={maxLevel}
                        onChange={e => handleMaxLevelChange(e.target.value)}
                        inputProps={{ min: 1, max: 100 }}
                        helperText="Entre 1 e 100"
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <NumberField
                        fullWidth
                        label="Nível Inicial"
                        min={0}
                        max={maxLevel}
                        value={system.startingLevel ?? 0}
                        onChange={(v) => updateSystem('startingLevel', v > 0 ? v : undefined)}
                        helperText="Nível de fichas recém-criadas (padrão: 0)"
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ── Regras de pontos de perícia ── */}
            <Typography variant="h6" gutterBottom>Regras de Pontos de Perícia</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Custo em pontos para evoluir cada rank de perícia, e o limite máximo de ranks por perícia.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Custo — Perícias de Classe"
                        value={skillPointRules.classSkillCost}
                        onChange={e => updateSystem('skillPointRules', {
                            ...skillPointRules,
                            classSkillCost: Math.max(1, parseInt(e.target.value) || 1)
                        })}
                        inputProps={{ min: 1 }}
                        helperText="Padrão: 1"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Custo — Outras Perícias"
                        value={skillPointRules.otherSkillCost}
                        onChange={e => updateSystem('skillPointRules', {
                            ...skillPointRules,
                            otherSkillCost: Math.max(1, parseInt(e.target.value) || 1)
                        })}
                        inputProps={{ min: 1 }}
                        helperText="Padrão: 1"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="Fórmula — Limite por Perícia"
                        value={skillPointRules.maxPointsPerSkillFormula ?? ''}
                        onChange={e => updateSystem('skillPointRules', {
                            ...skillPointRules,
                            maxPointsPerSkillFormula: e.target.value.trim() || undefined
                        })}
                        placeholder="level * 2"
                        helperText='Variável disponível: "level". Vazio = sem limite fixo.'
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ── Tabela de progressão ── */}
            <Typography variant="h6" gutterBottom>Tabela de Progressão</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Defina as recompensas de cada nível. Clique em{' '}
                <EditIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> para configurar bônus
                adicionais (MP, AP, magias, recursos) e o rótulo da notificação de level-up.
            </Typography>

            <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>Nível</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 130 }}>Rótulo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>HP +</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 110 }}>Pts Perícia</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 110 }}>Pts Atributo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                                <Tooltip title="Desbloqueia uma habilidade de classe neste nível">
                                    <span>Hab. Classe</span>
                                </Tooltip>
                            </TableCell>
                            {(hasResources || fieldBonusOptions.length > 0) && (
                                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 90 }}>
                                    <Tooltip title="Bônus em outros campos (configurar em ✏️)">
                                        <span>Extra</span>
                                    </Tooltip>
                                </TableCell>
                            )}
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: 48 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {table.map(row => {
                            const resourceBonusCount = Object.values(row.customResourceBonuses ?? {}).filter(v => v !== 0).length
                            const fieldBonusCount = Object.values(row.fieldBonuses ?? {}).filter(v => v !== 0).length
                            const extraCount = resourceBonusCount + fieldBonusCount

                            return (
                                <TableRow key={row.level} hover>
                                    <TableCell align="center">
                                        <Chip label={row.level} size="small" color="primary" variant="outlined" />
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.label ?? ''}
                                            onChange={e => updateRow(row.level, { label: e.target.value })}
                                            placeholder="Ex: Recruta"
                                            sx={{ width: 120 }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <NumberField
                                            size="small"
                                            value={row.hpBonus}
                                            onChange={hpBonus => updateRow(row.level, { hpBonus })}
                                            min={0}
                                            inputProps={{ style: { textAlign: 'center', width: 52 } }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <NumberField
                                            size="small"
                                            value={row.skillPoints}
                                            onChange={skillPoints => updateRow(row.level, { skillPoints })}
                                            min={0}
                                            inputProps={{ style: { textAlign: 'center', width: 52 } }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <NumberField
                                            size="small"
                                            value={row.attributePoints ?? 0}
                                            onChange={attributePoints => updateRow(row.level, { attributePoints })}
                                            min={0}
                                            inputProps={{ style: { textAlign: 'center', width: 52 } }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.unlocksClassAbility ?? false}
                                            onChange={e => updateRow(row.level, { unlocksClassAbility: e.target.checked })}
                                            size="small"
                                        />
                                    </TableCell>

                                    {(hasResources || fieldBonusOptions.length > 0) && (
                                        <TableCell align="center">
                                            {extraCount > 0 ? (
                                                <Chip
                                                    label={`${extraCount} extra${extraCount > 1 ? 's' : ''}`}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{ cursor: 'help' }}
                                                    onClick={() => openDetails(row)}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">—</Typography>
                                            )}
                                        </TableCell>
                                    )}

                                    <TableCell align="center">
                                        <Tooltip title="Editar detalhes deste nível">
                                            <IconButton size="small" onClick={() => openDetails(row)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Paper>

            {/* ── Dialog de detalhes ── */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                {detailsData && (
                    <>
                        <DialogTitle>
                            Nível {detailsData.level}
                            {detailsData.label ? ` — ${detailsData.label}` : ''}
                        </DialogTitle>

                        <DialogContent>
                            <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                                <TextField
                                    fullWidth
                                    label="Rótulo da notificação de level-up"
                                    value={detailsData.customLabel ?? ''}
                                    onChange={e =>
                                        setDetailsData(prev => prev ? { ...prev, customLabel: e.target.value } : null)
                                    }
                                    placeholder="Ex: Você atingiu o posto máximo!"
                                    helperText="Exibido na notificação de level-up. Vazio = usa o padrão automático."
                                    multiline
                                    rows={2}
                                />

                                {/* Bônus de campos genéricos (MP, AP, magias, espaços) */}
                                {fieldBonusOptions.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Outros Bônus de Pontos
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {fieldBonusOptions.map(opt => (
                                                <Grid item xs={6} key={opt.key}>
                                                    <NumberField
                                                        fullWidth
                                                        size="small"
                                                        label={opt.label}
                                                        value={detailsData.fieldBonuses?.[opt.key] ?? 0}
                                                        onChange={val => {
                                                            setDetailsData(prev => prev ? {
                                                                ...prev,
                                                                fieldBonuses: {
                                                                    ...prev.fieldBonuses,
                                                                    [opt.key]: val
                                                                }
                                                            } : null)
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {/* Bônus de recursos customizados */}
                                {hasResources && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Bônus de Recursos Customizados
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {customResources.map(res => (
                                                <Grid item xs={6} key={res.key}>
                                                    <NumberField
                                                        fullWidth
                                                        size="small"
                                                        label={`${res.name}${res.abbreviation ? ` (${res.abbreviation})` : ''}`}
                                                        value={detailsData.customResourceBonuses?.[res.key] ?? 0}
                                                        onChange={val => {
                                                            setDetailsData(prev => prev ? {
                                                                ...prev,
                                                                customResourceBonuses: {
                                                                    ...prev.customResourceBonuses,
                                                                    [res.key]: val
                                                                }
                                                            } : null)
                                                        }}
                                                        helperText={`${res.min} → ${res.max}`}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setDetailsOpen(false)}>Cancelar</Button>
                            <Button variant="contained" onClick={saveDetails}>Salvar</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    )
}
