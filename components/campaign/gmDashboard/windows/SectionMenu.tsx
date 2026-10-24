'use client';

import { Menu, MenuItem } from '@mui/material';
import type { ReactElement } from 'react';
import { useGMWindowActions } from './GMWindowProvider';
import { SHEET_WINDOW_KINDS, WINDOW_KIND_LABEL } from './windowKinds';

interface SectionMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    charsheetId: string;
    /** Nome da ficha, só para o rótulo acessível do menu */
    charsheetName: string;
}

/** Menu com as seções da ficha de um jogador; cada item abre (ou foca) a janela daquela seção */
export default function SectionMenu({ anchorEl, onClose, charsheetId, charsheetName }: SectionMenuProps): ReactElement {
    const { openWindow } = useGMWindowActions();

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            slotProps={{ paper: { 'aria-label': `Seções de ${charsheetName}` } }}
        >
            {SHEET_WINDOW_KINDS.map(kind => (
                <MenuItem
                    key={kind}
                    onClick={() => {
                        openWindow(kind, charsheetId);
                        onClose();
                    }}
                >
                    {WINDOW_KIND_LABEL[kind]}
                </MenuItem>
            ))}
        </Menu>
    );
}
