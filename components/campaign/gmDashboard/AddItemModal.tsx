'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Tab,
    Tabs
} from '@mui/material';
import { deafultWeapons } from '@constants/defaultWeapons';
import type { Weapon, Item } from '@types';

interface AddItemModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (item: Weapon | Item) => void;
}

type TabType = 'weapon' | 'item';

export default function AddItemModal({ open, onClose, onConfirm }: AddItemModalProps) {
    const [ selectedTab, setSelectedTab ] = useState<TabType>('weapon');
    const [ selectedWeaponType, setSelectedWeaponType ] = useState<keyof typeof deafultWeapons>('melee');
    const [ selectedWeapon, setSelectedWeapon ] = useState<Weapon | null>(null);
    const [ customWeapon, setCustomWeapon ] = useState<Weapon | null>(null);
    const [ customItem, setCustomItem ] = useState<Item>({
        name: '',
        description: '',
        rarity: 'Comum',
        kind: 'Item',
        categ: 'Diversos',
        weight: 0,
        quantity: 1,
        effect: {
            description: '',
            value: '',
            type: ''
        }
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
        setSelectedTab(newValue);
        setSelectedWeapon(null);
        setCustomWeapon(null);
    };

    const handleWeaponTypeChange = (type: keyof typeof deafultWeapons) => {
        setSelectedWeaponType(type);
        setSelectedWeapon(null);
        setCustomWeapon(null);
    };

    const handleWeaponSelect = (weapon: Weapon) => {
        setSelectedWeapon(weapon);
        setCustomWeapon({ ...weapon });
    };

    const handleCustomWeaponChange = (field: keyof Weapon, value: any) => {
        if (!customWeapon) return;
        
        if (field === 'effect') {
            setCustomWeapon({
                ...customWeapon,
                effect: { ...customWeapon.effect, ...value }
            });
        } else {
            setCustomWeapon({
                ...customWeapon,
                [field]: value
            });
        }
    };

    const handleCustomItemChange = (field: keyof Item, value: any) => {
        if (field === 'effect') {
            setCustomItem({
                ...customItem,
                effect: { ...customItem.effect, ...value }
            });
        } else {
            setCustomItem({
                ...customItem,
                [field]: value
            });
        }
    };

    const handleConfirm = () => {
        if (selectedTab === 'weapon' && customWeapon) {
            onConfirm(customWeapon);
        } else if (selectedTab === 'item' && customItem.name) {
            onConfirm(customItem);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Adicionar Item ao Jogador</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={selectedTab} onChange={handleTabChange}>
                        <Tab label="Arma" value="weapon" />
                        <Tab label="Item" value="item" />
                    </Tabs>
                </Box>

                {selectedTab === 'weapon' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Arma</InputLabel>
                            <Select
                                value={selectedWeaponType}
                                onChange={(e) => handleWeaponTypeChange(e.target.value as keyof typeof deafultWeapons)}
                                label="Tipo de Arma"
                            >
                                <MenuItem value="melee">Corpo a Corpo</MenuItem>
                                <MenuItem value="ranged">À Distância</MenuItem>
                                <MenuItem value="magic">Mágica</MenuItem>
                                <MenuItem value="ballistic">Balística</MenuItem>
                                <MenuItem value="energy">Energia</MenuItem>
                                <MenuItem value="special">Especial</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Arma Base</InputLabel>
                            <Select
                                value={selectedWeapon?.name ?? ''}
                                onChange={(e) => {
                                    const weapon = deafultWeapons[selectedWeaponType].find(w => w.name === e.target.value);
                                    if (weapon) handleWeaponSelect(weapon);
                                }}
                                label="Arma Base"
                            >
                                {deafultWeapons[selectedWeaponType].map((weapon) => (
                                    <MenuItem key={weapon.name} value={weapon.name}>
                                        {weapon.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {customWeapon && (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    Personalizar Arma
                                </Typography>
                                
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    value={customWeapon.name}
                                    onChange={(e) => handleCustomWeaponChange('name', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    label="Descrição"
                                    value={customWeapon.description}
                                    onChange={(e) => handleCustomWeaponChange('description', e.target.value)}
                                    multiline
                                    rows={2}
                                />

                                <TextField
                                    fullWidth
                                    label="Raridade"
                                    value={customWeapon.rarity}
                                    onChange={(e) => handleCustomWeaponChange('rarity', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    label="Tipo"
                                    value={customWeapon.kind}
                                    onChange={(e) => handleCustomWeaponChange('kind', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    label="Categoria"
                                    value={customWeapon.categ}
                                    onChange={(e) => handleCustomWeaponChange('categ', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    label="Alcance"
                                    value={customWeapon.range}
                                    onChange={(e) => handleCustomWeaponChange('range', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Peso"
                                    value={customWeapon.weight}
                                    onChange={(e) => handleCustomWeaponChange('weight', parseFloat(e.target.value))}
                                />

                                <TextField
                                    fullWidth
                                    label="Acerto (hit)"
                                    value={customWeapon.hit}
                                    onChange={(e) => handleCustomWeaponChange('hit', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    label="Munição"
                                    value={customWeapon.ammo}
                                    onChange={(e) => handleCustomWeaponChange('ammo', e.target.value)}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantidade"
                                    value={customWeapon.quantity}
                                    onChange={(e) => handleCustomWeaponChange('quantity', parseInt(e.target.value))}
                                />

                                <TextField
                                    fullWidth
                                    label="Bônus"
                                    value={customWeapon.bonus}
                                    onChange={(e) => handleCustomWeaponChange('bonus', e.target.value)}
                                />

                                <Typography variant="subtitle1" gutterBottom>
                                    Efeito
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Valor do Dano"
                                    value={customWeapon.effect.value}
                                    onChange={(e) => handleCustomWeaponChange('effect', { value: e.target.value })}
                                />

                                <TextField
                                    fullWidth
                                    label="Valor do Crítico"
                                    value={customWeapon.effect.critValue}
                                    onChange={(e) => handleCustomWeaponChange('effect', { critValue: e.target.value })}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Chance de Crítico"
                                    value={customWeapon.effect.critChance}
                                    onChange={(e) => handleCustomWeaponChange('effect', { critChance: parseInt(e.target.value) })}
                                />

                                <TextField
                                    fullWidth
                                    label="Tipo de Efeito"
                                    value={customWeapon.effect.effectType}
                                    onChange={(e) => handleCustomWeaponChange('effect', { effectType: e.target.value })}
                                />
                            </>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Criar Item
                        </Typography>

                        <TextField
                            fullWidth
                            required
                            label="Nome"
                            value={customItem.name}
                            onChange={(e) => handleCustomItemChange('name', e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Descrição"
                            value={customItem.description}
                            onChange={(e) => handleCustomItemChange('description', e.target.value)}
                            multiline
                            rows={2}
                        />

                        <TextField
                            fullWidth
                            label="Raridade"
                            value={customItem.rarity}
                            onChange={(e) => handleCustomItemChange('rarity', e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Tipo"
                            value={customItem.kind}
                            onChange={(e) => handleCustomItemChange('kind', e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Categoria"
                            value={customItem.categ}
                            onChange={(e) => handleCustomItemChange('categ', e.target.value)}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Peso"
                            value={customItem.weight}
                            onChange={(e) => handleCustomItemChange('weight', parseFloat(e.target.value))}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Quantidade"
                            value={customItem.quantity}
                            onChange={(e) => handleCustomItemChange('quantity', parseInt(e.target.value))}
                        />

                        <Typography variant="subtitle1" gutterBottom>
                            Efeito (Opcional)
                        </Typography>

                        <TextField
                            fullWidth
                            label="Descrição do Efeito"
                            value={customItem.effect?.description}
                            onChange={(e) => handleCustomItemChange('effect', { description: e.target.value })}
                            multiline
                            rows={2}
                        />

                        <TextField
                            fullWidth
                            label="Valor do Efeito"
                            value={customItem.effect?.value}
                            onChange={(e) => handleCustomItemChange('effect', { value: e.target.value })}
                        />

                        <TextField
                            fullWidth
                            label="Tipo do Efeito"
                            value={customItem.effect?.type}
                            onChange={(e) => handleCustomItemChange('effect', { type: e.target.value })}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={selectedTab === 'weapon' ? !customWeapon : !customItem.name}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
