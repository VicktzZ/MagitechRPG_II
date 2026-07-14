'use client';

import { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { purple } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { campaignService } from '@services';
import { PerkTypeEnum, type SkillTypeEnum } from '@enums/rogueliteEnum';
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

const PERK_RARITY_COLORS: Record<string, string> = {
    'Comum': '#9e9e9e',
    'Incomum': '#4caf50',
    'Raro': '#2196f3',
    'Épico': '#9c27b0',
    'Lendário': '#ff9800',
    'Único': '#f44336',
    'Mágico': '#00bcd4',
    'Amaldiçoado': '#880e4f',
    'Especial': '#ffd700'
};

const PERK_TYPE_LABELS: Record<string, string> = {
    'WEAPON': 'Arma',
    'ARMOR': 'Armadura',
    'ITEM': 'Item',
    'SKILL': 'Habilidade',
    'SPELL': 'Magia',
    'BONUS': 'Bônus',
    'EXPERTISE': 'Perícia'
};

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
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const [ isOffering, setIsOffering ] = useState(false);
    const [ useSharedSeed, setUseSharedSeed ] = useState(false);
    const [ perkFilters, setPerkFilters ] = useState<PerkFilters>(DEFAULT_PERK_FILTERS as PerkFilters);
    // Jogadores cuja lista de vantagens adquiridas está expandida
    const [ expandedPerks, setExpandedPerks ] = useState<string[]>([]);

    const toggleExpandPerks = (playerId: string) => {
        setExpandedPerks(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [ ...prev, playerId ]
        );
    };

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
            setExpandedPerks([]);
            onClose();
        }
    };

    const togglePlayer = (playerId: string) => {
        if (isOffering) return;
        setSelectedPlayers(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [ ...prev, playerId ]
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
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Selecionar Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                            </Typography>
                            <Button size="small" onClick={selectAll}>
                                Selecionar Todos
                            </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <AutoAwesomeIcon sx={{ fontSize: '0.9rem', color: purple[400] }} />
                            O contador mostra as vantagens que cada jogador já recebeu nesta campanha — clique para ver quais.
                        </Typography>
                        <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <List dense disablePadding>
                                {players.map(player => {
                                    const perks = player.charsheet?.perks ?? [];
                                    const isExpanded = expandedPerks.includes(player.id);
                                    const isSelected = selectedPlayers.includes(player.id);
                                    return (
                                        <Box key={player.id}>
                                            <ListItem
                                                button
                                                onClick={() => togglePlayer(player.id)}
                                                disabled={isOffering}
                                                selected={isSelected}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
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
                                                <Tooltip title={perks.length > 0 ? 'Ver vantagens recebidas' : 'Nenhuma vantagem recebida ainda'}>
                                                    <Chip
                                                        icon={<AutoAwesomeIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                        label={perks.length}
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (perks.length > 0) toggleExpandPerks(player.id);
                                                        }}
                                                        sx={{
                                                            mr: 0.5,
                                                            bgcolor: perks.length > 0 ? purple[50] : 'action.hover',
                                                            color: perks.length > 0 ? purple[700] : 'text.secondary',
                                                            cursor: perks.length > 0 ? 'pointer' : 'default',
                                                            fontWeight: 600,
                                                            '& .MuiChip-icon': { color: perks.length > 0 ? purple[500] : 'text.disabled' }
                                                        }}
                                                    />
                                                </Tooltip>
                                                {perks.length > 0 && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpandPerks(player.id);
                                                        }}
                                                    >
                                                        {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                    </IconButton>
                                                )}
                                            </ListItem>
                                            {perks.length > 0 && (
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{ pl: 7, pr: 2, pb: 1 }}>
                                                        <Stack spacing={0.5}>
                                                            {perks.map((perk, idx) => {
                                                                const color = PERK_RARITY_COLORS[perk.rarity ?? 'Comum'] ?? PERK_RARITY_COLORS['Comum'];
                                                                return (
                                                                    <Tooltip
                                                                        key={perk.id || idx}
                                                                        title={perk.description || 'Sem descrição'}
                                                                        placement="left"
                                                                        arrow
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                p: 0.75,
                                                                                borderRadius: 1,
                                                                                borderLeft: '3px solid',
                                                                                borderColor: color,
                                                                                bgcolor: 'action.hover'
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                                            >
                                                                                {perk.name}
                                                                            </Typography>
                                                                            <Chip
                                                                                label={PERK_TYPE_LABELS[perk.perkType ?? ''] || perk.perkType || 'Bônus'}
                                                                                size="small"
                                                                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${color}20`, color }}
                                                                            />
                                                                            <Chip
                                                                                label={perk.rarity || 'Comum'}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{ height: 18, fontSize: '0.6rem', borderColor: `${color}80`, color }}
                                                                            />
                                                                        </Box>
                                                                    </Tooltip>
                                                                );
                                                            })}
                                                        </Stack>
                                                    </Box>
                                                </Collapse>
                                            )}
                                        </Box>
                                    );
                                })}
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
