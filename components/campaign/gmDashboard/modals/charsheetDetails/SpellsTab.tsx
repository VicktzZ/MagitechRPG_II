import { AutoStories, Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, NativeSelect, TextField, Typography } from '@mui/material';
import type { SpellDTO } from '@models/dtos';
import type { Spell } from '@models/entities';
import { filterSpells, summarizeSpells } from '@utils/spellsOverview';
import { getEvolutionPoints, getSpellProgress, spellStageKey, usesStageUnlock, withoutSpell } from '@utils/spellStages';
import { useMemo, useState, type ReactElement } from 'react';
import { normalizeToArray } from './normalizeToArray';
import SpellCard from './spells/SpellCard';
import SpellsOverview from './spells/SpellsOverview';
import type { CharsheetTabProps } from './types';

interface SpellsTabProps extends CharsheetTabProps {
    /** Magias da ficha (objetos gravados nela mais as buscadas por ID) */
    spells: Array<SpellDTO | Spell>;
}

/** Com poucas magias já abre cada uma para ver os estágios; com muitas a lista abre fechada */
const AUTO_EXPAND_LIMIT = 3;

/** A partir daqui a lista ganha busca e filtros */
const FILTER_LIMIT = 4;

/** Aba "Spells": resumo das magias da ficha e, por magia, todos os estágios com o que cada um muda */
export default function SpellsTab({ charsheet, editedData, isEditing, updateNestedField, spells }: SpellsTabProps): ReactElement {
    // O mestre ajusta o estágio liberado de cada magia (ver utils/spellStages.ts); vale no Magitech padrão
    const stageRule = usesStageUnlock(charsheet);
    const unlockedMap = editedData.spellUnlocked ?? charsheet.spellUnlocked;

    const [ query, setQuery ] = useState('');
    const [ element, setElement ] = useState('');
    const [ level, setLevel ] = useState('');
    const [ opened, setOpened ] = useState<Record<string, boolean>>({});

    const entries = useMemo(() => spells.map(spell => ({
        spell,
        key: spellStageKey(spell),
        progress: getSpellProgress(spell, {
            spellStages: charsheet.spellStages,
            spellUnlocked: unlockedMap,
            elementalMastery: charsheet.elementalMastery
        }, { enabled: stageRule })
    })), [ spells, charsheet.spellStages, unlockedMap, charsheet.elementalMastery, stageRule ]);

    const overview = useMemo(() => summarizeSpells(spells), [ spells ]);
    const stages = stageRule
        ? { unlocked: entries.reduce((sum, entry) => sum + entry.progress.unlocked, 0), total: entries.reduce((sum, entry) => sum + entry.progress.count, 0) }
        : null;

    const visible = useMemo(() => {
        const allowed = new Set(filterSpells(spells, { query, element, level }));
        return entries.filter(entry => allowed.has(entry.spell));
    }, [ entries, spells, query, element, level ]);

    const isOpen = (key: string): boolean => opened[key] ?? spells.length <= AUTO_EXPAND_LIMIT;
    const setAll = (open: boolean): void => { setOpened(Object.fromEntries(entries.map(entry => [ entry.key, open ]))) };
    const allOpen = visible.length > 0 && visible.every(entry => isOpen(entry.key));
    const filtering = Boolean(query || element || level);

    const handleDelete = (target: SpellDTO | Spell): void => {
        const key = spellStageKey(target);
        const current = normalizeToArray<SpellDTO | string>(editedData.spells || charsheet.spells);
        const index = current.findIndex(entry => (typeof entry === 'string' ? entry : spellStageKey(entry)) === key);
        if (index === -1) return;
        updateNestedField('spells', current.filter((_, position) => position !== index));
        // A chave sai do liberado junto: magia aprendida de novo começa no estágio 1
        if (unlockedMap && key in unlockedMap) updateNestedField('spellUnlocked', withoutSpell(unlockedMap, key));
    };

    if (spells.length === 0 && !(charsheet.spells?.length > 0)) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <AutoStories sx={{ color: 'text.secondary', fontSize: 32, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">Este personagem não possui magias</Typography>
            </Box>
        );
    }

    const elements = overview.elements.map(entry => entry.element);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SpellsOverview
                overview={overview}
                spellSpace={Number(charsheet.spellSpace) || 0}
                elementalMastery={charsheet.elementalMastery}
                evolutionPoints={stageRule ? getEvolutionPoints(editedData.points ?? charsheet.points) : null}
                stages={stages}
            />

            {spells.length >= FILTER_LIMIT && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar magia"
                        value={query}
                        onChange={(event) => { setQuery(event.target.value) }}
                        inputProps={{ 'aria-label': 'Buscar magia' }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        sx={{ flex: 1, minWidth: 180 }}
                    />
                    <NativeSelect value={element} onChange={(event) => { setElement(event.target.value) }} inputProps={{ 'aria-label': 'Filtrar por elemento' }}>
                        <option value="">Todos os elementos</option>
                        {elements.map(name => <option key={name} value={name}>{name}</option>)}
                    </NativeSelect>
                    <NativeSelect value={level} onChange={(event) => { setLevel(event.target.value) }} inputProps={{ 'aria-label': 'Filtrar por nível' }}>
                        <option value="">Todos os níveis</option>
                        {[ 1, 2, 3, 4 ].map(value => <option key={value} value={value}>{`Nível ${value}`}</option>)}
                    </NativeSelect>
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" data-testid="spells-count">
                    {filtering ? `${visible.length} de ${spells.length} magias` : `${spells.length} ${spells.length === 1 ? 'magia' : 'magias'}`}
                </Typography>
                {visible.length > 1 && (
                    <Button size="small" color="secondary" onClick={() => { setAll(!allOpen) }} data-testid="spells-toggle-all" sx={{ py: 0 }}>
                        {allOpen ? 'Recolher todas' : 'Expandir todas'}
                    </Button>
                )}
            </Box>

            {visible.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">Nenhuma magia com esses filtros.</Typography>
                    <Button size="small" onClick={() => { setQuery(''); setElement(''); setLevel('') }} sx={{ mt: 1 }}>Limpar filtros</Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {visible.map(({ spell, key, progress }, index) => (
                        <SpellCard
                            key={`${key}-${index}`}
                            spell={spell}
                            progress={progress}
                            expanded={isOpen(key)}
                            onToggle={() => { setOpened(current => ({ ...current, [key]: !isOpen(key) })) }}
                            onSetUnlocked={isEditing && stageRule ? (stage) => { updateNestedField('spellUnlocked', { ...(unlockedMap ?? {}), [key]: stage }) } : undefined}
                            onDelete={isEditing ? () => { handleDelete(spell) } : undefined}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
