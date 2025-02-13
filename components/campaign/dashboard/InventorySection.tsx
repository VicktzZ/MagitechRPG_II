'use client';

import { type ReactElement } from 'react';
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { rarityColor } from '@constants';
import type { Ficha, RarityType } from '@types';

interface InventorySectionProps {
    ficha: Ficha;
}

export default function InventorySection({ ficha }: InventorySectionProps): ReactElement {
    const renderInventoryItem = (item: any, type: 'weapon' | 'armor' | 'item') => {
        const getItemDetails = () => {
            switch (type) {
                case 'weapon':
                    return `Dano: ${item.effect.value} | Tipo: ${item.type}`;
                case 'armor':
                    return `Defesa: ${item.defense} | Tipo: ${item.type}`;
                case 'item':
                    return item.description;
            }
        };

        return (
            <Grid item xs={12} sm={6} key={item.name}>
                <Accordion
                    sx={{
                        bgcolor: 'background.paper3',
                        '&:before': { display: 'none' },
                        boxShadow: 'none'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            minHeight: 48,
                            '& .MuiAccordionSummary-content': {
                                alignItems: 'center',
                                gap: 1
                            }
                        }}
                    >
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto', mr: 2 }}>
                            {item.rarity && (
                                <Chip
                                    label={item.rarity}
                                    size="small"
                                    sx={{
                                        bgcolor: rarityColor[item.rarity as RarityType],
                                        color: 'white'
                                    }}
                                />
                            )}
                            {type === 'weapon' && (
                                <Chip
                                    label={`${item.effect.value} dano`}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                />
                            )}
                            {type === 'armor' && (
                                <Chip
                                    label={`${item.defense} defesa`}
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                />
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2">
                            {type !== 'item' && getItemDetails()}
                        </Typography>
                        {item.description && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    Descrição
                                </Typography>
                                <Typography variant="body2">
                                    {item.description}
                                </Typography>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Grid>
        );
    };

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Inventário
                </Typography>

                {/* Armas */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Armas
                    </Typography>
                    <Grid container spacing={1}>
                        {ficha.inventory.weapons.map((weapon) => renderInventoryItem(weapon, 'weapon'))}
                    </Grid>
                </Box>

                {/* Armaduras */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Armaduras
                    </Typography>
                    <Grid container spacing={1}>
                        {ficha.inventory.armors.map((armor) => renderInventoryItem(armor, 'armor'))}
                    </Grid>
                </Box>

                {/* Itens */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Itens
                    </Typography>
                    <Box sx={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        bgcolor: 'background.paper3',
                        borderRadius: 1,
                        p: 1
                    }}>
                        <Grid container spacing={1}>
                            {ficha.inventory.items.map((item) => renderInventoryItem(item, 'item'))}
                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );
}
