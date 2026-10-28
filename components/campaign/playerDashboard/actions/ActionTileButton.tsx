'use client';

import ElementIcon from '@components/misc/ElementIcon';
import WeaponIcon from '@components/misc/WeaponIcon';
import { Inventory2 } from '@mui/icons-material';
import { Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { ActionTile } from '@utils/combat/actionTiles';
import type { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';

/**
 * `ready`: dá para usar. `spent`: a ação do quadrado já foi gasta na rodada, então ele fica cinza e desativado. `blocked`: não dá agora por outro motivo (falta o alvo, a fase de
 * ação não começou, outra conjuração em andamento), com o motivo na dica.
 */
export type TileState = 'ready' | 'spent' | 'blocked';

interface ActionTileButtonProps {
    tile: ActionTile;
    state: TileState;
    /** Dica do quadrado: o que ele faz, ou por que não dá para usar */
    hint: string;
    /** Magia sustentada ativa: o quadrado mostra que está ligada (clicar desconjura) */
    active?: boolean;
    onActivate: (event: ReactMouseEvent<HTMLElement>) => void;
    /** Botões extras do quadrado (Dano e Crítico da arma, Efetuar da magia): valem mesmo com a ação gasta */
    extras?: ReactNode;
}

const KIND_MARK: Record<ActionTile['kind'], string> = { weapon: color.danger, spell: color.cyan, item: color.success };

function TileGlyph({ tile, dimmed }: { tile: ActionTile; dimmed: boolean }): ReactElement {
    const iconSx = { fontSize: 22, color: 'text.secondary' };
    return (
        <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', filter: dimmed ? 'grayscale(1)' : 'none', opacity: dimmed ? 0.55 : 1 }}>
            {tile.kind === 'weapon' && <WeaponIcon sx={iconSx} />}
            {tile.kind === 'spell' && <ElementIcon element={tile.spell.element} colored sx={{ fontSize: 22 }} />}
            {tile.kind === 'item' && <Inventory2 sx={iconSx} />}
        </Box>
    );
}

/**
 * Um quadrado da seção Ações (estilo hotbar): ícone, nome, a ação que gasta e um detalhe curto (dano da arma, custo de MP da magia). O clique principal usa o quadrado;
 * `extras` ficam numa fileira embaixo, fora do botão principal (botão dentro de botão não vale), e continuam ativos quando a ação do quadrado já foi gasta.
 */
export default function ActionTileButton({ tile, state, hint, active = false, onActivate, extras }: ActionTileButtonProps): ReactElement {
    const spent = state === 'spent';
    const disabled = state !== 'ready';

    return (
        <Box
            data-testid="action-tile"
            data-state={state}
            data-kind={tile.kind}
            data-category={tile.category}
            data-execution={tile.execution ?? ''}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'divider',
                borderLeft: '3px solid',
                borderLeftColor: spent ? 'divider' : KIND_MARK[tile.kind],
                borderRadius: 2,
                bgcolor: spent ? 'action.disabledBackground' : 'background.raised',
                transition: 'border-color 120ms',
                '&:hover': disabled ? undefined : { borderColor: color.borderStrong, borderLeftColor: KIND_MARK[tile.kind] }
            }}
        >
            <Tooltip title={hint} placement="top" enterDelay={400}>
                <span style={{ display: 'flex', flex: 1 }}>
                    <ButtonBase
                        disabled={disabled}
                        onClick={onActivate}
                        aria-label={`${tile.name}: ${hint}`}
                        sx={{
                            flex: 1,
                            width: '100%',
                            minHeight: 92,
                            p: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            textAlign: 'left',
                            borderRadius: 2,
                            color: spent ? 'text.disabled' : 'text.primary',
                            '&.Mui-disabled': { opacity: spent ? 1 : 0.6, cursor: 'not-allowed', pointerEvents: 'auto' }
                        }}
                    >
                        <TileGlyph tile={tile} dimmed={spent} />
                        <Typography
                            sx={{
                                width: '100%',
                                fontSize: 13,
                                fontWeight: 600,
                                lineHeight: 1.25,
                                overflowWrap: 'anywhere',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textDecoration: spent ? 'line-through' : 'none'
                            }}
                        >
                            {tile.name}
                        </Typography>
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 0.5, alignItems: 'baseline' }}>
                            <Typography variant="caption" sx={{ color: spent ? 'text.disabled' : 'text.secondary', fontWeight: 600 }}>
                                {spent ? `${tile.execution} · gasta` : active ? 'Ativa' : tile.execution ?? 'Sem ação'}
                            </Typography>
                            {tile.detail && (
                                <Typography variant="caption" sx={{ fontFamily: font.mono, color: spent ? 'text.disabled' : 'text.secondary' }}>{tile.detail}</Typography>
                            )}
                        </Box>
                    </ButtonBase>
                </span>
            </Tooltip>
            {extras && <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', px: 0.75, pb: 0.75 }}>{extras}</Box>}
        </Box>
    );
}
