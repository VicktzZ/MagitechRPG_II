/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext'
import { MessageType } from '@enums'
import { 
    Box, 
    Button, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    Tooltip,
    useTheme,
    FormControl,
    Select,
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
    FilterList,
    SortByAlpha,
    TrendingDown
} from '@mui/icons-material'
import { blue, green, grey, purple, orange, red } from '@mui/material/colors'
import { useSession } from 'next-auth/react'
import { type ReactElement, useState, useMemo } from 'react'
import type { Expertises } from '@models';

type ExpertiseLevel = 'all' | 'novice' | 'trained' | 'expert' | 'master' | 'legendary';
type SortOrder = 'alpha-asc' | 'alpha-desc' | 'value-asc' | 'value-desc';

export default function ExpertiseSection(): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const theme = useTheme();
    const [ filterLevel, setFilterLevel ] = useState<ExpertiseLevel>('all');
    const [ sortOrder, setSortOrder ] = useState<SortOrder>('alpha-asc');

    const expertises = charsheet.expertises
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    const { data: session } = useSession()

    const getExpertiseLevel = (value: number): ExpertiseLevel => {
        if (value < 2) return 'novice';
        if (value < 5) return 'trained';
        if (value < 7) return 'expert';
        if (value < 9) return 'master';
        return 'legendary';
    };

    const filteredAndSortedExpertises = useMemo(() => {
        let entries = Object.entries(expertises);

        if (filterLevel !== 'all') {
            entries = entries.filter(([ , exp ]) => {
                const level = getExpertiseLevel(exp.value);
                return level === filterLevel;
            });
        }

        entries.sort((a, b) => {
            switch (sortOrder) {
            case 'alpha-asc':
                return a[0].localeCompare(b[0]);
            case 'alpha-desc':
                return b[0].localeCompare(a[0]);
            case 'value-asc':
                return a[1].value - b[1].value;
            case 'value-desc':
                return b[1].value - a[1].value;
            default:
                return 0;
            }
        });

        return entries;
    }, [ expertises, filterLevel, sortOrder ]);
    
    const expertiseStats = useMemo(() => {
        const allEntries = Object.entries(expertises);
        return {
            total: allEntries.length,
            novice: allEntries.filter(([ , exp ]) => exp.value < 2).length,
            trained: allEntries.filter(([ , exp ]) => exp.value >= 2 && exp.value < 5).length,
            expert: allEntries.filter(([ , exp ]) => exp.value >= 5 && exp.value < 7).length,
            master: allEntries.filter(([ , exp ]) => exp.value >= 7 && exp.value < 9).length,
            legendary: allEntries.filter(([ , exp ]) => exp.value >= 9).length
        };
    }, [ expertises ]);

    const getExpertiseConfig = (value: number) => {
        if (value < 2) {
            return { 
                color: grey[600], 
                bg: grey[100], 
                label: 'Destreinado',
                icon: Person
            }
        } else if (value < 5) {
            return { 
                color: green[600], 
                bg: green[100], 
                label: 'Treinado',
                icon: TrendingUp
            }
        } else if (value < 7) {
            return { 
                color: blue[600], 
                bg: blue[100], 
                label: 'Especialista',
                icon: Star
            }
        } else if (value < 9) {
            return { 
                color: purple[600], 
                bg: purple[100], 
                label: 'Mestre',
                icon: EmojiEvents
            }
        } else {
            return { 
                color: orange[600], 
                bg: orange[100], 
                label: 'Lendário',
                icon: Casino
            }
        }
    }

    const getAttributeColor = (attr: string) => {
        const colors: Record<string, string> = {
            'FOR': red[600],
            'AGI': green[600],
            'INT': blue[600],
            'PRE': purple[600],
            'VIG': orange[600]
        }
        return colors[attr] || grey[600]
    }

    const handleExpertiseClick = async (expertiseName: keyof Expertises) => {
        const expertise = charsheet.expertises[expertiseName]
        const expertiseValue = expertise.value

        // Determina quantos d20s rolar baseado nos mods do atributo padrão da perícia
        const attrKey = (expertise.defaultAttribute ?? '') as keyof typeof charsheet.mods.attributes
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

        const text = `🎲 ${(expertiseName as string).toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`
        
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
            <Paper 
                elevation={2}
                sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                        : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Stack spacing={3}>
                    {/* Header */}

                    {/* Estatísticas por Nível */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            p: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {[
                            { key: 'novice', label: 'Destreinado', count: expertiseStats.novice, color: grey[600] },
                            { key: 'trained', label: 'Treinado', count: expertiseStats.trained, color: green[600] },
                            { key: 'expert', label: 'Competente', count: expertiseStats.expert, color: blue[600] },
                            { key: 'master', label: 'Experiente', count: expertiseStats.master, color: purple[600] },
                            { key: 'legendary', label: 'Especialista', count: expertiseStats.legendary, color: orange[600] }
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
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
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
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: grey[600] }} />
                                        Destreinado
                                    </Box>
                                </MenuItem>
                                <MenuItem value="trained">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: green[600] }} />
                                        Treinado
                                    </Box>
                                </MenuItem>
                                <MenuItem value="expert">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: blue[600] }} />
                                        Competente
                                    </Box>
                                </MenuItem>
                                <MenuItem value="master">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: purple[600] }} />
                                        Experiente
                                    </Box>
                                </MenuItem>
                                <MenuItem value="legendary">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: orange[600] }} />
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

                        {(filterLevel !== 'all' || sortOrder !== 'alpha-asc') && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                    setFilterLevel('all');
                                    setSortOrder('alpha-asc');
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
                                    {filterLevel !== 'all' 
                                        ? 'Nenhuma perícia encontrada com este filtro'
                                        : 'Nenhuma perícia encontrada'
                                    }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {filterLevel !== 'all' 
                                        ? 'Tente ajustar os filtros para ver mais perícias.'
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
                                {filteredAndSortedExpertises.map(([ nome, expertise ]) => {
                                    const config = getExpertiseConfig(expertise.value);
                                    const IconComponent = config.icon;
                                    
                                    return (
                                        <Tooltip 
                                            key={nome}
                                            title={`Clique para rolar ${nome} (${config.label})`}
                                            placement="top"
                                        >
                                            <Button
                                                fullWidth
                                                onClick={async () => await handleExpertiseClick(nome as keyof Expertises)}
                                                elevation={1}
                                                sx={{
                                                    p: 2.5,
                                                    bgcolor: config.bg + '40',
                                                    border: '1px solid',
                                                    borderColor: config.color + '40',
                                                    borderRadius: 2,
                                                    justifyContent: 'flex-start',
                                                    textAlign: 'left',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: config.bg + '60',
                                                        borderColor: config.color + '80',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 3
                                                    }
                                                }}
                                            >
                                                <Stack spacing={1.5} width="100%">
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Box 
                                                            sx={{
                                                                p: 0.8,
                                                                borderRadius: 1,
                                                                bgcolor: config.color + '20',
                                                                border: '1px solid',
                                                                borderColor: config.color + '40'
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
                                                            {nome}
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                                                        <Chip 
                                                            label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: config.color,
                                                                color: 'white',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        />
                                                        <Chip 
                                                            label={expertise.defaultAttribute?.toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getAttributeColor(expertise.defaultAttribute?.toUpperCase()) + '20',
                                                                color: getAttributeColor(expertise.defaultAttribute?.toUpperCase()),
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                        <Chip 
                                                            label={config.label}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: config.color + '60',
                                                                color: config.color,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem'
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