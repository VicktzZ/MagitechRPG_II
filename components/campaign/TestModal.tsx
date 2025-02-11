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
    Avatar
} from '@mui/material';
import { useState } from 'react';
import type { Campaign, TestData } from '@types';

interface TestModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: TestData) => void;
    campaign: Campaign;
}

export default function TestModal({ open, onClose, onConfirm, campaign }: TestModalProps) {
    const [ dt, setDt ] = useState('');
    const [ isGroupTest, setIsGroupTest ] = useState(true);
    const [ isVisible, setIsVisible ] = useState(true);
    const [ showResult, setShowResult ] = useState(true);
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);

    // Filtra apenas os jogadores online que não são admin
    const availablePlayers = campaign.session.users
        .filter(userId => !campaign.admin.includes(userId))
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
            isGroupTest,
            isVisible,
            showResult,
            selectedPlayers: isGroupTest ? availablePlayers : selectedPlayers
        });

        // Limpa o estado
        setDt('');
        setIsGroupTest(true);
        setIsVisible(true);
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

                    <FormControl>
                        <RadioGroup
                            value={isGroupTest ? 'group' : 'player'}
                            onChange={(e) => { setIsGroupTest(e.target.value === 'group'); }}
                        >
                            <FormControlLabel 
                                value="group" 
                                control={<Radio />} 
                                label="Teste para Grupo" 
                            />
                            <FormControlLabel 
                                value="player" 
                                control={<Radio />} 
                                label="Teste para Jogador" 
                            />
                        </RadioGroup>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isVisible}
                                onChange={(e) => { setIsVisible(e.target.checked); }}
                            />
                        }
                        label="Mensagem visível"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showResult}
                                onChange={(e) => { setShowResult(e.target.checked); }}
                            />
                        }
                        label="Mostrar Resultado"
                    />

                    {!isGroupTest && availablePlayers.length > 0 && (
                        <List sx={{ 
                            maxHeight: 200, 
                            overflow: 'auto',
                            bgcolor: 'background.paper2',
                            borderRadius: 1
                        }}>
                            {availablePlayers.map(playerId => {
                                const player = campaign.players.find(p => p.userId === playerId);
                                if (!player) return null;

                                return (
                                    <ListItem
                                        key={playerId}
                                        button
                                        onClick={() => { handlePlayerToggle(playerId); }}
                                        selected={selectedPlayers.includes(playerId)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                {player.userId.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={player.userId} />
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
