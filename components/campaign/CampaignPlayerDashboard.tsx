'use client';

import { useState, type ReactElement } from 'react';
import { Box, Typography, Paper, Chip, Grid, Tooltip, Divider, Avatar, LinearProgress, IconButton, TextField, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCampaignContext } from '@contexts/campaignContext';
import { useGameMasterContext } from '@contexts/gameMasterContext';
import { SkillType, AmmoType } from '@enums';
import type { AmmoControl } from '@types';

interface SkillFilterChipProps {
    label: string;
    type: SkillType;
    selected: SkillType;
    onClick: (type: SkillType) => void;
}

function SkillFilterChip({ label, type, selected, onClick }: SkillFilterChipProps): ReactElement {
    return (
        <Chip
            label={label}
            onClick={() => onClick(type)}
            color={selected === type ? 'primary' : 'default'}
            sx={{
                transition: '.1s ease-in-out',
                '&:hover': {
                    filter: 'brightness(0.9)'
                }
            }}
        />
    );
}

export default function CampaignPlayerDashboard(): ReactElement {
    const { isUserGM } = useGameMasterContext();
    const { campaign, campUsers } = useCampaignContext();
    const ficha = campaign.myFicha;
    const [selectedSkillType, setSelectedSkillType] = useState<SkillType>(SkillType.ALL);
    const [ammo, setAmmo] = useState<AmmoControl>({
        type: AmmoType.BULLET,
        current: 0,
        max: 30
    });

    if (isUserGM || !ficha) return null;

    const fichaUser = campUsers.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';
    const attributes = Object.entries(ficha.attributes).filter(([key]) => !['lp', 'mp', 'ap'].includes(key));

    // Calcula as porcentagens para as barras de progresso
    const lpPercent = (ficha.attributes.lp / ficha.attributes.lp) * 100;
    const mpPercent = (ficha.attributes.mp / ficha.attributes.mp) * 100;
    const apPercent = (ficha.attributes.ap / ficha.attributes.ap) * 100;
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

    // Filtra as habilidades baseado no tipo selecionado
    const filteredSkills = selectedSkillType === SkillType.ALL
        ? Object.values(ficha.skills).flat()
        : ficha.skills[selectedSkillType] ?? [];

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Grid container spacing={2}>
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
                    <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Atributos
                        </Typography>
                        <Grid container spacing={2}>
                            {attributes.map(([key, value]) => (
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

                {/* Dinheiro e Munição */}
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
                                                bgcolor: 'info.main'
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

                {/* Seção de Habilidades */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Habilidades
                        </Typography>
                        
                        {/* Filtros de Habilidades */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <SkillFilterChip
                                label="Todos"
                                type={SkillType.ALL}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                            <SkillFilterChip
                                label="Classe"
                                type={SkillType.CLASS}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                            <SkillFilterChip
                                label="Subclasse"
                                type={SkillType.SUBCLASS}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                            <SkillFilterChip
                                label="Linhagem"
                                type={SkillType.LINEAGE}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                            <SkillFilterChip
                                label="Poderes"
                                type={SkillType.POWERS}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                            <SkillFilterChip
                                label="Bônus"
                                type={SkillType.BONUS}
                                selected={selectedSkillType}
                                onClick={setSelectedSkillType}
                            />
                        </Box>

                        {/* Lista de Habilidades */}
                        <Box sx={{ 
                            maxHeight: '400px', 
                            overflowY: 'auto',
                            bgcolor: 'background.paper3',
                            borderRadius: 1,
                            p: 2
                        }}>
                            <Grid container spacing={1}>
                                {filteredSkills.map((skill) => (
                                    <Grid item xs={12} key={skill.name}>
                                        <Tooltip title={skill.description} placement="top-start">
                                            <Paper sx={{ 
                                                p: 1.5,
                                                cursor: 'help',
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}>
                                                <Typography variant="subtitle2">
                                                    {skill.name}
                                                </Typography>
                                            </Paper>
                                        </Tooltip>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* Seção de Inventário */}
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
                                {ficha.inventory.weapons.map((weapon) => (
                                    <Grid item xs={12} key={weapon.name}>
                                        <Paper sx={{ p: 1.5, bgcolor: 'background.paper3' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2">
                                                    {weapon.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Dano: {weapon.damage}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {weapon.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Armaduras */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom color="primary">
                                Armaduras
                            </Typography>
                            <Grid container spacing={1}>
                                {ficha.inventory.armors.map((armor) => (
                                    <Grid item xs={12} key={armor.name}>
                                        <Paper sx={{ p: 1.5, bgcolor: 'background.paper3' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2">
                                                    {armor.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Defesa: {armor.defense}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {armor.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
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
                                    {ficha.inventory.items.map((item) => (
                                        <Grid item xs={12} sm={6} key={item.name}>
                                            <Tooltip title={item.description} placement="top">
                                                <Paper sx={{ 
                                                    p: 1,
                                                    cursor: 'help',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover'
                                                    }
                                                }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        Qtd: {item.quantity}
                                                    </Typography>
                                                </Paper>
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}