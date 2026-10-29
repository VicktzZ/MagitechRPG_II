/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { RPGIcon } from '@components/misc';
import ElementIcon from '@components/misc/ElementIcon';
import { classColor } from '@constants';
import { attributeIcons } from '@constants/charsheet';
import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { ClassNames } from '@models/types/string';
import {
    Psychology,
    Shield,
    Star
} from '@mui/icons-material';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import { useState, type ReactElement } from 'react';

interface CharacterInfoProps {
    avatar: string;
}

export default function CharacterInfo({ avatar }: CharacterInfoProps): ReactElement {    
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    
    const [ currentAttributes, setCurrentAttributes ] = useState({
        lp: charsheet.stats.lp,
        mp: charsheet.stats.mp,
        ap: charsheet.stats.ap
    });

    const setAttribute = (attr: 'lp' | 'mp' | 'ap', num: number, max?: number) => {
        let newValue = currentAttributes[attr] + num;

        if (max) {
            newValue = max;
        }

        setCurrentAttributes(prev => ({
            ...prev,
            [attr]: newValue
        }));

        // Atualizar no Firestore em tempo real
        updateCharsheet({
            stats: {
                ...charsheet.stats,
                [attr]: newValue
            }
        });
    }

    const lpPercent = (currentAttributes.lp / charsheet.stats.maxLp) * 100;
    const mpPercent = (currentAttributes.mp / charsheet.stats.maxMp) * 100;
    const apPercent = (currentAttributes.ap / charsheet.stats.maxAp) * 100;
    const classMarkColor = classColor[charsheet.class as ClassNames] ?? color.borderControl;
    const attributes = Object.entries(charsheet.stats).filter(([ key ]) => ![ 'lp', 'mp', 'ap' ].includes(key));

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
                        bgcolor: (i === 1 && attributeValue === -1) ? 'error.main' : filled ? 'success.main' : 'transparent',
                        borderRadius: 1
                    }} 
                />
            );
        }
        return bars;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={3}>
                {/* Informações Básicas */}
                <Box 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}
                >
                    <Avatar
                        src={avatar}
                        alt={charsheet.name}
                        sx={{ 
                            width: { xs: 80, md: 100 }, 
                            height: { xs: 80, md: 100 },
                            border: '3px solid',
                            borderColor: 'primary.main'
                        }}
                    />
                    <Stack spacing={2} flex={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700,
                                textAlign: { xs: 'center', sm: 'left' },
                                color: 'text.primary'
                            }}
                        >
                            {charsheet.name}
                        </Typography>
                        
                        <Stack 
                            direction="row" 
                            spacing={1} 
                            flexWrap="wrap"
                            justifyContent={{ xs: 'center', sm: 'flex-start' }}
                            sx={{ gap: 1 }}
                        >
                            <Chip 
                                icon={<Star />}
                                label={`Nível ${charsheet.level}`} 
                                color="primary" 
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                                label={charsheet.lineage as unknown as string} 
                                sx={{ 
                                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
                                    color: 'info.main',
                                    fontWeight: 600
                                }}
                            />
                            <Chip 
                                icon={<Shield />}
                                label={charsheet.class as string} 
                                sx={{ 
                                    bgcolor: alpha(classMarkColor, 0.16),
                                    color: 'text.primary',
                                    border: '1px solid',
                                    borderColor: classMarkColor,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: classMarkColor }
                                }}
                            />
                            {charsheet.subclass && (
                                <Chip 
                                    icon={<Psychology />}
                                    label={charsheet.subclass as string}
                                    sx={{ 
                                        bgcolor: 'background.raised',
                                        color: 'text.primary',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'inherit' }
                                    }}
                                />
                            )}
                            {charsheet.elementalMastery && (
                                <Chip 
                                    icon={<ElementIcon element={charsheet.elementalMastery} colored />}
                                    label={`Maestria: ${charsheet.elementalMastery}`} 
                                    sx={{ 
                                        bgcolor: 'background.raised',
                                        color: 'text.primary',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        fontWeight: 600
                                    }}
                                />
                            )}
                        </Stack>
                        {charsheet.status && charsheet.status.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                {charsheet.status.map((status, index) => (
                                    <Chip
                                        key={index}
                                        label={status as unknown as string}
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                        sx={{ 
                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.14),
                                            color: 'error.main',
                                            fontWeight: 600
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ opacity: 0.6 }} />

                <LinearProgress
                    variant="determinate"
                    value={lpPercent}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'background.default',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: 'error.main'
                        }
                    }}
                />
                <Typography variant="caption">
                    {currentAttributes.lp}/{charsheet.stats.maxLp}
                </Typography>
                <Box display='flex' alignItems='center' gap={1}>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', 1)}>+1</Button>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', -1)}>-1</Button>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', 0, charsheet.stats.maxLp)}>MAX</Button>
                </Box>
                <Grid item xs={12} md={4}>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>MP</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={mpPercent}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: 'background.default',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: 'primary.main'
                                }
                            }}
                        />
                        <Typography variant="caption">
                            {currentAttributes.mp}/{charsheet.stats.maxMp}
                        </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={1}>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', 1)}>+1</Button>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', -1)}>-1</Button>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', 0, charsheet.stats.maxMp)}>MAX</Button>
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
                                bgcolor: 'background.default',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: 'warning.main'
                                }
                            }}
                        />
                        <Typography variant="caption">
                            {currentAttributes.ap}/{charsheet.stats.maxAp}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', 1)}>+1</Button>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', -1)}>-1</Button>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', 0, charsheet.stats.maxAp)}>MAX</Button>
                        </Box>
                    </Box>
                </Grid>
            </Stack>

            {/* Atributos e Traços */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.raised', borderRadius: 2, minHeight: '100%', display: 'flex', gap: 3 }}>
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
                                                        backgroundColor: alpha(attributeIcons[key as keyof typeof attributeIcons].color, 0.31)
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
                            {charsheet.traits.map((trait) => (
                                <Chip
                                    key={trait as unknown as string}
                                    label={trait as unknown as string}
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'background.default',
                                        '&:hover': {
                                            bgcolor: 'background.default'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Box>
    );
}
