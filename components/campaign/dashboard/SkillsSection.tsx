'use client';

import { type ReactElement } from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { SkillType } from '@enums';

interface SkillFilterChipProps {
    label: string;
    type: SkillType;
    selected: boolean;
    onClick: () => void;
}

function SkillFilterChip({ label, type, selected, onClick }: SkillFilterChipProps) {
    return (
        <Chip
            label={label}
            onClick={onClick}
            color={selected ? 'primary' : 'default'}
            sx={{
                transition: '.1s ease-in-out',
                '&:hover': {
                    filter: 'brightness(0.9)'
                }
            }}
        />
    );
}

interface SkillsSectionProps {
    ficha: any;
    selectedSkillType: SkillType;
    setSelectedSkillType: (type: SkillType) => void;
}

export default function SkillsSection({ ficha, selectedSkillType, setSelectedSkillType }: SkillsSectionProps): ReactElement {
    const filteredSkills = selectedSkillType === SkillType.ALL
        ? Object.values(ficha.skills).flat()
        : ficha.skills[selectedSkillType] || [];

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Habilidades
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <SkillFilterChip
                        label="Todas"
                        type={SkillType.ALL}
                        selected={selectedSkillType === SkillType.ALL}
                        onClick={() => setSelectedSkillType(SkillType.ALL)}
                    />
                    <SkillFilterChip
                        label="Classe"
                        type={SkillType.CLASS}
                        selected={selectedSkillType === SkillType.CLASS}
                        onClick={() => setSelectedSkillType(SkillType.CLASS)}
                    />
                    <SkillFilterChip
                        label="Linhagem"
                        type={SkillType.LINEAGE}
                        selected={selectedSkillType === SkillType.LINEAGE}
                        onClick={() => setSelectedSkillType(SkillType.LINEAGE)}
                    />
                    <SkillFilterChip
                        label="Poderes"
                        type={SkillType.POWERS}
                        selected={selectedSkillType === SkillType.POWERS}
                        onClick={() => setSelectedSkillType(SkillType.POWERS)}
                    />
                    <SkillFilterChip
                        label="Bônus"
                        type={SkillType.BONUS}
                        selected={selectedSkillType === SkillType.BONUS}
                        onClick={() => setSelectedSkillType(SkillType.BONUS)}
                    />
                </Box>

                <Grid container spacing={2}>
                    {filteredSkills.map((skill: any) => (
                        <Grid item xs={12} sm={6} key={skill.name}>
                            <Paper sx={{ p: 1.5, bgcolor: 'background.paper3' }}>
                                <Typography variant="subtitle2">
                                    {skill.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {skill.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Grid>
    );
}
