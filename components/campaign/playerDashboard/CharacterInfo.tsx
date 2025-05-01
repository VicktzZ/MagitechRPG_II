/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { RPGIcon } from '@components/misc';
import { useCampaignContext } from '@contexts/campaignContext';
import { Avatar, Box, Button, Chip, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { blue, deepPurple, green, orange, red, teal } from '@mui/material/colors';
import { useState, type ReactElement } from 'react';

const attributeIcons = {
    vig: {
        color: red[500],
        icon: 'health',
        filter: 'invert(32%) sepia(55%) saturate(3060%) hue-rotate(343deg) brightness(99%) contrast(93%)'
    },
    foc: {
        color: blue[500],
        icon: 'potion',
        filter: 'invert(42%) sepia(99%) saturate(584%) hue-rotate(169deg) brightness(101%) contrast(99%)'
    },
    des: {
        color: orange[500],
        icon: 'shield',
        filter: 'invert(57%) sepia(63%) saturate(723%) hue-rotate(357deg) brightness(99%) contrast(107%)'
    },
    log: {
        color: teal[500],
        icon: 'book',
        filter: 'invert(53%) sepia(48%) saturate(7320%) hue-rotate(150deg) brightness(89%) contrast(101%)'
    },
    sab: {
        color: deepPurple[500],
        icon: 'pawprint',
        filter: 'invert(19%) sepia(90%) saturate(2394%) hue-rotate(253deg) brightness(90%) contrast(84%)'
    },
    car: {
        color: green[500],
        icon: 'aura',
        filter: 'invert(60%) sepia(41%) saturate(642%) hue-rotate(73deg) brightness(91%) contrast(85%)'
    }
} as const;

interface CharacterInfoProps {
    avatar: string;
}

export default function CharacterInfo({ avatar }: CharacterInfoProps): ReactElement {    
    const { campaign: { myFicha: ficha }, setFichaUpdated } = useCampaignContext()
    if (!ficha) return <></>;

    const [ currentAttributes, setCurrentAttributes ] = useState({
        lp: ficha.attributes.lp,
        mp: ficha.attributes.mp,
        ap: ficha.attributes.ap
    });

    const setAttribute = (attr: 'lp' | 'mp' | 'ap', num: number) => {
        setCurrentAttributes(prev => {
            ficha.attributes[attr] = prev[attr] + num;
            
            return {
                ...prev,
                [attr]: prev[attr] + num
            }
        });

        setFichaUpdated(true);
    }

    const lpPercent = (currentAttributes.lp / ficha.maxLp) * 100;
    const mpPercent = (currentAttributes.mp / ficha.maxMp) * 100;
    const apPercent = (currentAttributes.ap / ficha.maxAp) * 100;
    const attributes = Object.entries(ficha.attributes).filter(([ key ]) => ![ 'lp', 'mp', 'ap' ].includes(key));

    function AttributeBar({ attributeValue }: { attributeValue: number }) {
        const bars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = attributeValue >= i;
            bars.push(
                <Box 
                    key={i}
                    sx={{
                        width: '1.5rem',
                        height: '2rem',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        bgcolor: (i === 1 && attributeValue === -1) ? red[500] : filled ? green[500] : 'transparent',
                        borderRadius: 1
                    }} 
                />
            );
        }
        return bars;
    }

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
                            <Box display="flex" gap={1} mt={1}>
                                {ficha.status?.map((status, index) => (
                                    <Chip
                                        key={index}
                                        label={status.name}
                                        color={status.type === 'buff' ? 'success' : status.type === 'debuff' ? 'error' : 'default'}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Barras de Status */}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <Box>
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
                                    {currentAttributes.lp}/{ficha.maxLp}
                                </Typography>
                            </Box>
                            <Box display='flex' alignItems='center' gap={1}>
                                <Button variant="contained" size="small" onClick={() => setAttribute('lp', 1)}>+1</Button>
                                <Button variant="contained" size="small" onClick={() => setAttribute('lp', -1)}>-1</Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
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
                                    {currentAttributes.mp}/{ficha.maxMp}
                                </Typography>
                            </Box>
                            <Box display='flex' alignItems='center' gap={1}>
                                <Button variant="contained" size="small" onClick={() => setAttribute('mp', 1)}>+1</Button>
                                <Button variant="contained" size="small" onClick={() => setAttribute('mp', -1)}>-1</Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
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
                                    {currentAttributes.ap}/{ficha.maxAp}
                                </Typography>
                                <Box display='flex' alignItems='center' gap={1}>
                                    <Button variant="contained" size="small" onClick={() => setAttribute('ap', 1)}>+1</Button>
                                    <Button variant="contained" size="small" onClick={() => setAttribute('ap', -1)}>-1</Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Atributos e Traços */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2, minHeight: '100%', display: 'flex', gap: 3 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Atributos
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {attributes.map(([ key, value ]) => (
                                <Box 
                                    key={key}
                                    display='flex'
                                    justifyContent='space-between'
                                    alignItems='center'
                                    width='100%'
                                >
                                    <Box width='100%' display='flex' flexDirection='column' gap={1} justifyContent='space-between'>
                                        <Box width='18rem' maxWidth='18rem' display='flex' gap={2} alignItems='center' justifyContent='space-between'>
                                            <Box width='100%' display='flex' gap={1} alignItems='center' justifyContent='space-evenly' letterSpacing={3}>
                                                <Box>
                                                    {key.toUpperCase()}
                                                </Box>
                                                {attributeIcons[key as keyof typeof attributeIcons] && (
                                                    <Box sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        p: 0.5,
                                                        borderRadius: 5,
                                                        backgroundColor: `${attributeIcons[key as keyof typeof attributeIcons].color}50`
                                                    }}>
                                                        <RPGIcon
                                                            icon={attributeIcons[key as keyof typeof attributeIcons].icon}
                                                            sx={{ 
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                filter: attributeIcons[key as keyof typeof attributeIcons].filter
                                                            }} 
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box width='100%' justifyContent='center' display='flex' gap={1}>
                                                <AttributeBar attributeValue={value } />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box>
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
                    </Box>
                </Paper>
            </Grid>
        </>
    );
}
