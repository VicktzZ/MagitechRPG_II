/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { SkillType } from '@enums';
import Masonry from '@mui/lab/Masonry';
import { 
    alpha,
    Box, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    Tooltip,
    IconButton,
    Collapse,
    Badge
} from '@mui/material';
import {
    ExpandMore,
    ExpandLess,
    Star,
    Shield,
    AutoStories,
    EmojiEvents,
    Whatshot
} from '@mui/icons-material';
import { color } from '@themes/tokens';
import { useState, type ReactElement } from 'react';
import type { Skill } from '@models';
import { findPassive, type PassiveDef, type PassiveSource } from '@utils/combat/passives';
import { normalizeToArray } from '@utils/normalizeToArray';

interface SkillFilterChipProps {
    label: string;
    type: SkillType;
    selected: boolean;
    onClick: () => void;
}

function SkillFilterChip({ label, type, selected, onClick }: SkillFilterChipProps) {
    const getChipConfig = () => {
        switch (type) {
        case SkillType.ALL:
            return { color: color.amber, bg: alpha(color.amber, 0.14), icon: Star };
        case SkillType.CLASS:
            return { color: color.success, bg: alpha(color.success, 0.14), icon: Shield };
        case SkillType.LINEAGE:
            return { color: color.inkMuted, bg: alpha(color.inkMuted, 0.14), icon: AutoStories };
        case SkillType.POWERS:
            return { color: color.danger, bg: alpha(color.danger, 0.14), icon: Whatshot };
        case SkillType.BONUS:
            return { color: color.warning, bg: alpha(color.warning, 0.14), icon: EmojiEvents };
        default:
            return { color: color.amber, bg: alpha(color.amber, 0.14), icon: Star };
        }
    };

    const config = getChipConfig();
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
                borderColor: alpha(config.color, 0.38),
                fontWeight: selected ? 700 : 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                    bgcolor: config.bg,
                    color: config.color
                }
            }}
        />
    );
}

/** Como o app trata a habilidade de classe ou subclasse (ver `utils/combat/passives`) */
const MODE_LABEL: Record<PassiveDef['mode'], { label: string; hint: string }> = {
    automatica: { label: 'Automática', hint: 'O app aplica sozinho nas rolagens e no combate.' },
    ativada: { label: 'Ativada', hint: 'Aparece como quadrado na seção Ações, em combate: o app gasta o MP e a ação e conta os usos.' },
    texto: { label: 'Só texto', hint: 'O app só mostra a descrição; quem aplica é o mestre.' }
};

/** A habilidade está na lista de classe ou de subclasse da ficha (as outras, como linhagem e bônus, não são passivas de combate) */
function skillSource(skills: { class?: unknown; subclass?: unknown } | undefined, name: string): PassiveSource | null {
    if (normalizeToArray<{ name?: string }>(skills?.class).some(skill => skill?.name === name)) return 'class';
    if (normalizeToArray<{ name?: string }>(skills?.subclass).some(skill => skill?.name === name)) return 'subclass';
    return null;
}

interface SkillsSectionProps {
    selectedSkillType: SkillType;
    setSelectedSkillType: (type: SkillType) => void;
}

export default function SkillsSection({ selectedSkillType, setSelectedSkillType }: SkillsSectionProps): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    
    const filteredSkills = selectedSkillType === SkillType.ALL
        ? Object.values(charsheet.skills).flat()
        : charsheet.skills[selectedSkillType] || [];
    
    const [ expandedSkill, setExpandedSkill ] = useState<string | false>(false)

    const getSkillTypeCount = (type: SkillType) => {
        if (type === SkillType.ALL) {
            return Object.values(charsheet.skills).flat().length;
        }
        return charsheet.skills[type]?.length || 0;
    };

    const getSkillTypeColor = (type: SkillType) => {
        switch (type) {
        case SkillType.CLASS:
            return color.success;
        case SkillType.LINEAGE:
            return color.inkMuted;
        case SkillType.POWERS:
            return color.danger;
        case SkillType.BONUS:
            return color.warning;
        default:
            return color.amber;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper 
                elevation={2}
                sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
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
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                    border: '2px solid',
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.38)
                                }}
                            >
                                <Star sx={{ color: 'primary.main', fontSize: '2rem' }} />
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
                        
                        {/* <Tooltip title="Abrir árvore de habilidades">
                            <Button 
                                variant="contained" 
                                startIcon={<AccountTree />}
                                onClick={() => setTreeModalOpen(true)}
                                sx={{
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    }
                                }}
                            >
                                Árvore de Habilidades
                            </Button>
                        </Tooltip> */}
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
                                                bgcolor: 'background.raised',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'border-color 120ms',
                                                '&:hover': {
                                                    borderColor: alpha(getSkillTypeColor(selectedSkillType), 0.38)
                                                }
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                {/* Como o app trata a habilidade (classe e subclasse) */}
                                                {(() => {
                                                    const source = charsheet.systemId ? null : skillSource(charsheet.skills, skill.name);
                                                    if (!source) return null;
                                                    const def = findPassive(source, skill.name);
                                                    const mode = MODE_LABEL[def?.mode ?? 'texto'];
                                                    return (
                                                        <Box>
                                                            <Tooltip title={mode.hint}>
                                                                <Chip size="small" variant="outlined" label={mode.label} data-testid="skill-mode" sx={{ fontWeight: 600 }} />
                                                            </Tooltip>
                                                            {def?.pending && (
                                                                <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.75 }}>
                                                                    Fora do automático: {def.pending}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    );
                                                })()}

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
                                                                        bgcolor: alpha(getSkillTypeColor(selectedSkillType), 0.12)
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
                {/* 
                <SkillsTreeDialog
                    open={treeModalOpen}
                    onClose={() => setTreeModalOpen(false)}
                    charsheet={charsheet}
                /> */}
            </Paper>
        </Box>
    );
}
