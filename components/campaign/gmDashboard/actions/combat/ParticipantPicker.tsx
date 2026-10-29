import type { Creature } from '@models';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import { Avatar, Box, Checkbox, List, ListItem, ListItemAvatar, ListItemText, MenuItem, TextField, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import type { PlayerInfo } from '../types';
import type { ParticipantSelection } from './useParticipantSelection';

interface ParticipantPickerProps {
    players: PlayerInfo[];
    creatures: Creature[];
    selection: ParticipantSelection;
    /** Fichas que já estão no combate: aparecem marcadas e desabilitadas */
    inCombat?: ReadonlySet<string>;
}

const listSx = { maxHeight: 150, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 } as const;

/** Lista de jogadores e de criaturas (com a quantidade de cópias) para escolher quem entra no combate */
export default function ParticipantPicker({ players, creatures, selection, inCombat }: ParticipantPickerProps): ReactElement {
    const { selectedPlayers, selectedCreatures, creatureQuantities, creatureControllers, togglePlayer, toggleCreature, setCreatureQuantity, setCreatureController } = selection;
    const withSheet = players.filter(player => player.charsheet);
    // Quem pode controlar um invocado: cada jogador com ficha (o ID é o do usuário)
    const controllerOptions = withSheet.map(player => ({ id: player.id, name: player.charsheet?.name || player.name }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" /> Jogadores
                </Typography>
                <Box sx={listSx}>
                    <List dense>
                        {withSheet.map(player => {
                            const present = Boolean(player.charsheet?.id && inCombat?.has(player.charsheet.id));
                            return (
                                <ListItem
                                    key={player.id}
                                    button
                                    disabled={present}
                                    onClick={() => togglePlayer(player.id)}
                                    data-testid={`combat-picker-player-${player.charsheet?.id}`}
                                >
                                    <Checkbox checked={present || selectedPlayers.includes(player.id)} disabled={present} size="small" />
                                    <ListItemAvatar>
                                        <Avatar src={player.avatar} sx={{ width: 28, height: 28 }} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={player.charsheet?.name || player.name}
                                        secondary={present
                                            ? 'Já está no combate'
                                            : `AGI: ${player.charsheet?.stats?.agi || 0} | LP: ${player.charsheet?.stats?.lp || 0}/${player.charsheet?.stats?.maxLp || 0}`}
                                    />
                                </ListItem>
                            );
                        })}
                        {withSheet.length === 0 && (
                            <ListItem>
                                <ListItemText secondary="Nenhum jogador com ficha disponível" />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PetsIcon fontSize="small" /> Criaturas
                </Typography>
                <Box sx={listSx}>
                    <List dense>
                        {creatures.map(creature => {
                            const isSelected = selectedCreatures.includes(creature.id);
                            const quantity = creatureQuantities[creature.id] ?? 1;

                            return (
                                <ListItem
                                    key={creature.id}
                                    data-testid={`combat-picker-creature-${creature.id}`}
                                    secondaryAction={
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                select
                                                label="Controle"
                                                size="small"
                                                value={creatureControllers[creature.id] ?? ''}
                                                onChange={(event) => { setCreatureController(creature.id, event.target.value) }}
                                                SelectProps={{ displayEmpty: true, renderValue: (value) => (value ? (controllerOptions.find(option => option.id === value)?.name ?? 'Jogador') : 'Mestre') }}
                                                inputProps={{ 'aria-label': `Quem controla ${creature.name}` }}
                                                sx={{ width: 150 }}
                                            >
                                                <MenuItem value="">Mestre</MenuItem>
                                                {controllerOptions.map(option => <MenuItem key={option.id} value={option.id}>{`Invocado por ${option.name}`}</MenuItem>)}
                                            </TextField>
                                            <TextField
                                                type="number"
                                                label="Qtd."
                                                size="small"
                                                value={quantity}
                                                onChange={(event) => { setCreatureQuantity(creature.id, parseInt(event.target.value, 10)) }}
                                                inputProps={{ min: 1, max: 99, 'aria-label': `Quantidade de ${creature.name}` }}
                                                sx={{ width: 80 }}
                                                disabled={!isSelected}
                                            />
                                        </Box>
                                    }
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        size="small"
                                        onChange={() => { toggleCreature(creature.id) }}
                                        inputProps={{ 'aria-label': `Selecionar ${creature.name}` }}
                                    />
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'error.main' }}>
                                            <PetsIcon fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={creature.name}
                                        secondary={`AGI: ${creature.expertises?.Agilidade?.value ?? 0} | LP: ${creature.stats?.lp ?? 0}`}
                                    />
                                </ListItem>
                            );
                        })}
                        {creatures.length === 0 && (
                            <ListItem>
                                <ListItemText secondary="Nenhuma criatura customizada disponível" />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Box>
        </Box>
    );
}
