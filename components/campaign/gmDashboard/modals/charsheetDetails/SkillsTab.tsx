import { Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Skill } from '@models';
import { normalizeToArray } from './normalizeToArray';
import type { CharsheetTabProps } from './types';

/** Aba "Habilidades": habilidades de classe, subclasse, linhagem e bônus */
export default function SkillsTab({ charsheet, editedData, isEditing, updateNestedField }: CharsheetTabProps) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Habilidades de Classe ({editedData.skills?.class?.length || charsheet.skills.class.length})</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Nível</TableCell>
                                <TableCell>Descrição</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizeToArray<Skill>(editedData.skills?.class || charsheet.skills.class).map((skill, index) => (
                                <TableRow key={index}>
                                    <TableCell>{skill.name}</TableCell>
                                    <TableCell>{skill.level ?? '—'}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {skill.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentClassSkills = normalizeToArray<Skill>(editedData.skills?.class || charsheet.skills.class);
                                                    const newClassSkills = [ ...currentClassSkills ];
                                                    newClassSkills.splice(index, 1);
                                                    updateNestedField('skills.class', newClassSkills);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            {(editedData.skills?.subclass || charsheet.skills.subclass).length > 0 && (
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Habilidades de Subclasse ({editedData.skills?.subclass?.length || charsheet.skills.subclass.length})</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Nível</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    {isEditing && <TableCell>Ações</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {normalizeToArray<Skill>(editedData.skills?.subclass || charsheet.skills.subclass).map((skill, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.level ?? '—'}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {skill.description || '—'}
                                            </Typography>
                                        </TableCell>
                                        {isEditing && (
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        const currentSubclassSkills = normalizeToArray<Skill>(editedData.skills?.subclass || charsheet.skills.subclass);
                                                        const newSubclassSkills = [ ...currentSubclassSkills ];
                                                        newSubclassSkills.splice(index, 1);
                                                        updateNestedField('skills.subclass', newSubclassSkills);
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            )}

            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Habilidades de Linhagem ({editedData.skills?.lineage?.length || charsheet.skills.lineage?.length})</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Origem</TableCell>
                                <TableCell>Descrição</TableCell>
                                {isEditing && <TableCell>Ações</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizeToArray<Skill>(editedData.skills?.lineage || charsheet.skills.lineage).map((skill, index) => (
                                <TableRow key={index}>
                                    <TableCell>{skill.name}</TableCell>
                                    <TableCell>{skill.origin ?? '—'}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {skill.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    {isEditing && (
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const currentLineageSkills = normalizeToArray<Skill>(editedData.skills?.lineage || charsheet.skills.lineage);
                                                    const newLineageSkills = [ ...currentLineageSkills ];
                                                    newLineageSkills.splice(index, 1);
                                                    updateNestedField('skills.lineage', newLineageSkills);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            {(editedData.skills?.bonus || charsheet.skills.bonus)?.length > 0 && (
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Habilidades Bônus ({editedData.skills?.bonus?.length || charsheet.skills.bonus?.length})</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Origem</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    {isEditing && <TableCell>Ações</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {normalizeToArray<Skill>(editedData.skills?.bonus || charsheet.skills.bonus).map((skill, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.origin ?? '—'}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {skill.description || '—'}
                                            </Typography>
                                        </TableCell>
                                        {isEditing && (
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        const currentBonusSkills = normalizeToArray<Skill>(editedData.skills?.bonus || charsheet.skills.bonus);
                                                        const newBonusSkills = [ ...currentBonusSkills ];
                                                        newBonusSkills.splice(index, 1);
                                                        updateNestedField('skills.bonus', newBonusSkills);
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            )}
        </Grid>
    );
}
