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
import type { Weapon, Item, RarityType, DamageType, AmmoType, RangeType } from '@types';

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
        kind: 'Padrão',
        weight: 0,
        quantity: 1,
        effects: []
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
        if (field === 'effects') {
            setCustomItem({
                ...customItem,
                effects: { ...customItem.effects, ...value }
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

                                <FormControl fullWidth>
                                    <InputLabel>Raridade</InputLabel>
                                    <Select
                                        value={customWeapon.rarity}
                                        onChange={(e) => handleCustomWeaponChange('rarity', e.target.value as RarityType)}
                                        label="Raridade"
                                    >
                                        <MenuItem value="Comum">Comum</MenuItem>
                                        <MenuItem value="Incomum">Incomum</MenuItem>
                                        <MenuItem value="Raro">Raro</MenuItem>
                                        <MenuItem value="Épico">Épico</MenuItem>
                                        <MenuItem value="Lendário">Lendário</MenuItem>
                                        <MenuItem value="Relíquia">Relíquia</MenuItem>
                                        <MenuItem value="Mágico">Mágico</MenuItem>
                                        <MenuItem value="Especial">Especial</MenuItem>
                                        <MenuItem value="Amaldiçoado">Amaldiçoado</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={customWeapon.kind}
                                        onChange={(e) => handleCustomWeaponChange('kind', e.target.value)}
                                        label="Tipo"
                                    >
                                        <MenuItem value="Padrão">Padrão</MenuItem>
                                        <MenuItem value="Duas mãos">Duas mãos</MenuItem>
                                        <MenuItem value="Automática">Automática</MenuItem>
                                        <MenuItem value="Semi-automática">Semi-automática</MenuItem>
                                        <MenuItem value="Arremessável (3m)">Arremessável (3m)</MenuItem>
                                        <MenuItem value="Arremessável (9m)">Arremessável (9m)</MenuItem>
                                        <MenuItem value="Arremessável (18m)">Arremessável (18m)</MenuItem>
                                        <MenuItem value="Arremessável (30m)">Arremessável (30m)</MenuItem>
                                        <MenuItem value="Arremessável (90m)">Arremessável (90m)</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        value={customWeapon.categ}
                                        onChange={(e) => handleCustomWeaponChange('categ', e.target.value)}
                                        label="Categoria"
                                    >
                                        <MenuItem value="Leve">Leve</MenuItem>
                                        <MenuItem value="Pesada">Pesada</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Alcance</InputLabel>
                                    <Select
                                        value={customWeapon.range}
                                        onChange={(e) => handleCustomWeaponChange('range', e.target.value as RangeType)}
                                        label="Alcance"
                                    >
                                        <MenuItem value="Corpo-a-corpo">Corpo-a-corpo</MenuItem>
                                        <MenuItem value="Curto (3m)">Curto (3m)</MenuItem>
                                        <MenuItem value="Padrão (9m)">Padrão (9m)</MenuItem>
                                        <MenuItem value="Médio (18m)">Médio (18m)</MenuItem>
                                        <MenuItem value="Longo (30m)">Longo (30m)</MenuItem>
                                        <MenuItem value="Ampliado (90m)">Ampliado (90m)</MenuItem>
                                        <MenuItem value="Visível">Visível</MenuItem>
                                        <MenuItem value="Ilimitado">Ilimitado</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Peso"
                                    value={customWeapon.weight}
                                    onChange={(e) => handleCustomWeaponChange('weight', parseFloat(e.target.value))}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Acerto (hit)</InputLabel>
                                    <Select
                                        value={customWeapon.hit}
                                        onChange={(e) => handleCustomWeaponChange('hit', e.target.value)}
                                        label="Acerto (hit)"
                                    >
                                        <MenuItem value="des">Destreza</MenuItem>
                                        <MenuItem value="vig">Vigor</MenuItem>
                                        <MenuItem value="log">Lógica</MenuItem>
                                        <MenuItem value="sab">Sabedoria</MenuItem>
                                        <MenuItem value="foc">Foco</MenuItem>
                                        <MenuItem value="car">Carisma</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Munição</InputLabel>
                                    <Select
                                        value={customWeapon.ammo}
                                        onChange={(e) => handleCustomWeaponChange('ammo', e.target.value as AmmoType | 'Não consome')}
                                        label="Munição"
                                    >
                                        <MenuItem value="Não consome">Não consome</MenuItem>
                                        <MenuItem value="9mm">9mm</MenuItem>
                                        <MenuItem value="Calibre .50">Calibre .50</MenuItem>
                                        <MenuItem value="Calibre 12">Calibre 12</MenuItem>
                                        <MenuItem value="Calibre 22">Calibre 22</MenuItem>
                                        <MenuItem value="Bateria de lítio">Bateria de lítio</MenuItem>
                                        <MenuItem value="Amplificador de partículas">Amplificador de partículas</MenuItem>
                                        <MenuItem value="Cartucho de fusão">Cartucho de fusão</MenuItem>
                                        <MenuItem value="Servomotor iônico">Servomotor iônico</MenuItem>
                                        <MenuItem value="Flecha">Flecha</MenuItem>
                                        <MenuItem value="Combustível">Combustível</MenuItem>
                                        <MenuItem value="Foguete">Foguete</MenuItem>
                                        <MenuItem value="Granada">Granada</MenuItem>
                                        <MenuItem value="Serra de metal">Serra de metal</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantidade"
                                    value={customWeapon.quantity}
                                    onChange={(e) => handleCustomWeaponChange('quantity', parseInt(e.target.value))}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Bônus</InputLabel>
                                    <Select
                                        value={customWeapon.bonus}
                                        onChange={(e) => handleCustomWeaponChange('bonus', e.target.value)}
                                        label="Bônus"
                                    >
                                        <MenuItem value="Luta">Luta</MenuItem>
                                        <MenuItem value="Agilidade">Agilidade</MenuItem>
                                        <MenuItem value="Furtividade">Furtividade</MenuItem>
                                        <MenuItem value="Pontaria">Pontaria</MenuItem>
                                        <MenuItem value="Magia">Magia</MenuItem>
                                        <MenuItem value="Tecnologia">Tecnologia</MenuItem>
                                        <MenuItem value="Controle">Controle</MenuItem>
                                    </Select>
                                </FormControl>

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

                                <FormControl fullWidth>
                                    <InputLabel>Tipo de Efeito</InputLabel>
                                    <Select
                                        value={customWeapon.effect.effectType}
                                        onChange={(e) => handleCustomWeaponChange('effect', { effectType: e.target.value as DamageType })}
                                        label="Tipo de Efeito"
                                    >
                                        <MenuItem value="Cortante">Cortante</MenuItem>
                                        <MenuItem value="Impactante">Impactante</MenuItem>
                                        <MenuItem value="Perfurante">Perfurante</MenuItem>
                                        <MenuItem value="Explosivo">Explosivo</MenuItem>
                                        <MenuItem value="Fogo">Fogo</MenuItem>
                                        <MenuItem value="Gelo">Gelo</MenuItem>
                                        <MenuItem value="Eletricidade">Eletricidade</MenuItem>
                                        <MenuItem value="Físico">Físico</MenuItem>
                                        <MenuItem value="Ácido">Ácido</MenuItem>
                                        <MenuItem value="Veneno">Veneno</MenuItem>
                                        <MenuItem value="Mental">Mental</MenuItem>
                                    </Select>
                                </FormControl>
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

                        <FormControl fullWidth>
                            <InputLabel>Raridade</InputLabel>
                            <Select
                                value={customItem.rarity}
                                onChange={(e) => handleCustomItemChange('rarity', e.target.value as RarityType)}
                                label="Raridade"
                            >
                                <MenuItem value="Comum">Comum</MenuItem>
                                <MenuItem value="Incomum">Incomum</MenuItem>
                                <MenuItem value="Raro">Raro</MenuItem>
                                <MenuItem value="Épico">Épico</MenuItem>
                                <MenuItem value="Lendário">Lendário</MenuItem>
                                <MenuItem value="Relíquia">Relíquia</MenuItem>
                                <MenuItem value="Mágico">Mágico</MenuItem>
                                <MenuItem value="Especial">Especial</MenuItem>
                                <MenuItem value="Amaldiçoado">Amaldiçoado</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={customItem.kind}
                                onChange={(e) => handleCustomItemChange('kind', e.target.value)}
                                label="Tipo"
                            >
                                <MenuItem value="Padrão">Padrão</MenuItem>
                                <MenuItem value="Especial">Especial</MenuItem>
                                <MenuItem value="Utilidade">Utilidade</MenuItem>
                                <MenuItem value="Consumível">Consumível</MenuItem>
                                <MenuItem value="Item Chave">Item Chave</MenuItem>
                                <MenuItem value="Munição">Munição</MenuItem>
                                <MenuItem value="Capacidade">Capacidade</MenuItem>
                            </Select>
                        </FormControl>

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

                        {/* <Typography variant="subtitle1" gutterBottom>
                            Efeito (Opcional)
                        </Typography>

                        <TextField
                            fullWidth
                            label="Descrição do Efeito"
                            value={customItem.effects?.description}
                            onChange={(e) => handleCustomItemChange('effect', { description: e.target.value })}
                            multiline
                            rows={2}
                        />

                        <TextField
                            fullWidth
                            label="Valor do Efeito"
                            value={customItem.effects?.value}
                            onChange={(e) => handleCustomItemChange('effect', { value: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Tipo do Efeito</InputLabel>
                            <Select
                                value={customItem.effects?.type || ''}
                                onChange={(e) => handleCustomItemChange('effect', { type: e.target.value })}
                                label="Tipo do Efeito"
                            >
                                <MenuItem value="Atributo">Atributo</MenuItem>
                                <MenuItem value="Perícia">Perícia</MenuItem>
                                <MenuItem value="Dano">Dano</MenuItem>
                                <MenuItem value="Cura">Cura</MenuItem>
                                <MenuItem value="Status">Status</MenuItem>
                                <MenuItem value="Especial">Especial</MenuItem>
                            </Select>
                        </FormControl> */}
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
