'use client';

import { MoreVert } from '@mui/icons-material';
import { Avatar, Badge, Box, ButtonBase, IconButton, Typography } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { ReactElement } from 'react';
import { meterPercent } from '../StatMeter';

export interface PortraitVital {
    key: 'lp' | 'mp' | 'ap';
    /** Nome acessível completo, ex.: "Vida" ou o nome dado pelo sistema customizado */
    name: string;
    value: number;
    max: number;
    barColor: string;
}

interface PartyPortraitProps {
    name: string;
    level: number;
    image?: string;
    online: boolean;
    inTurn: boolean;
    /** Há uma janela aberta desta ficha */
    open: boolean;
    vitals: PortraitVital[];
    onClick: () => void;
    /** Abre o menu das outras seções da ficha; sem ele, o retrato só abre o resumo */
    onOpenMenu?: (anchor: HTMLElement) => void;
}

/** "Vida 38 de 45, Mana 12 de 20": o que as barrinhas mostram, para quem não as vê */
const describeVitals = (vitals: PortraitVital[]): string =>
    vitals.map(vital => `${vital.name} ${vital.value} de ${vital.max}`).join(', ');

/**
 * Retrato de um jogador na barra do grupo: foto, nome, barras de LP/MP/AP e o selo "Em turno".
 * Clicar abre (ou traz para a frente) a janela de resumo da ficha. A presença e o turno não dependem só
 * da cor: o ponto é cheio quando está online e vazado quando não está, e o turno tem texto.
 */
export function PartyPortrait({ name, level, image, online, inTurn, open, vitals, onClick, onOpenMenu }: PartyPortraitProps): ReactElement {
    const label = [
        `${name}, nível ${level}`,
        inTurn ? 'em turno' : null,
        online ? 'online' : 'offline',
        describeVitals(vitals)
    ].filter(Boolean).join(', ');

    return (
        <Box sx={{ position: 'relative' }}>
            <ButtonBase
                onClick={onClick}
                aria-label={`${label}. Abrir resumo`}
                aria-pressed={open}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0.75,
                    width: '100%',
                    p: 1,
                    borderRadius: 2,
                    bgcolor: open ? 'action.selected' : 'background.raised',
                    border: '1px solid',
                    borderColor: inTurn ? 'primary.main' : 'divider',
                    textAlign: 'center',
                    '&:hover': { borderColor: inTurn ? 'primary.main' : color.borderStrong },
                    '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
                }}
            >
                <Badge
                    overlap="circular"
                    variant="dot"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{
                        alignSelf: 'center',
                        '& .MuiBadge-badge': {
                            width: 12,
                            height: 12,
                            minWidth: 12,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: online ? 'background.raised' : 'text.disabled',
                            bgcolor: online ? 'success.main' : 'background.raised'
                        }
                    }}
                >
                    <Avatar
                        src={image || undefined}
                        alt=""
                        sx={{ width: 44, height: 44, filter: online ? 'none' : 'grayscale(100%)', opacity: online ? 1 : 0.75 }}
                    >
                        {name.charAt(0).toUpperCase()}
                    </Avatar>
                </Badge>

                <Typography aria-hidden noWrap sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }} title={name}>
                    {name}
                </Typography>
                <Typography aria-hidden sx={{ fontSize: 12, fontFamily: font.mono, color: 'text.secondary', lineHeight: 1.2 }}>
                    {inTurn ? 'Em turno' : `Nv. ${level}`}
                </Typography>

                {vitals.length > 0 && (
                    <Box aria-hidden sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {vitals.map(vital => (
                            <Box key={vital.key} data-vital={vital.key} sx={{ height: 4, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden' }}>
                                <Box sx={{ width: `${meterPercent(vital.value, vital.max)}%`, height: '100%', bgcolor: vital.barColor }} />
                            </Box>
                        ))}
                    </Box>
                )}
            </ButtonBase>
            {onOpenMenu && (
                <IconButton
                    size="small"
                    aria-label={`Abrir seções de ${name}`}
                    aria-haspopup="menu"
                    onClick={event => onOpenMenu(event.currentTarget)}
                    sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}
                >
                    <MoreVert sx={{ fontSize: 16 }} />
                </IconButton>
            )}
        </Box>
    );
}
