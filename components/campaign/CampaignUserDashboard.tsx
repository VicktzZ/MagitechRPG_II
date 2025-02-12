'use client';

import { type ReactElement } from 'react';
import { Box, Paper, Typography, Grid, Divider, Chip, LinearProgress, Avatar } from '@mui/material';
import { useCampaignContext } from '@contexts/campaignContext';
import { useGameMasterContext } from '@contexts/gameMasterContext';
// import { formatMoney } from '@utils/formatters';

export default function CampaignUserDashboard(): ReactElement | null {
    const { isUserGM } = useGameMasterContext();
    const { campaign } = useCampaignContext();
    const ficha = campaign.myFicha;

    if (isUserGM || !ficha) return null;

    // Calcula as porcentagens para as barras de progresso
    const lpPercent = (ficha.attributes.lp / ficha.attributes.lp) * 100;
    const mpPercent = (ficha.attributes.mp / ficha.attributes.mp) * 100;
    const apPercent = (ficha.attributes.ap / ficha.attributes.ap) * 100;

    return (
        <Box sx={{ 
            width: '100%'
        }}>
            <Grid container spacing={2}>
                {/* Cabeçalho com informações básicas */}
                <Grid item xs={12}>
                    <Paper sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper2', 
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 2,
                            flexWrap: { xs: 'wrap', md: 'nowrap' }
                        }}>
                            <Avatar
                                src={ficha.name ?? '/assets/default-avatar.png'}
                                alt={ficha.name}
                                sx={{ 
                                    width: { xs: 60, md: 80 }, 
                                    height: { xs: 60, md: 80 }
                                }}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" gutterBottom>
                                    {ficha.name}
                                </Typography>
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 1, 
                                    flexWrap: 'wrap',
                                    mb: 2
                                }}>
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
                        <Grid container spacing={2}>
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

                {/* Atributos */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper2', 
                        borderRadius: 2,
                        height: '100%'
                    }}>
                        <Typography variant="h6" gutterBottom>
                            Atributos
                        </Typography>
                        <Grid container spacing={2}>
                            {Object.entries(ficha.attributes).map(([ key, value ]) => (
                                <Grid item xs={6} sm={4} key={key}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            bgcolor: 'background.paper3',
                                            borderRadius: 1
                                        }}
                                    >
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
                    </Paper>
                </Grid>

                {/* Dinheiro e Traços */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper2', 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Dinheiro
                            </Typography>
                            <Typography variant="h5" color="primary">
                                {ficha.inventory.money}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Traços
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 1,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
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
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}