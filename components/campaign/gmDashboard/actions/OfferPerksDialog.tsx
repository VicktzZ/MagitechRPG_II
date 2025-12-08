'use client';

import { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Typography
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LinkIcon from '@mui/icons-material/Link';
import { purple } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { campaignService } from '@services';
import { PerkTypeEnum, SkillTypeEnum } from '@enums/rogueliteEnum';
import type { PlayerInfo, PerkFilters, RarityType } from './types';
import {
    RARITY_OPTIONS,
    TYPE_OPTIONS,
    ELEMENT_OPTIONS,
    SPELL_LEVEL_OPTIONS,
    EXECUTION_OPTIONS,
    ITEM_KIND_OPTIONS,
    SKILL_TYPE_OPTIONS,
    DEFAULT_PERK_FILTERS
} from './constants';

interface OfferPerksDialogProps {
    open: boolean;
    onClose: () => void;
    players: PlayerInfo[];
    campaignId: string;
}

export default function OfferPerksDialog({ 
    open, 
    onClose, 
    players, 
    campaignId 
}: OfferPerksDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [isOffering, setIsOffering] = useState(false);
    const [useSharedSeed, setUseSharedSeed] = useState(false);
    const [perkFilters, setPerkFilters] = useState<PerkFilters>(DEFAULT_PERK_FILTERS as PerkFilters);

    const handleOffer = async () => {
        if (selectedPlayers.length === 0) {
            enqueueSnackbar('Selecione ao menos um jogador', { variant: 'warning' });
            return;
        }

        setIsOffering(true);
        try {
            const sharedSeed = useSharedSeed 
                ? `shared-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
                : undefined;

            await campaignService.offerPerks(campaignId, selectedPlayers, perkFilters, sharedSeed);
            
            enqueueSnackbar(
                `Vantagens oferecidas para ${selectedPlayers.length} jogador(es)!`,
                { variant: 'success' }
            );
            handleClose();
        } catch (error) {
            console.error('Erro ao oferecer vantagens:', error);
            enqueueSnackbar('Erro ao oferecer vantagens', { variant: 'error' });
        } finally {
            setIsOffering(false);
        }
    };

    const handleClose = () => {
        if (!isOffering) {
            setSelectedPlayers([]);
            setPerkFilters(DEFAULT_PERK_FILTERS as PerkFilters);
            setUseSharedSeed(false);
            onClose();
        }
    };

    const togglePlayer = (playerId: string) => {
        if (isOffering) return;
        setSelectedPlayers(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const selectAll = () => {
        setSelectedPlayers(players.map(p => p.id));
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardGiftcardIcon sx={{ color: purple[500] }} />
                Oferecer Vantagens
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    {/* Filtros de Vantagens */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Configurar Filtros das Vantagens
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {/* Raridades */}
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Raridades</InputLabel>
                                <Select
                                    multiple
                                    value={perkFilters.rarities}
                                    label="Raridades"
                                    onChange={(e) => setPerkFilters(prev => ({ ...prev, rarities: e.target.value as RarityType[] }))}
                                    input={<OutlinedInput label="Raridades" />}
                                    renderValue={(selected) => selected.length === 0 ? 'Todas' : `${selected.length} selecionada(s)`}
                                >
                                    {RARITY_OPTIONS.map(rarity => (
                                        <MenuItem key={rarity} value={rarity}>
                                            <Checkbox checked={perkFilters.rarities.includes(rarity)} size="small" />
                                            <ListItemText primary={rarity} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Tipo */}
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={perkFilters.type}
                                    label="Tipo"
                                    onChange={(e) => setPerkFilters(prev => ({ ...prev, type: e.target.value as PerkTypeEnum | '' }))}
                                >
                                    <MenuItem value=""><em>Todos</em></MenuItem>
                                    {TYPE_OPTIONS.map(type => (
                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Filtros específicos para Magia */}
                            {perkFilters.type === PerkTypeEnum.SPELL && (
                                <>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Elemento</InputLabel>
                                        <Select
                                            value={perkFilters.element}
                                            label="Elemento"
                                            onChange={(e) => setPerkFilters(prev => ({ ...prev, element: e.target.value }))}
                                        >
                                            <MenuItem value=""><em>Todos</em></MenuItem>
                                            {ELEMENT_OPTIONS.map(el => (
                                                <MenuItem key={el} value={el}>{el}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>Nível</InputLabel>
                                        <Select
                                            value={perkFilters.spellLevel}
                                            label="Nível"
                                            onChange={(e) => setPerkFilters(prev => ({ ...prev, spellLevel: e.target.value }))}
                                        >
                                            <MenuItem value=""><em>Todos</em></MenuItem>
                                            {SPELL_LEVEL_OPTIONS.map(lvl => (
                                                <MenuItem key={lvl} value={lvl}>Nível {lvl}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Execução</InputLabel>
                                        <Select
                                            value={perkFilters.execution}
                                            label="Execução"
                                            onChange={(e) => setPerkFilters(prev => ({ ...prev, execution: e.target.value }))}
                                        >
                                            <MenuItem value=""><em>Todas</em></MenuItem>
                                            {EXECUTION_OPTIONS.map(exec => (
                                                <MenuItem key={exec} value={exec}>{exec}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            {/* Filtros específicos para Item */}
                            {perkFilters.type === PerkTypeEnum.ITEM && (
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Tipo de Item</InputLabel>
                                    <Select
                                        multiple
                                        value={perkFilters.itemKinds}
                                        label="Tipo de Item"
                                        onChange={(e) => setPerkFilters(prev => ({ ...prev, itemKinds: e.target.value as string[] }))}
                                        input={<OutlinedInput label="Tipo de Item" />}
                                        renderValue={(selected) => selected.length === 0 ? 'Todos' : `${selected.length} tipo(s)`}
                                    >
                                        {ITEM_KIND_OPTIONS.map(kind => (
                                            <MenuItem key={kind} value={kind}>
                                                <Checkbox checked={perkFilters.itemKinds.includes(kind)} size="small" />
                                                <ListItemText primary={kind} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {/* Filtros específicos para Habilidade */}
                            {perkFilters.type === PerkTypeEnum.SKILL && (
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <InputLabel>Tipo de Habilidade</InputLabel>
                                    <Select
                                        multiple
                                        value={perkFilters.skillTypes}
                                        label="Tipo de Habilidade"
                                        onChange={(e) => setPerkFilters(prev => ({ ...prev, skillTypes: e.target.value as SkillTypeEnum[] }))}
                                        input={<OutlinedInput label="Tipo de Habilidade" />}
                                        renderValue={(selected) => selected.length === 0 ? 'Todos' : `${selected.length} tipo(s)`}
                                    >
                                        {SKILL_TYPE_OPTIONS.map(skillType => (
                                            <MenuItem key={skillType.value} value={skillType.value}>
                                                <Checkbox checked={perkFilters.skillTypes.includes(skillType.value)} size="small" />
                                                <ListItemText primary={skillType.label} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    </Box>

                    <Divider />

                    {/* Opção de Seed Compartilhada */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={useSharedSeed}
                            onChange={(e) => setUseSharedSeed(e.target.checked)}
                        />
                        <LinkIcon sx={{ color: purple[400] }} />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                Usar Seed Compartilhada
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Todos os jogadores receberão as mesmas opções de vantagens
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Seleção de Jogadores */}
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Selecionar Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                            </Typography>
                            <Button size="small" onClick={selectAll}>
                                Selecionar Todos
                            </Button>
                        </Box>
                        <Box sx={{ maxHeight: 280, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <List dense>
                                {players.map(player => (
                                    <ListItem
                                        key={player.id}
                                        button
                                        onClick={() => togglePlayer(player.id)}
                                        disabled={isOffering}
                                        selected={selectedPlayers.includes(player.id)}
                                    >
                                        <Checkbox 
                                            checked={selectedPlayers.includes(player.id)} 
                                            size="small"
                                            disabled={isOffering}
                                        />
                                        <ListItemAvatar>
                                            <Avatar src={player.avatar} sx={{ width: 32, height: 32 }} />
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={player.charsheet?.name || player.name}
                                            secondary={`Nível ${player.charsheet?.level || 0}`}
                                        />
                                        {selectedPlayers.includes(player.id) && (
                                            <Chip label="Selecionado" size="small" color="secondary" />
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isOffering} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleOffer}
                    variant="contained"
                    disabled={selectedPlayers.length === 0 || isOffering}
                    startIcon={isOffering ? <CircularProgress size={20} /> : <CardGiftcardIcon />}
                    sx={{ bgcolor: purple[600], '&:hover': { bgcolor: purple[700] } }}
                >
                    {isOffering ? 'Oferecendo...' : 'Oferecer Vantagens'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
