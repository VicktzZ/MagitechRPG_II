'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useSnackbar } from 'notistack'
import type { CombatEffect, CombatEffectCategory } from '@models'
import { campaignService } from '@services'
import { getCategoryLabel, getEffectDisplayName } from '@utils/combatEffectLabels'

interface ApplyEffectDialogProps {
    open: boolean
    onClose: () => void
    campaignId: string
    target: { id: string; name: string } | null
    appliedByName?: string
    onApplied?: () => void
}

export default function ApplyEffectDialog({
    open,
    onClose,
    campaignId,
    target,
    appliedByName,
    onApplied
}: ApplyEffectDialogProps) {
    const { enqueueSnackbar } = useSnackbar()

    const [ loading, setLoading ] = useState(false)
    const [ applying, setApplying ] = useState(false)
    const [ effects, setEffects ] = useState<CombatEffect[]>([])
    const [ selectedEffectId, setSelectedEffectId ] = useState<string>('')
    const [ level, setLevel ] = useState<number>(1)
    const [ filterCategory, setFilterCategory ] = useState<'all' | CombatEffectCategory>('all')
    const [ search, setSearch ] = useState('')

    // Overrides de timing/duração — permitem customizar a aplicação sem alterar o catálogo.
    // Ambos começam com os valores default do efeito/nível e são recalculados quando o usuário muda o efeito ou nível.
    const [ timingOverride, setTimingOverride ] = useState<'turn' | 'round'>('turn')
    const [ durationOverride, setDurationOverride ] = useState<number>(1)
    const [ customTiming, setCustomTiming ] = useState<boolean>(false)
    const [ customDuration, setCustomDuration ] = useState<boolean>(false)
    const [ indefiniteOverride, setIndefiniteOverride ] = useState<boolean>(false)

    const selectedEffect = useMemo(
        () => effects.find(e => e.id === selectedEffectId) || null,
        [ effects, selectedEffectId ]
    )

    const availableLevels = selectedEffect?.levels?.length ?? 0
    const levelConfig = selectedEffect?.levels?.[level - 1]

    const filteredEffects = useMemo(() => {
        return effects.filter(e => {
            if (filterCategory !== 'all' && e.category !== filterCategory) return false
            if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [ effects, filterCategory, search ])

    const load = useCallback(async () => {
        if (!campaignId) return
        setLoading(true)
        try {
            const res = await campaignService.listEffects(campaignId, true)
            setEffects(res.effects || [])
            if (res.effects?.length && !selectedEffectId) {
                setSelectedEffectId(res.effects[0].id)
            }
        } catch (err) {
            console.error('Erro ao carregar efeitos:', err)
            enqueueSnackbar('Não foi possível carregar o catálogo de efeitos', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }, [ campaignId, enqueueSnackbar, selectedEffectId ])

    useEffect(() => {
        if (open) {
            void load()
        } else {
            setSelectedEffectId('')
            setLevel(1)
            setFilterCategory('all')
            setSearch('')
            setCustomTiming(false)
            setCustomDuration(false)
            setIndefiniteOverride(false)
        }
    }, [ open, load ])

    useEffect(() => {
        if (selectedEffect && level > (selectedEffect.levels?.length ?? 1)) {
            setLevel(1)
        }
    }, [ selectedEffect, level ])

    // Sempre que o efeito/nível mudar, resetamos os overrides para os defaults —
    // exceto se o usuário já marcou que quer customizar algum dos dois (mantém o valor dele).
    useEffect(() => {
        if (!selectedEffect || !levelConfig) return
        if (!customTiming) {
            setTimingOverride(selectedEffect.timing)
        }
        if (!customDuration) {
            setDurationOverride(levelConfig.duration)
        }
        // Se o nível base já é indefinido, forçamos a checkbox como true.
        setIndefiniteOverride(levelConfig.indefinite === true)
    }, [ selectedEffect, levelConfig, customTiming, customDuration ])

    const handleApply = async () => {
        if (!target || !selectedEffect) return
        setApplying(true)
        try {
            const payload: Parameters<typeof campaignService.applyCombatEffect>[1] = {
                targetId: target.id,
                effectId: selectedEffect.id,
                level,
                appliedByName
            }
            if (customTiming && timingOverride && timingOverride !== selectedEffect.timing) {
                payload.timingOverride = timingOverride
            }
            if (!indefiniteOverride && customDuration && durationOverride && durationOverride !== levelConfig?.duration) {
                payload.durationOverride = durationOverride
            }
            if (indefiniteOverride && levelConfig?.indefinite !== true) {
                payload.indefiniteOverride = true
            }
            await campaignService.applyCombatEffect(campaignId, payload)
            enqueueSnackbar(`Efeito ${getEffectDisplayName(selectedEffect, level)} aplicado em ${target.name}`, { variant: 'success' })
            onApplied?.()
            onClose()
        } catch (err: any) {
            console.error('Erro ao aplicar efeito:', err)
            enqueueSnackbar(err?.response?.data?.error ?? 'Erro ao aplicar efeito', { variant: 'error' })
        } finally {
            setApplying(false)
        }
    }

    return (
        <Dialog open={open} onClose={applying ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoFixHighIcon color="secondary" />
                Aplicar efeito {target ? `em ${target.name}` : ''}
            </DialogTitle>
            <DialogContent>
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField
                        label="Buscar"
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        fullWidth
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Categoria</InputLabel>
                        <Select
                            label="Categoria"
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value as any)}
                        >
                            <MenuItem value="all">Todas</MenuItem>
                            <MenuItem value="damage">Dano</MenuItem>
                            <MenuItem value="heal">Cura</MenuItem>
                            <MenuItem value="buff">Buff</MenuItem>
                            <MenuItem value="debuff">Debuff</MenuItem>
                            <MenuItem value="info">Informativo</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Efeito</InputLabel>
                    <Select
                        label="Efeito"
                        value={selectedEffectId}
                        onChange={e => setSelectedEffectId(e.target.value)}
                    >
                        {filteredEffects.length === 0 && (
                            <MenuItem value="" disabled>Nenhum efeito</MenuItem>
                        )}
                        {filteredEffects.map(eff => (
                            <MenuItem key={eff.id} value={eff.id}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>{eff.icon}</span>
                                    <span>{eff.name}</span>
                                    <Chip
                                        label={eff.scope === 'global' ? 'Global' : 'Campanha'}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.6rem', ml: 1 }}
                                    />
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedEffect && (
                    <>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            {selectedEffect.usesLevels !== false && availableLevels > 1 && (
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Nível</InputLabel>
                                    <Select
                                        label="Nível"
                                        value={level}
                                        onChange={e => setLevel(Number(e.target.value))}
                                    >
                                        {Array.from({ length: availableLevels }, (_, i) => i + 1).map(l => (
                                            <MenuItem key={l} value={l}>{l}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <Chip
                                label={selectedEffect.usesLevels === false ? selectedEffect.name : getEffectDisplayName(selectedEffect, level)}
                                sx={{ bgcolor: selectedEffect.color, color: '#fff', fontWeight: 700 }}
                            />
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Stack spacing={0.5}>
                            <Typography variant="body2">
                                <strong>Descrição:</strong> {selectedEffect.description || '—'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Categoria:</strong> {getCategoryLabel(selectedEffect.category)}
                                {' · '}
                                <strong>Gatilho:</strong> {selectedEffect.timing === 'turn' ? 'Por turno' : 'Por rodada'}
                            </Typography>
                            {levelConfig && (
                                <Typography variant="body2">
                                    {levelConfig.formula && levelConfig.formula !== '0' && (
                                        <>
                                            <strong>Fórmula:</strong> {levelConfig.formula}
                                            {' · '}
                                        </>
                                    )}
                                    <strong>Duração:</strong>{' '}
                                    {levelConfig.indefinite
                                        ? '∞ (indefinido)'
                                        : `${levelConfig.duration} ${selectedEffect.timing === 'turn' ? 'turno(s)' : 'rodada(s)'}`
                                    }
                                </Typography>
                            )}
                            {levelConfig?.description && (
                                <Typography variant="caption" color="text.secondary">
                                    {levelConfig.description}
                                </Typography>
                            )}
                            {levelConfig?.modifiers && levelConfig.modifiers.length > 0 && (
                                <Box sx={{ mt: 1, p: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                                        Modificadores neste nível
                                    </Typography>
                                    {levelConfig.modifiers.map((mod, i) => (
                                        <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                                            • <strong>{mod.kind}</strong>
                                            {mod.target ? ` → ${mod.target}` : ''}
                                            {mod.value !== undefined ? ` = ${mod.value}` : ''}
                                            {mod.element ? ` [${mod.element}]` : ''}
                                            {mod.note ? ` — ${mod.note}` : ''}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption" color="text.secondary">Customização desta aplicação</Typography>
                            </Divider>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
                                <FormControl size="small" sx={{ flex: 1 }}>
                                    <InputLabel>Gatilho</InputLabel>
                                    <Select
                                        label="Gatilho"
                                        value={timingOverride}
                                        onChange={e => {
                                            const v = e.target.value as 'turn' | 'round'
                                            setTimingOverride(v)
                                            setCustomTiming(v !== selectedEffect.timing)
                                        }}
                                    >
                                        <MenuItem value="turn">Por turno</MenuItem>
                                        <MenuItem value="round">Por rodada</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Duração"
                                    size="small"
                                    type="number"
                                    value={indefiniteOverride ? '' : durationOverride}
                                    onChange={e => {
                                        const v = Math.max(1, parseInt(e.target.value || '1', 10))
                                        setDurationOverride(v)
                                        setCustomDuration(v !== (levelConfig?.duration ?? v))
                                    }}
                                    inputProps={{ min: 1, max: 99 }}
                                    sx={{ width: { xs: '100%', sm: 120 } }}
                                    helperText={indefiniteOverride ? '∞' : (timingOverride === 'turn' ? 'Em turnos' : 'Em rodadas')}
                                    disabled={indefiniteOverride}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={indefiniteOverride}
                                            onChange={e => setIndefiniteOverride(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="caption">Indefinido</Typography>}
                                    sx={{ mr: 0, ml: 0 }}
                                />
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setTimingOverride(selectedEffect.timing)
                                        setDurationOverride(levelConfig?.duration ?? 1)
                                        setCustomTiming(false)
                                        setCustomDuration(false)
                                        setIndefiniteOverride(levelConfig?.indefinite === true)
                                    }}
                                    disabled={!customTiming && !customDuration && indefiniteOverride === (levelConfig?.indefinite === true)}
                                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                                >
                                    Restaurar padrão
                                </Button>
                            </Stack>

                            {(customTiming || customDuration || (indefiniteOverride !== (levelConfig?.indefinite === true))) && (
                                <Typography variant="caption" sx={{ color: 'info.main', mt: 0.5 }}>
                                    ℹ️ Essa aplicação vai usar valores customizados — o catálogo do efeito não é alterado.
                                </Typography>
                            )}

                            {indefiniteOverride && (
                                <Typography variant="caption" sx={{ color: 'secondary.main', mt: 0.5 }}>
                                    ∞ Efeito indefinido — só será removido quando o GM remover manualmente.
                                </Typography>
                            )}

                            {!indefiniteOverride && timingOverride === 'turn' && (selectedEffect.category === 'damage' || selectedEffect.category === 'heal') && (
                                <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5 }}>
                                    ⚠️ Efeitos por turno de dano/cura aplicam o primeiro tick imediatamente ao serem atribuídos.
                                </Typography>
                            )}
                        </Stack>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={applying} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleApply}
                    variant="contained"
                    color="secondary"
                    disabled={applying || !selectedEffect || !target}
                    startIcon={applying ? <CircularProgress size={18} /> : <AutoFixHighIcon />}
                >
                    {applying ? 'Aplicando...' : 'Aplicar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
