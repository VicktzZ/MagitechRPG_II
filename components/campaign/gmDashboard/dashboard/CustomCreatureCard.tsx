import type { Creature } from '@models';
import { Delete as DeleteIcon, Edit as EditIcon, Pets, Search as SearchIcon } from '@mui/icons-material';
import { Avatar, Box, Chip, IconButton, Paper, Tooltip, Typography, alpha } from '@mui/material';
import { color } from '@themes/tokens';
import type { ReactElement } from 'react';

interface CustomCreatureCardProps {
    creature: Creature;
    onView: (creature: Creature) => void;
    onEdit: (creature: Creature) => void;
    onDelete: (creatureId: string, creatureName: string) => void;
}

/** Cartão de uma criatura customizada da campanha: resumo (nível, LP, MP, habilidades, magias) e ações de ver, editar e excluir */
export default function CustomCreatureCard({ creature, onView, onEdit, onDelete }: CustomCreatureCardProps): ReactElement {
    return (
        <Paper
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.raised'
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                        src={creature.imageUrl || undefined}
                        sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14), color: 'warning.main' }}
                    >
                        <Pets />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {creature.name}
                            {creature.type && (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    {creature.type}
                                </Typography>
                            )}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                            <Chip
                                label={`Nível ${creature.level}`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }}
                            />
                            <Chip 
                                label={`LP: ${creature.stats?.lp || 0}`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.75rem', bgcolor: alpha(color.lp, 0.14), color: 'error.light' }} 
                            />
                            <Chip 
                                label={`MP: ${creature.stats?.mp || 0}`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.75rem', bgcolor: alpha(color.mp, 0.14), color: color.mp }} 
                            />
                            {creature.skills != null && creature.skills.length > 0 && (
                                <Chip 
                                    label={`${creature.skills.length} habilidade(s)`} 
                                    size="small" 
                                    sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }} 
                                />
                            )}
                            {creature.spells != null && creature.spells.length > 0 && (
                                <Chip 
                                    label={`${creature.spells.length} magia(s)`} 
                                    size="small" 
                                    sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.info.main, 0.14), color: 'info.main' }} 
                                />
                            )}
                        </Box>
                        {creature.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {creature.description}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Tooltip title="Ver detalhes da criatura">
                        <IconButton
                            size="small"
                            onClick={() => onView(creature)}
                            sx={{ 
                                color: 'info.main',
                                '&:hover': { 
                                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
                                    color: 'info.light'
                                }
                            }}
                        >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar criatura">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(creature)}
                            sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                    color: 'primary.light'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir criatura">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(creature.id, creature.name)}
                            sx={{ 
                                color: 'error.main',
                                '&:hover': { 
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.14),
                                    color: 'error.light'
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );
}
