/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { RPGIcon } from '@components/misc';
import { attributeIcons } from '@constants/ficha';
import { useCampaignCurrentFichaContext } from '@contexts';
import { 
    Avatar, 
    Box, 
    Chip, 
    LinearProgress, 
    Paper, 
    Typography,
    Stack,
    Divider,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Grid,
    Button
} from '@mui/material';
import { 
    Add, 
    Remove, 
    Refresh,
    Star,
    LocalFireDepartment,
    Psychology,
    Shield
} from '@mui/icons-material';
import { green, red, blue, orange, purple } from '@mui/material/colors';
import { useState, type ReactElement } from 'react';

interface CharacterInfoProps {
    avatar: string;
}

export default function CharacterInfo({ avatar }: CharacterInfoProps): ReactElement {    
    const { ficha, updateFicha } = useCampaignCurrentFichaContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const fichaCopy = { ...ficha };

    const [ currentAttributes, setCurrentAttributes ] = useState({
        lp: ficha.attributes.lp,
        mp: ficha.attributes.mp,
        ap: ficha.attributes.ap
    });

    const setAttribute = (attr: 'lp' | 'mp' | 'ap', num: number, max?: number) => {
        
        setCurrentAttributes(prev => {
            fichaCopy.attributes[attr] = prev[attr] + num;
            if (max) fichaCopy.attributes[attr] = max;
            
            return {
                ...prev,
                [attr]: ficha.attributes[attr]
            }
        });

        updateFicha(fichaCopy);
    }

    const lpPercent = (currentAttributes.lp / ficha.attributes.maxLp) * 100;
    const mpPercent = (currentAttributes.mp / ficha.attributes.maxMp) * 100;
    const apPercent = (currentAttributes.ap / ficha.attributes.maxAp) * 100;
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
                        alt={ficha.name}
                        sx={{ 
                            width: { xs: 80, md: 100 }, 
                            height: { xs: 80, md: 100 },
                            border: '3px solid',
                            borderColor: 'primary.main',
                            boxShadow: 3
                        }}
                    />
                    <Stack spacing={2} flex={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700,
                                textAlign: { xs: 'center', sm: 'left' },
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {ficha.name}
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
                                label={`Nível ${ficha.level}`} 
                                color="primary" 
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                                label={ficha.lineage as unknown as string} 
                                sx={{ 
                                    bgcolor: blue[100],
                                    color: blue[800],
                                    fontWeight: 600
                                }}
                            />
                            <Chip 
                                icon={<Shield />}
                                label={ficha.class as string} 
                                sx={{ 
                                    bgcolor: green[100],
                                    color: green[800],
                                    fontWeight: 600
                                }}
                            />
                            {ficha.subclass && (
                                <Chip 
                                    icon={<Psychology />}
                                    label={ficha.subclass as string}
                                    sx={{ 
                                        bgcolor: orange[100],
                                        color: orange[800],
                                        fontWeight: 600
                                    }}
                                />
                            )}
                            {ficha.elementalMastery && (
                                <Chip 
                                    icon={<LocalFireDepartment />}
                                    label={`Maestria: ${ficha.elementalMastery}`} 
                                    sx={{ 
                                        bgcolor: purple[100],
                                        color: purple[800],
                                        fontWeight: 600
                                    }}
                                />
                            )}
                        </Stack>
                        {ficha.status && ficha.status.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                {ficha.status.map((status, index) => (
                                    <Chip
                                        key={index}
                                        label={status as unknown as string}
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                        sx={{ 
                                            bgcolor: red[100],
                                            color: red[800],
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
                        bgcolor: 'background.paper3',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: 'error.main'
                        }
                    }}
                />
                <Typography variant="caption">
                    {currentAttributes.lp}/{ficha.attributes.maxLp}
                </Typography>
                <Box display='flex' alignItems='center' gap={1}>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', 1)}>+1</Button>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', -1)}>-1</Button>
                    <Button variant="contained" size="small" onClick={() => setAttribute('lp', 0, ficha.attributes.maxLp)}>MAX</Button>
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
                                bgcolor: 'background.paper3',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: 'primary.main'
                                }
                            }}
                        />
                        <Typography variant="caption">
                            {currentAttributes.mp}/{ficha.attributes.maxMp}
                        </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={1}>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', 1)}>+1</Button>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', -1)}>-1</Button>
                        <Button variant="contained" size="small" onClick={() => setAttribute('mp', 0, ficha.attributes.maxMp)}>MAX</Button>
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
                            {currentAttributes.ap}/{ficha.attributes.maxAp}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', 1)}>+1</Button>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', -1)}>-1</Button>
                            <Button variant="contained" size="small" onClick={() => setAttribute('ap', 0, ficha.attributes.maxAp)}>MAX</Button>
                        </Box>
                    </Box>
                </Grid>
            </Stack>

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
        </Box>
    );
}
