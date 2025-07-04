/* eslint-disable max-len */
'use client';

import { rarityColor } from '@constants';
import { useCampaignCurrentFichaContext } from '@contexts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Masonry } from '@mui/lab';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Grid, Paper, Typography } from '@mui/material';
import type { RarityType } from '@types';
import { type ReactElement } from 'react';

export default function InventorySection(): ReactElement {
    const { ficha } = useCampaignCurrentFichaContext();

    const renderInventoryItem = (item: any, type: 'weapon' | 'armor' | 'item') => {
        const getItemDetails = () => {
            switch (type) {
            case 'weapon':
                return `Dano: ${item.effect.value}\nDano Crítico: ${item.effect.critValue}\nChance Crítica: ${item.effect.critChance}\nTipo: ${item.kind}\nCategoria: ${item.categ}\nAlcance: ${item.range}\nPeso: ${item.weight} Kg\n\nAcessórios: ${item.accessories?.join(', ')}`;
            case 'armor':
                return `Defesa: ${item.value} AP\nTipo: ${item.kind}\nCategoria: ${item.categ}\nPenalidade de Deslocamento: ${item.displacementPenalty}m\nPeso: ${item.weight} Kg\n\nAcessórios: ${item.accessories?.join(', ')}`;
            case 'item':
                return `Tipo: ${item.kind}\nPeso: ${item.weight} Kg\nQuantidade: x${item.quantity ?? 1}`;
            }
        };

        return (
            <Accordion
                key={item.name}
                sx={{
                    bgcolor: 'background.paper3',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    width: '100%'
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
                                    bgcolor: item.rarity === 'Amaldiçoado' ? 'black' : rarityColor[item.rarity as RarityType],
                                    color: item.rarity === 'Amaldiçoado' ? rarityColor[item.rarity as RarityType] : 'white',
                                    border: '1px solid',
                                    borderColor: item.rarity === 'Amaldiçoado' ? rarityColor[item.rarity as RarityType] : 'transparent'
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
                                label={`+${item.value} AP`}
                                size="small"
                                variant="outlined"
                                color="info"
                            />
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography whiteSpace='pre-wrap' variant="body2">
                        {getItemDetails()}
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
        );
    };

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Inventário ({ficha.capacity.cargo}/{ficha.capacity.max} kg)
                </Typography>

                {/* Armas */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Armas
                    </Typography>
                    <Box sx={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        bgcolor: 'background.paper3',
                        borderRadius: 1,
                        p: 1
                    }}>
                        <Masonry columns={{ xs: 1, sm: 2 }} spacing={1}>
                            {ficha.inventory.weapons.map((weapon) => renderInventoryItem(weapon, 'weapon'))}
                        </Masonry>
                    </Box>
                </Box>

                {/* Armaduras */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Armaduras
                    </Typography>
                    <Box sx={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        bgcolor: 'background.paper3',
                        borderRadius: 1,
                        p: 1
                    }}>
                        <Masonry columns={{ xs: 1, sm: 2 }} spacing={1}>
                            {ficha.inventory.armors.map((armor) => renderInventoryItem(armor, 'armor'))}
                        </Masonry>
                    </Box>
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
                        <Masonry columns={{ xs: 1, sm: 2 }} spacing={1}>
                            {ficha.inventory.items.map((item) => renderInventoryItem(item, 'item'))}
                        </Masonry>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );
}
