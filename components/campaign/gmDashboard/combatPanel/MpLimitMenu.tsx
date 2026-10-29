'use client';

import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState, type ReactElement } from 'react';

interface MpLimitMenuProps {
    name: string;
    /** O limite está liberado até a rodada virar */
    released: boolean;
    onSetSpent: () => void;
    onReset: () => void;
    onRelease: (enabled: boolean) => void;
}

/** O menu do limite de MP por turno de um combatente: definir o gasto exato, zerar o gasto e liberar ou restabelecer o limite (só o mestre) */
export default function MpLimitMenu({ name, released, onSetSpent, onReset, onRelease }: MpLimitMenuProps): ReactElement {
    const [ anchor, setAnchor ] = useState<HTMLElement | null>(null);
    const close = (): void => { setAnchor(null); };
    const choose = (action: () => void) => (): void => { close(); action(); };

    return (
        <>
            <Tooltip title="Limite de MP por turno">
                <IconButton size="small" aria-label={`Limite de MP de ${name}`} aria-haspopup="menu" aria-expanded={Boolean(anchor)} onClick={(event) => { setAnchor(event.currentTarget); }}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
                <MenuItem onClick={choose(onSetSpent)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Definir o MP gasto na rodada</ListItemText>
                </MenuItem>
                <MenuItem onClick={choose(onReset)}>
                    <ListItemIcon><RestartAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Resetar o MP gasto</ListItemText>
                </MenuItem>
                <MenuItem onClick={choose(() => { onRelease(!released); })}>
                    <ListItemIcon>{released ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}</ListItemIcon>
                    <ListItemText>{released ? 'Restabelecer o limite' : 'Liberar o limite até a rodada virar'}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
