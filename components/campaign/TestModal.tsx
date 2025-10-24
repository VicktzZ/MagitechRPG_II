'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Switch,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Select,
    MenuItem,
    InputLabel
} from '@mui/material';
import { useState } from 'react';
import type { Campaign, TestData, Expertises } from '@types';
import { useCampaignContext } from '@contexts';

interface TestModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: TestData) => void;
    campaign: Campaign;
}

const expertisesList: Array<keyof Expertises> = [
    'Agilidade', 'Diplomacia', 'Atletismo', 'Competência', 'Comunicação',
    'Condução', 'Conhecimento', 'Controle', 'Criatividade', 'Enganação',
    'Furtividade', 'Intimidação', 'Intuição', 'Investigação', 'Ladinagem',
    'Liderança', 'Luta', 'Magia', 'Medicina', 'Percepção',
    'Persuasão', 'Pontaria', 'Reflexos', 'RES Física', 'RES Mágica',
    'RES Mental', 'Sorte', 'Sobrevivência', 'Tecnologia', 'Vontade'
];

export default function TestModal({ open, onClose, onConfirm, campaign }: TestModalProps) {
    const [ dt, setDt ] = useState('');
    const [ expertise, setExpertise ] = useState<keyof Expertises | ''>('');
    const [ isGroupTest, setIsGroupTest ] = useState(true);
    const [ showSucess, setShowSucess ] = useState(true);
    const [ showResult, setShowResult ] = useState(true);
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const { users } = useCampaignContext();

    // Filtra apenas os jogadores online que não são admin
    const availablePlayers = campaign.session?.users
        .filter(userId => !campaign.admin?.includes(userId))
        .map(userId => {
            const player = campaign.players.find(p => p.userId === userId);
            return player?.userId;
        })
        .filter((userId): userId is string => userId !== undefined);

    const handleConfirm = () => {
        const numericDt = parseInt(dt);
        if (isNaN(numericDt) || numericDt < 1 || numericDt > 99) {
            return;
        }

        onConfirm({
            dt: numericDt,
            expertise: expertise || undefined,
            isGroupTest,
            showResult,
            isVisible: showSucess,
            selectedPlayers: isGroupTest ? availablePlayers : selectedPlayers
        });

        // Limpa o estado
        setDt('');
        setExpertise('');
        setIsGroupTest(true);
        setShowSucess(true);
        setShowResult(true);
        setSelectedPlayers([]);
        onClose();
    };

    const handlePlayerToggle = (playerId: string) => {
        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            } else {
                return [ ...prev, playerId ];
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Solicitar Teste</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="DT"
                        type="number"
                        value={dt}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 99)) {
                                setDt(value);
                            }
                        }}
                        inputProps={{ min: 1, max: 99 }}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Perícia</InputLabel>
                        <Select
                            value={expertise}
                            onChange={(e) => setExpertise(e.target.value as keyof Expertises)}
                            label="Perícia"
                        >
                            <MenuItem value="">
                                <em>Nenhuma</em>
                            </MenuItem>
                            {expertisesList.map((exp) => (
                                <MenuItem key={exp} value={exp}>
                                    {exp}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <RadioGroup
                            value={isGroupTest ? 'group' : 'player'}
                            onChange={(e) => { setIsGroupTest(e.target.value === 'group'); }}
                        >
                            <FormControlLabel 
                                value="group" 
                                control={<Radio />} 
                                label="Teste -> Geral" 
                            />
                            <FormControlLabel 
                                value="player" 
                                control={<Radio />} 
                                label="Teste -> Jogador" 
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showSucess}
                                onChange={(e) => { setShowSucess(e.target.checked); }}
                            />
                        }
                        label="Público"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showResult}
                                onChange={(e) => { setShowResult(e.target.checked); }}
                            />
                        }
                        label="Exibir resultado"
                    />

                    {!isGroupTest && users.players.length > 0 && (
                        <List sx={{ 
                            maxHeight: 200, 
                            overflow: 'auto',
                            bgcolor: 'background.paper2',
                            borderRadius: 1
                        }}>
                            {users.players.map(player => {
                                return (
                                    <ListItem
                                        key={player._id}
                                        button
                                        onClick={() => { handlePlayerToggle(player._id!); }}
                                        selected={selectedPlayers.includes(player._id!)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar 
                                                src={player.image ?? '/assets/default-avatar.png'} 
                                                alt={player.name ?? 'Avatar'}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={player.name ?? 'Jogador Desconhecido'} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    onClick={handleConfirm}
                    disabled={
                        !dt || 
                        parseInt(dt) < 1 || 
                        parseInt(dt) > 99 || 
                        (!isGroupTest && selectedPlayers.length === 0)
                    }
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}