'use client';

import { Close, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactElement,
    type ReactNode
} from 'react';
import { WINDOW_Z_BASE, WINDOW_Z_MOBILE } from './layout';
import { clampRect, moveBy, resizeBy, type Bounds, type Rect } from './windowGeometry';
import { WINDOW_MIN_SIZE, WINDOW_TITLE_HEIGHT } from './windowKinds';
import type { WindowEntry } from './windowState';

type DragMode = 'move' | 'e' | 's' | 'se';

interface Drag {
    pointerId: number;
    startX: number;
    startY: number;
    origin: Rect;
    mode: DragMode;
}

interface FloatingWindowProps {
    entry: WindowEntry;
    title: string;
    /** Posição na ordem de empilhamento (0 = a de trás) */
    rank: number;
    isFront: boolean;
    bounds: Bounds;
    /** Celular: ocupa a tela toda, só a da frente aparece e não há arrastar nem redimensionar */
    mobile: boolean;
    /** Muda quando esta janela deve receber o foco do teclado (0 = nunca pediu) */
    focusToken: number;
    children: ReactNode;
    onFocus: (key: string) => void;
    onClose: (key: string) => void;
    onCommit: (key: string, rect: Rect) => void;
    onToggleCollapse: (key: string) => void;
}

/** Passo das setas do teclado ao mover ou redimensionar a janela (com Shift, o maior) */
const KEY_STEP = 16;
const KEY_STEP_LARGE = 64;

const arrowDelta = (key: string, step: number): [ number, number ] | null => {
    switch (key) {
    case 'ArrowLeft': return [ -step, 0 ];
    case 'ArrowRight': return [ step, 0 ];
    case 'ArrowUp': return [ 0, -step ];
    case 'ArrowDown': return [ 0, step ];
    default: return null;
    }
};

const handleSx = { position: 'absolute', touchAction: 'none', zIndex: 1 } as const;

/**
 * Janela flutuante do mestre: barra de título que arrasta, recolhe e fecha; bordas que redimensionam; e
 * teclado equivalente (setas movem, Alt+setas redimensionam, Enter recolhe, Esc fecha). Enquanto arrasta, a
 * posição fica só aqui (a janela inteira re-renderiza, mais nada) e vai para o estado ao soltar.
 */
export default function FloatingWindow({
    entry,
    title,
    rank,
    isFront,
    bounds,
    mobile,
    focusToken,
    children,
    onFocus,
    onClose,
    onCommit,
    onToggleCollapse
}: FloatingWindowProps): ReactElement {
    const rootRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const liveRef = useRef<Rect | null>(null);
    const [ live, setLive ] = useState<Rect | null>(null);

    const collapsed = entry.collapsed;
    const minSize = collapsed ? { w: WINDOW_MIN_SIZE.w, h: WINDOW_TITLE_HEIGHT } : WINDOW_MIN_SIZE;
    // A posição guardada pode estar fora da área (janela menor, chat aberto): mostra clampada sem alterar o guardado
    const resting = clampRect({ x: entry.x, y: entry.y, w: entry.w, h: collapsed ? WINDOW_TITLE_HEIGHT : entry.h }, bounds, minSize);
    const rect = live ?? resting;

    useEffect(() => {
        if (focusToken > 0) titleRef.current?.focus({ preventScroll: true });
    }, [ focusToken ]);

    const begin = (mode: DragMode) => (event: ReactPointerEvent<HTMLElement>): void => {
        if (mobile || event.button !== 0) return;
        if (mode === 'move' && event.target instanceof Element && event.target.closest('button')) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: rect, mode };
        liveRef.current = null;
    };

    const drag = (event: ReactPointerEvent<HTMLElement>): void => {
        const current = dragRef.current;
        if (!current || current.pointerId !== event.pointerId) return;

        const dx = event.clientX - current.startX;
        const dy = event.clientY - current.startY;
        const next = current.mode === 'move'
            ? moveBy(current.origin, dx, dy, bounds, minSize)
            : resizeBy(current.origin, current.mode === 's' ? 0 : dx, current.mode === 'e' ? 0 : dy, bounds);

        liveRef.current = next;
        setLive(next);
    };

    const end = (event: ReactPointerEvent<HTMLElement>): void => {
        const current = dragRef.current;
        if (!current || current.pointerId !== event.pointerId) return;

        dragRef.current = null;
        const final = liveRef.current;
        liveRef.current = null;
        setLive(null);
        if (!final) return;

        // Mover não mexe no tamanho guardado (a janela pode estar só clampada ou recolhida)
        onCommit(entry.key, current.mode === 'move' ? { x: final.x, y: final.y, w: entry.w, h: entry.h } : final);
    };

    const onTitleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
        if (event.target !== event.currentTarget) return;

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleCollapse(entry.key);
            return;
        }

        const delta = arrowDelta(event.key, event.shiftKey ? KEY_STEP_LARGE : KEY_STEP);
        if (!delta || mobile) return;
        event.preventDefault();

        if (event.altKey) {
            if (collapsed) return;
            onCommit(entry.key, resizeBy(rect, delta[0], delta[1], bounds));
        } else {
            const moved = moveBy(rect, delta[0], delta[1], bounds, minSize);
            onCommit(entry.key, { x: moved.x, y: moved.y, w: entry.w, h: entry.h });
        }
    };

    // Esc fecha a janela em foco, menos quando é de um campo, lista ou menu aberto dentro dela
    const onRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        const target = event.target;
        if (!(target instanceof Element) || !rootRef.current?.contains(target)) return;
        if (target.closest('input, textarea, select, [contenteditable="true"], [role="listbox"], [role="menu"]')) return;

        event.stopPropagation();
        onClose(entry.key);
    };

    const geometry = mobile
        ? { position: 'fixed', inset: 0, zIndex: WINDOW_Z_MOBILE, display: isFront ? 'flex' : 'none' } as const
        : { position: 'fixed', left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: WINDOW_Z_BASE + rank } as const;

    return (
        <Paper
            ref={rootRef}
            role="dialog"
            aria-modal={false}
            aria-label={title}
            data-window-key={entry.key}
            data-front={isFront ? 'true' : 'false'}
            data-collapsed={collapsed ? 'true' : 'false'}
            elevation={8}
            onPointerDownCapture={() => { if (!isFront) onFocus(entry.key); }}
            onKeyDown={onRootKeyDown}
            style={geometry}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: isFront ? 'divider' : 'transparent',
                borderRadius: mobile ? 0 : 2
            }}
        >
            <Box
                ref={titleRef}
                role="group"
                tabIndex={0}
                aria-label={`${title}. ${mobile ? 'Enter recolhe.' : 'Setas movem, Alt e setas redimensionam, Enter recolhe, Esc fecha.'}`}
                onPointerDown={begin('move')}
                onPointerMove={drag}
                onPointerUp={end}
                onPointerCancel={end}
                onDoubleClick={() => { if (!mobile) onToggleCollapse(entry.key); }}
                onKeyDown={onTitleKeyDown}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    height: WINDOW_TITLE_HEIGHT,
                    flexShrink: 0,
                    pl: 1.5,
                    pr: 0.5,
                    bgcolor: 'background.overlay',
                    borderBottom: collapsed ? 'none' : '1px solid',
                    borderColor: 'divider',
                    cursor: mobile ? 'default' : 'grab',
                    touchAction: 'none',
                    userSelect: 'none',
                    outline: 'none',
                    '&:active': { cursor: mobile ? 'default' : 'grabbing' },
                    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
                }}
            >
                <Typography
                    component="h2"
                    noWrap
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: font.display,
                        fontSize: 14,
                        fontWeight: 600,
                        color: isFront ? 'text.primary' : 'text.secondary'
                    }}
                >
                    {title}
                </Typography>
                {!mobile && (
                    <IconButton
                        size="small"
                        aria-label={collapsed ? `Expandir ${title}` : `Recolher ${title}`}
                        aria-expanded={!collapsed}
                        title={collapsed ? 'Expandir' : 'Recolher'}
                        onClick={() => onToggleCollapse(entry.key)}
                    >
                        {collapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
                    </IconButton>
                )}
                <IconButton size="small" aria-label={`Fechar ${title}`} title="Fechar" onClick={() => onClose(entry.key)}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Montado mesmo recolhido: o estado de edição de uma seção não se perde ao recolher */}
            <Box
                hidden={collapsed}
                sx={{ display: collapsed ? 'none' : 'block', flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}
            >
                {children}
            </Box>

            {!mobile && !collapsed && (
                <>
                    <Box
                        aria-hidden
                        onPointerDown={begin('e')}
                        onPointerMove={drag}
                        onPointerUp={end}
                        onPointerCancel={end}
                        sx={{ ...handleSx, top: WINDOW_TITLE_HEIGHT, right: 0, bottom: 14, width: 6, cursor: 'ew-resize' }}
                    />
                    <Box
                        aria-hidden
                        onPointerDown={begin('s')}
                        onPointerMove={drag}
                        onPointerUp={end}
                        onPointerCancel={end}
                        sx={{ ...handleSx, left: 0, right: 14, bottom: 0, height: 6, cursor: 'ns-resize' }}
                    />
                    <Box
                        aria-hidden
                        onPointerDown={begin('se')}
                        onPointerMove={drag}
                        onPointerUp={end}
                        onPointerCancel={end}
                        sx={{
                            ...handleSx,
                            right: 0,
                            bottom: 0,
                            width: 14,
                            height: 14,
                            cursor: 'nwse-resize',
                            borderRight: '2px solid',
                            borderBottom: '2px solid',
                            borderColor: 'text.disabled',
                            borderBottomRightRadius: 6
                        }}
                    />
                </>
            )}
        </Paper>
    );
}
