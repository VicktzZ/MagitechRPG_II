import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { skillTypes } from './constants';
import type { CreatureData, SkillData } from './types';

interface SkillsTabProps {
    creatureData: CreatureData;
    isReadOnly: boolean;
    newSkill: Partial<SkillData>;
    setNewSkill: (update: (prev: Partial<SkillData>) => Partial<SkillData>) => void;
    addSkill: () => void;
    removeSkill: (id: string) => void;
    onOpenBank: () => void;
}

/** Aba "Habilidades": formulário de nova habilidade e lista das da criatura */
export default function SkillsTab({
    creatureData,
    isReadOnly,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    onOpenBank
}: SkillsTabProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700}>
                    Habilidades ({creatureData.skills.length})
                </Typography>
                <Button variant="outlined" size="small" startIcon={<Search />} onClick={onOpenBank} disabled={isReadOnly}>
                    Buscar do banco
                </Button>
            </Box>

            {!isReadOnly && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                            label="Nome"
                            value={newSkill.name}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                            size="small"
                            sx={{ flex: 1, minWidth: 150 }}
                        />
                        <TextField
                            label="Tipo"
                            select
                            value={newSkill.type}
                            onChange={(e) => setNewSkill(prev => ({ ...prev, type: e.target.value }))}
                            size="small"
                            SelectProps={{ native: true }}
                            sx={{ width: 150 }}
                        >
                            {skillTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                        </TextField>
                        <Button variant="contained" onClick={addSkill} disabled={!newSkill.name?.trim()} startIcon={<Add />}>
                            Adicionar
                        </Button>
                    </Box>
                    <TextField
                        label="Descrição"
                        value={newSkill.description}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mt: 1 }}
                    />
                </Paper>
            )}

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 260, overflow: 'auto' }}>
                {creatureData.skills.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        Nenhuma habilidade adicionada
                    </Typography>
                ) : (
                    <List dense>
                        {creatureData.skills.map(skill => (
                            <ListItem
                                key={skill.id}
                                secondaryAction={!isReadOnly && (
                                    <IconButton edge="end" onClick={() => removeSkill(skill.id)} color="error">
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight={600}>{skill.name}</Typography>
                                            <Chip label={skill.type} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
                                        </Box>
                                    }
                                    secondary={skill.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}
