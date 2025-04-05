'use client';

import { useState, type ReactElement } from 'react';
import { Box, Typography, Paper, Chip, Grid, Button } from '@mui/material';
import { SkillType } from '@enums';
import SkillsTreeDialog from '@components/ficha/SkillsTreeDialog';
import Masonry from '@mui/lab/Masonry';

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

    const [ treeModalOpen, setTreeModalOpen ] = useState(false)

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2, minHeight: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6">
                        Habilidades
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setTreeModalOpen(true)}>
                        Árvore de Habilidades
                    </Button>
                </Box>

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

                <Masonry columns={{ xs: 1, sm: 2 }} spacing={2}>
                    {filteredSkills.map((skill: any) => (
                        <Paper 
                            key={skill.name}
                            sx={{ 
                                p: 1.5, 
                                bgcolor: 'background.paper3',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => theme.shadows[4]
                                }
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold">
                                {skill.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {skill.description}
                            </Typography>
                        </Paper>
                    ))}
                </Masonry>

                <SkillsTreeDialog
                    open={treeModalOpen}
                    onClose={() => setTreeModalOpen(false)}
                    ficha={ficha}
                />
            </Paper>
        </Grid>
    );
}
