'use client';

import { type ReactElement } from 'react';
import { Box, Typography, Paper, Avatar, LinearProgress, Grid, Chip, Divider } from '@mui/material';
import type { Ficha } from '@types';

interface CharacterInfoProps {
    ficha: Ficha;
    avatar: string;
}

export default function CharacterInfo({ ficha, avatar }: CharacterInfoProps): ReactElement {
    const lpPercent = (ficha.attributes.lp / ficha.attributes.lp) * 100;
    const mpPercent = (ficha.attributes.mp / ficha.attributes.mp) * 100;
    const apPercent = (ficha.attributes.ap / ficha.attributes.ap) * 100;
    const attributes = Object.entries(ficha.attributes).filter(([ key ]) => ![ 'lp', 'mp', 'ap' ].includes(key));

    return (
        <>
            {/* Cabeçalho com informações básicas */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                        <Avatar
                            src={avatar}
                            alt={ficha.name}
                            sx={{ width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 } }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" gutterBottom>
                                {ficha.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip label={`Nível ${ficha.level}`} color="primary" />
                                <Chip label={ficha.lineage as unknown as string} />
                                <Chip label={ficha.class as string} />
                                {ficha.subclass && <Chip label={ficha.subclass as string} />}
                                {ficha.elementalMastery && (
                                    <Chip label={`Maestria: ${ficha.elementalMastery}`} color="secondary" />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Barras de Status */}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>LP</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={lpPercent}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'background.paper3',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: 'error.main'
                                    }
                                }}
                            />
                            <Typography variant="caption">
                                {ficha.attributes.lp}/{ficha.attributes.lp}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>MP</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={mpPercent}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'background.paper3',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: 'primary.main'
                                    }
                                }}
                            />
                            <Typography variant="caption">
                                {ficha.attributes.mp}/{ficha.attributes.mp}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>AP</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={apPercent}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'background.paper3',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: 'warning.main'
                                    }
                                }}
                            />
                            <Typography variant="caption">
                                {ficha.attributes.ap}/{ficha.attributes.ap}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Atributos e Traços */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2, minHeight: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Atributos
                    </Typography>
                    <Grid container spacing={2}>
                        {attributes.map(([ key, value ]) => (
                            <Grid item xs={6} sm={4} key={key}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    bgcolor: 'background.paper3',
                                    borderRadius: 1
                                }}>
                                    <Typography variant="subtitle2" sx={{ minWidth: 40 }}>
                                        {key.toUpperCase()}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {value}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Traços
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {ficha.traits.map((trait) => (
                            <Chip
                                key={trait as unknown as string}
                                label={trait as unknown as string}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'background.paper3',
                                    '&:hover': {
                                        bgcolor: 'background.paper4'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
            </Grid>
        </>
    );
}
