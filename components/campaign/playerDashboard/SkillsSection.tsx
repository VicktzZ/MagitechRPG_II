/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import SkillsTreeDialog from '@components/ficha/dialogs/SkillsTreeDialog';
import { useCampaignCurrentFichaContext } from '@contexts';
import { SkillType } from '@enums';
import Masonry from '@mui/lab/Masonry';
import { 
    Box, 
    Button, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    Tooltip,
    IconButton,
    Collapse,
    useTheme,
    Badge
} from '@mui/material';
import {
    AccountTree,
    ExpandMore,
    ExpandLess,
    Star,
    Shield,
    AutoAwesome,
    EmojiEvents,
    Whatshot
} from '@mui/icons-material';
import { blue, green, orange, purple, red } from '@mui/material/colors';
import type { Ficha, Skill } from '@types';
import { useState, type ReactElement } from 'react';

interface SkillFilterChipProps {
    label: string;
    type: SkillType;
    selected: boolean;
    onClick: () => void;
}

function SkillFilterChip({ label , selected, onClick }: SkillFilterChipProps) {
    const getChipConfig = (type: SkillType) => {
        switch (type) {
        case SkillType.ALL:
            return { color: blue[600], bg: blue[100], icon: Star };
        case SkillType.CLASS:
            return { color: green[600], bg: green[100], icon: Shield };
        case SkillType.LINEAGE:
            return { color: purple[600], bg: purple[100], icon: AutoAwesome };
        case SkillType.POWERS:
            return { color: red[600], bg: red[100], icon: Whatshot };
        case SkillType.BONUS:
            return { color: orange[600], bg: orange[100], icon: EmojiEvents };
        default:
            return { color: blue[600], bg: blue[100], icon: Star };
        }
    };

    const config = getChipConfig(label as any);
    const ChipIcon = config.icon;

    return (
        <Chip
            icon={<ChipIcon sx={{ fontSize: '1rem' }} />}
            label={label}
            onClick={onClick}
            variant={selected ? 'filled' : 'outlined'}
            sx={{
                bgcolor: selected ? config.bg : 'transparent',
                color: selected ? config.color : 'text.primary',
                borderColor: config.color + '60',
                fontWeight: selected ? 700 : 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                    bgcolor: config.bg,
                    color: config.color,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 8px ${config.color}40`
                }
            }}
        />
    );
}

interface SkillsSectionProps {
    selectedSkillType: SkillType;
    setSelectedSkillType: (type: SkillType) => void;
}

export default function SkillsSection({ selectedSkillType, setSelectedSkillType }: SkillsSectionProps): ReactElement {
    const { ficha } = useCampaignCurrentFichaContext();
    const theme = useTheme();
    
    const filteredSkills = selectedSkillType === SkillType.ALL
        ? Object.values(ficha.skills).flat()
        : ficha.skills[selectedSkillType] || [];

    const [ treeModalOpen, setTreeModalOpen ] = useState(false)
    const [ expandedSkill, setExpandedSkill ] = useState<string | false>(false)

    const getSkillTypeCount = (type: SkillType) => {
        if (type === SkillType.ALL) {
            return Object.values(ficha.skills).flat().length;
        }
        return ficha.skills[type]?.length || 0;
    };

    const getSkillTypeColor = (type: SkillType) => {
        switch (type) {
        case SkillType.CLASS:
            return green[600];
        case SkillType.LINEAGE:
            return purple[600];
        case SkillType.POWERS:
            return red[600];
        case SkillType.BONUS:
            return orange[600];
        default:
            return blue[600];
        }
    };

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
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: blue[100],
                                    border: '2px solid',
                                    borderColor: blue[200]
                                }}
                            >
                                <Star sx={{ color: blue[700], fontSize: '2rem' }} />
                            </Box>
                            <Box>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        mb: 0.5
                                    }}
                                >
                                    Habilidades
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {filteredSkills.length} habilidade{filteredSkills.length !== 1 ? 's' : ''} {selectedSkillType === SkillType.ALL ? 'no total' : 'nesta categoria'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Tooltip title="Abrir árvore de habilidades">
                            <Button 
                                variant="contained" 
                                startIcon={<AccountTree />}
                                onClick={() => setTreeModalOpen(true)}
                                sx={{
                                    bgcolor: blue[600],
                                    '&:hover': {
                                        bgcolor: blue[700],
                                        transform: 'translateY(-1px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                Árvore de Habilidades
                            </Button>
                        </Tooltip>
                    </Box>

                    {/* Filtros */}
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                            Filtrar por Categoria
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            <Badge badgeContent={getSkillTypeCount(SkillType.ALL)} color="primary">
                                <SkillFilterChip
                                    label="Todas"
                                    type={SkillType.ALL}
                                    selected={selectedSkillType === SkillType.ALL}
                                    onClick={() => setSelectedSkillType(SkillType.ALL)}
                                />
                            </Badge>
                            <Badge badgeContent={getSkillTypeCount(SkillType.CLASS)} color="success">
                                <SkillFilterChip
                                    label="Classe"
                                    type={SkillType.CLASS}
                                    selected={selectedSkillType === SkillType.CLASS}
                                    onClick={() => setSelectedSkillType(SkillType.CLASS)}
                                />
                            </Badge>
                            <Badge badgeContent={getSkillTypeCount(SkillType.LINEAGE)} color="secondary">
                                <SkillFilterChip
                                    label="Linhagem"
                                    type={SkillType.LINEAGE}
                                    selected={selectedSkillType === SkillType.LINEAGE}
                                    onClick={() => setSelectedSkillType(SkillType.LINEAGE)}
                                />
                            </Badge>
                            <Badge badgeContent={getSkillTypeCount(SkillType.POWERS)} color="error">
                                <SkillFilterChip
                                    label="Poderes"
                                    type={SkillType.POWERS}
                                    selected={selectedSkillType === SkillType.POWERS}
                                    onClick={() => setSelectedSkillType(SkillType.POWERS)}
                                />
                            </Badge>
                            <Badge badgeContent={getSkillTypeCount(SkillType.BONUS)} color="warning">
                                <SkillFilterChip
                                    label="Bônus"
                                    type={SkillType.BONUS}
                                    selected={selectedSkillType === SkillType.BONUS}
                                    onClick={() => setSelectedSkillType(SkillType.BONUS)}
                                />
                            </Badge>
                        </Stack>
                    </Box>

                    {/* Lista de Habilidades */}
                    <Box>
                        {filteredSkills.length === 0 ? (
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
                                    Nenhuma habilidade encontrada
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Não há habilidades nesta categoria ainda.
                                </Typography>
                            </Paper>
                        ) : (
                            <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3 }} spacing={2}>
                                {filteredSkills.map((skill: Skill) => {
                                    const isExpanded = expandedSkill === skill.name;
                                    const shouldTruncate = skill.description.length > 150;
                                    
                                    return (
                                        <Paper 
                                            key={skill.name}
                                            elevation={2}
                                            sx={{ 
                                                p: 2.5, 
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                    borderColor: getSkillTypeColor(selectedSkillType) + '60'
                                                }
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                {/* Header da Habilidade */}
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: getSkillTypeColor(selectedSkillType),
                                                            flex: 1
                                                        }}
                                                    >
                                                        {skill.name}
                                                    </Typography>
                                                    {shouldTruncate && (
                                                        <Tooltip title={isExpanded ? 'Recolher' : 'Expandir'}>
                                                            <IconButton 
                                                                size="small"
                                                                onClick={() => {
                                                                    setExpandedSkill(isExpanded ? false : skill.name);
                                                                }}
                                                                sx={{
                                                                    color: getSkillTypeColor(selectedSkillType),
                                                                    '&:hover': {
                                                                        bgcolor: getSkillTypeColor(selectedSkillType) + '20'
                                                                    }
                                                                }}
                                                            >
                                                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                                
                                                {/* Descrição */}
                                                <Box>
                                                    <Collapse in={!shouldTruncate || isExpanded} timeout={300}>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{ 
                                                                lineHeight: 1.6,
                                                                textAlign: 'justify'
                                                            }}
                                                        >
                                                            {skill.description}
                                                        </Typography>
                                                    </Collapse>
                                                    
                                                    {shouldTruncate && !isExpanded && (
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{ 
                                                                lineHeight: 1.6,
                                                                textAlign: 'justify'
                                                            }}
                                                        >
                                                            {skill.description.substring(0, 150)}...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Masonry>
                        )}
                    </Box>
                </Stack>

                <SkillsTreeDialog
                    open={treeModalOpen}
                    onClose={() => setTreeModalOpen(false)}
                    ficha={ficha as Required<Ficha>}
                />
            </Paper>
        </Box>
    );
}
