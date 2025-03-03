'use client';

import { type ReactElement, useState } from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, IconButton, TextField, Select, MenuItem, Button, Divider } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { AmmoType } from '@enums';
import type { AmmoControl, Ficha } from '@types';

interface MoneyAndAmmoProps {
    ficha: Ficha;
}

export default function MoneyAndAmmo({ ficha }: MoneyAndAmmoProps): ReactElement {
    const [ ammo, setAmmo ] = useState<AmmoControl>({
        type: AmmoType.BULLET,
        current: ficha.ammoCounter.current,
        max: ficha.ammoCounter.max
    });

    const ammoPercent = (ammo.current / ammo.max) * 100;

    const handleAmmoChange = (type: 'increment' | 'decrement') => {
        setAmmo(prev => ({
            ...prev,
            current: type === 'increment' 
                ? Math.min(prev.current + 1, prev.max)
                : Math.max(prev.current - 1, 0)
        }));
    };

    const handleMaxAmmoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(1, parseInt(event.target.value) || 1);
        setAmmo(prev => ({
            ...prev,
            max: newMax,
            current: Math.min(prev.current, newMax)
        }));
    };

    const handleAmmoTypeChange = (event: any) => {
        setAmmo(prev => ({
            ...prev,
            type: event.target.value
        }));
    };

    const handleReload = () => {
        setAmmo(prev => ({
            ...prev,
            current: prev.max
        }));
    };

    const getAmmoColor = (type: AmmoType): string => {
        switch (type) {
        case AmmoType.BULLET:
            return 'warning.main'; // Amarelo para balas
        case AmmoType.ARROW:
            return 'success.main'; // Verde para flechas
        case AmmoType.ENERGY:
            return 'info.main'; // Azul para energia
        case AmmoType.SPECIAL:
            return 'secondary.main'; // Roxo para especial
        default:
            return 'primary.main';
        }
    };

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Dinheiro
                    </Typography>
                    <Typography variant="h5" color="primary">
                        {ficha.inventory.money}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Munição
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Select
                            size="small"
                            value={ammo.type}
                            onChange={handleAmmoTypeChange}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value={AmmoType.BULLET}>Balas</MenuItem>
                            <MenuItem value={AmmoType.ARROW}>Flechas</MenuItem>
                            <MenuItem value={AmmoType.ENERGY}>Energia</MenuItem>
                            <MenuItem value={AmmoType.SPECIAL}>Especial</MenuItem>
                        </Select>
                        
                        <TextField
                            size="small"
                            label="Máximo"
                            type="number"
                            value={ammo.max}
                            onChange={handleMaxAmmoChange}
                            sx={{ width: 100 }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleReload}
                            disabled={ammo.current >= ammo.max}
                            size="small"
                            sx={{ ml: 'auto' }}
                        >
                            Recarregar
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            onClick={() => handleAmmoChange('decrement')}
                            disabled={ammo.current <= 0}
                            size="small"
                        >
                            <RemoveIcon />
                        </IconButton>

                        <Box sx={{ flex: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={ammoPercent}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'background.paper3',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: getAmmoColor(ammo.type as AmmoType)
                                    }
                                }}
                            />
                        </Box>

                        <IconButton 
                            onClick={() => handleAmmoChange('increment')}
                            disabled={ammo.current >= ammo.max}
                            size="small"
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                        {ammo.current} / {ammo.max}
                    </Typography>
                </Box>
            </Paper>
        </Grid>
    );
}
