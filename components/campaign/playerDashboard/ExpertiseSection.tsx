/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext'
import { MessageType } from '@enums'
import { 
    alpha,
    Box, 
    Button, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    Tooltip,
    FormControl,
    IconButton,
    InputAdornment,
    Select,
    TextField,
    MenuItem,
    InputLabel,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material'
import {
    Person,
    Casino,
    TrendingUp,
    Star,
    EmojiEvents,
    Close,
    FilterList,
    Search,
    SortByAlpha,
    TrendingDown
} from '@mui/icons-material'
import { color } from '@themes/tokens'
import { useSession } from 'next-auth/react'
import { type ReactElement, useState, useMemo, useEffect } from 'react'
import type { RPGSystem, SystemAttribute } from '@models/entities';
import { filterAndSortExpertises, type ExpertiseSort } from '@utils/expertiseList';
import { matchesSearch } from '@utils/searchText';

type ExpertiseLevel = 'all' | 'novice' | 'trained' | 'expert' | 'master' | 'legendary';
type SortOrder = ExpertiseSort;

/** Cor de cada nível de perícia, do neutro (destreinado) ao topo da escala: papéis do tema, não cores soltas */
const levelColor = {
    novice: color.inkMuted,
    trained: color.success,
    expert: color.cyan,
    master: color.amber,
    legendary: color.warning
} as const

interface ExpertiseEntry {
    key: string;
    label: string;
    value: number;
    defaultAttribute?: string;
    attributeLabel?: string;
}

export default function ExpertiseSection(): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const [ filterLevel, setFilterLevel ] = useState<ExpertiseLevel>('all');
    const [ sortOrder, setSortOrder ] = useState<SortOrder>('alpha-asc');
    const [ query, setQuery ] = useState('');
    const [ systemExpertises, setSystemExpertises ] = useState<RPGSystem['expertises'] | null>(null);
    const [ systemAttributes, setSystemAttributes ] = useState<SystemAttribute[] | null>(null);

    const expertises = charsheet.expertises
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    const { data: session } = useSession()

    // Carrega as perícias/atributos do sistema customizado (se houver), para
    // mostrar SOMENTE as perícias do sistema (não as padrão do Magitech) com
    // nomes resolvidos em vez das keys internas.
    useEffect(() => {
        if (!charsheet.systemId) return;
        fetch(`/api/rpg-system/${charsheet.systemId}`)
            .then(async res => await res.json())
            .then((data: RPGSystem) => {
                if (data.expertises && data.expertises.length > 0) setSystemExpertises(data.expertises);
                if (data.attributes && data.attributes.length > 0) setSystemAttributes(data.attributes);
            })
            .catch(err => console.error('Erro ao carregar perícias do sistema:', err));
    }, [ charsheet.systemId ]);

    const getExpertiseLevel = (value: number): ExpertiseLevel => {
        if (value < 2) return 'novice';
        if (value < 5) return 'trained';
        if (value < 7) return 'expert';
        if (value < 9) return 'master';
        return 'legendary';
    };

    const entries = useMemo<ExpertiseEntry[]>(() => {
        if (systemExpertises && systemExpertises.length > 0) {
            return systemExpertises.map(sysExp => {
                const stored = expertises[sysExp.key as keyof typeof expertises];
                const defaultAttribute = stored?.defaultAttribute ?? sysExp.defaultAttribute ?? undefined;
                const attrDef = systemAttributes?.find(a => a.key === defaultAttribute || a.name === defaultAttribute);
                return {
                    key: sysExp.key,
                    label: sysExp.name,
                    value: stored?.value ?? 0,
                    defaultAttribute,
                    attributeLabel: attrDef?.abbreviation ?? defaultAttribute?.toUpperCase()
                };
            });
        }

        return Object.entries(expertises).map(([ key, exp ]) => ({
            key,
            label: key,
            value: exp?.value ?? 0,
            defaultAttribute: exp?.defaultAttribute,
            attributeLabel: exp?.defaultAttribute?.toUpperCase()
        }));
    }, [ expertises, systemExpertises, systemAttributes ]);

    const filteredAndSortedExpertises = useMemo(() => {
        const byLevel = filterLevel === 'all' ? entries : entries.filter(e => getExpertiseLevel(e.value) === filterLevel);
        const bySearch = byLevel.filter(e => matchesSearch(e.label, query));
        return filterAndSortExpertises(bySearch, { sort: sortOrder, nameOf: e => e.label, valueOf: e => e.value });
    }, [ entries, filterLevel, sortOrder, query ]);

    const expertiseStats = useMemo(() => ({
        total: entries.length,
        novice: entries.filter(e => e.value < 2).length,
        trained: entries.filter(e => e.value >= 2 && e.value < 5).length,
        expert: entries.filter(e => e.value >= 5 && e.value < 7).length,
        master: entries.filter(e => e.value >= 7 && e.value < 9).length,
        legendary: entries.filter(e => e.value >= 9).length
    }), [ entries ]);

    const getExpertiseConfig = (value: number) => {
        if (value < 2) {
            return { 
                color: levelColor.novice, 
                label: 'Destreinado',
                icon: Person
            }
        } else if (value < 5) {
            return { 
                color: levelColor.trained, 
                label: 'Treinado',
                icon: TrendingUp
            }
        } else if (value < 7) {
            return { 
                color: levelColor.expert, 
                label: 'Especialista',
                icon: Star
            }
        } else if (value < 9) {
            return { 
                color: levelColor.master, 
                label: 'Mestre',
                icon: EmojiEvents
            }
        } else {
            return { 
                color: levelColor.legendary, 
                label: 'Lendário',
                icon: Casino
            }
        }
    }

    const getAttributeColor = (attr: string) => {
        const colors: Record<string, string> = {
            'FOR': color.danger,
            'AGI': color.success,
            'INT': color.cyan,
            'PRE': color.amber,
            'VIG': color.warning
        }
        return colors[attr] || color.inkMuted
    }

    const handleExpertiseClick = async (entry: ExpertiseEntry) => {
        const expertiseValue = entry.value

        // Determina quantos d20s rolar baseado nos mods do atributo padrão da perícia
        const attrKey = (entry.defaultAttribute ?? '') as keyof typeof charsheet.mods.attributes
        let numDice = Number(charsheet.mods?.attributes?.[attrKey] ?? 1)
        if (!Number.isFinite(numDice) || numDice < 1) numDice = 1

        // Rola os dados
        const rolls: number[] = []
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * 20) + 1)
        }

        // Seleciona o melhor resultado entre os dados rolados
        const roll = rolls.length > 1 ? Math.max(...rolls) : rolls[0]

        const total = roll + expertiseValue

        // Formata os rolls para exibição de uma forma que possamos reconhecer depois
        const rollPart = rolls.length > 1 ?
            `${rolls.join(', ')}: ${roll}` :
            `${roll}`

        const text = `🎲 ${entry.label.toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`
        
        // Envia a mensagem diretamente
        if (session?.user) {
            await handleSendMessage({
                text,
                type: MessageType.EXPERTISE,
                by: {
                    id: session.user.id ?? '',
                    name: session.user.name ?? '',
                    image: session.user.image ?? ''
                },
                timestamp: new Date().toISOString(),
                isHTML: true
            })
        }

        if (!isChatOpen) {
            setIsChatOpen(true)
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* A moldura e o título vêm do Section da campanha */}
            <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Stack spacing={3}>

                    {/* Estatísticas por Nível */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            p: 2,
                            bgcolor: 'background.raised',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {[
                            { key: 'novice', label: 'Destreinado', count: expertiseStats.novice, color: levelColor.novice },
                            { key: 'trained', label: 'Treinado', count: expertiseStats.trained, color: levelColor.trained },
                            { key: 'expert', label: 'Competente', count: expertiseStats.expert, color: levelColor.expert },
                            { key: 'master', label: 'Experiente', count: expertiseStats.master, color: levelColor.master },
                            { key: 'legendary', label: 'Especialista', count: expertiseStats.legendary, color: levelColor.legendary }
                        ].map(stat => (
                            <Stack key={stat.key} alignItems="center" spacing={0.5}>
                                <Typography variant="h6" sx={{ color: stat.color, fontWeight: 700 }}>
                                    {stat.count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Box>

                    {/* Filtros e Ordenação */}
                    <Box 
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: 'background.raised',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Buscar perícia"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            inputProps={{ 'aria-label': 'Buscar perícia' }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                                endAdornment: query ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" aria-label="Limpar busca de perícias" onClick={() => setQuery('')} edge="end">
                                            <Close fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined
                            }}
                            sx={{ minWidth: 200, flex: '1 1 200px', maxWidth: 320 }}
                        />

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <FilterList fontSize="small" />
                                    Filtrar por Nível
                                </Box>
                            </InputLabel>
                            <Select
                                value={filterLevel}
                                label="Filtrar por Nível"
                                onChange={(e) => setFilterLevel(e.target.value as ExpertiseLevel)}
                            >
                                <MenuItem value="all">Todas as Perícias</MenuItem>
                                <MenuItem value="novice">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColor.novice }} />
                                        Destreinado
                                    </Box>
                                </MenuItem>
                                <MenuItem value="trained">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColor.trained }} />
                                        Treinado
                                    </Box>
                                </MenuItem>
                                <MenuItem value="expert">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColor.expert }} />
                                        Competente
                                    </Box>
                                </MenuItem>
                                <MenuItem value="master">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColor.master }} />
                                        Experiente
                                    </Box>
                                </MenuItem>
                                <MenuItem value="legendary">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColor.legendary }} />
                                        Especialista
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            value={sortOrder}
                            exclusive
                            onChange={(_, newSort) => {
                                if (newSort !== null) {
                                    setSortOrder(newSort);
                                }
                            }}
                            size="small"
                            sx={{ flexWrap: 'wrap' }}
                        >
                            <ToggleButton value="alpha-asc">
                                <Tooltip title="A → Z">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <SortByAlpha fontSize="small" />
                                        <Typography variant="caption">A-Z</Typography>
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="alpha-desc">
                                <Tooltip title="Z → A">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <SortByAlpha fontSize="small" sx={{ transform: 'scaleY(-1)' }} />
                                        <Typography variant="caption">Z-A</Typography>
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="value-desc">
                                <Tooltip title="Maior Valor">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TrendingUp fontSize="small" />
                                        <Typography variant="caption">Maior</Typography>
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="value-asc">
                                <Tooltip title="Menor Valor">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TrendingDown fontSize="small" />
                                        <Typography variant="caption">Menor</Typography>
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {(filterLevel !== 'all' || sortOrder !== 'alpha-asc' || query.trim() !== '') && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                    setFilterLevel('all');
                                    setSortOrder('alpha-asc');
                                    setQuery('');
                                }}
                                sx={{ ml: 'auto' }}
                            >
                                Limpar Filtros
                            </Button>
                        )}
                    </Box>

                    {/* Lista de Perícias */}
                    <Box>
                        {filteredAndSortedExpertises.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent'
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    {query.trim() !== ''
                                        ? `Nenhuma perícia encontrada para "${query.trim()}"`
                                        : filterLevel !== 'all'
                                            ? 'Nenhuma perícia encontrada com este filtro'
                                            : 'Nenhuma perícia encontrada'
                                    }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {filterLevel !== 'all' || query.trim() !== ''
                                        ? 'Tente ajustar a busca ou os filtros para ver mais perícias.'
                                        : 'As perícias do personagem aparecerão aqui.'
                                    }
                                </Typography>
                            </Paper>
                        ) : (
                            <Box 
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: 'repeat(2, 1fr)',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                        lg: 'repeat(4, 1fr)',
                                        xl: 'repeat(5, 1fr)'
                                    },
                                    gap: { xs: 1, sm: 2 }
                                }}
                            >
                                {filteredAndSortedExpertises.map((entry) => {
                                    const config = getExpertiseConfig(entry.value);
                                    const IconComponent = config.icon;

                                    return (
                                        <Tooltip
                                            key={entry.key}
                                            title={`Clique para rolar ${entry.label} (${config.label})`}
                                            placement="top"
                                        >
                                            <Button
                                                fullWidth
                                                data-testid="expertise-card"
                                                onClick={async () => await handleExpertiseClick(entry)}
                                                elevation={1}
                                                sx={{
                                                    p: 2.5,
                                                    bgcolor: alpha(config.color, 0.1),
                                                    border: '1px solid',
                                                    borderColor: alpha(config.color, 0.25),
                                                    borderRadius: 2,
                                                    justifyContent: 'flex-start',
                                                    textAlign: 'left',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: alpha(config.color, 0.18),
                                                        borderColor: alpha(config.color, 0.5)
                                                    }
                                                }}
                                            >
                                                <Stack spacing={1.5} width="100%">
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Box 
                                                            sx={{
                                                                p: 0.8,
                                                                borderRadius: 1,
                                                                bgcolor: alpha(config.color, 0.12),
                                                                border: '1px solid',
                                                                borderColor: alpha(config.color, 0.25)
                                                            }}
                                                        >
                                                            <IconComponent 
                                                                sx={{ 
                                                                    color: config.color,
                                                                    fontSize: '1.2rem'
                                                                }} 
                                                            />
                                                        </Box>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'text.primary',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {entry.label}
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                                                        <Chip
                                                            label={`${entry.value >= 0 ? '+' : ''}${entry.value}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: config.color,
                                                                color: 'background.default',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        />
                                                        {entry.attributeLabel && (
                                                            <Chip
                                                                label={entry.attributeLabel}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(getAttributeColor(entry.attributeLabel), 0.12),
                                                                    color: getAttributeColor(entry.attributeLabel),
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        )}
                                                        <Chip 
                                                            label={config.label}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: alpha(config.color, 0.38),
                                                                color: config.color,
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Button>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}