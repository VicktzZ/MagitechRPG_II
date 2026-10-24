import { rarityColor } from '@constants';
import type { Weapon } from '@models';
import type { RarityType } from '@models/types/string';
import { CardGiftcard, Delete, ExpandMore } from '@mui/icons-material';
import { Box, Button, ButtonBase, Chip, Collapse, Typography } from '@mui/material';
import { color, font } from '@themes/tokens';
import { normalizeToArray } from '@utils/normalizeToArray';
import { type MouseEvent as ReactMouseEvent, type ReactElement, useState } from 'react';
import { getItemDetails } from './getItemDetails';
import { armorPoints, entryWeight } from './inventoryList';
import type { InventoryItemType } from './inventoryTypes';
import { formatWeight, getItemTypeConfig } from './itemTypeConfig';
import WeaponCombatActions from './WeaponCombatActions';

/** Ações que um cartão de item dispara */
export interface InventoryItemCardActions {
    /** Há outros jogadores na sessão: mostra o botão de doar */
    canDonate: boolean;
    onWeaponHit: (weapon: Weapon, e: ReactMouseEvent) => Promise<void>;
    onWeaponDamage: (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => Promise<void>;
    onDonate: (item: any, type: InventoryItemType, e: ReactMouseEvent) => void;
    /** Pede para remover o item; quem usa abre a confirmação */
    onRemove: (item: any, type: InventoryItemType) => void;
}

interface InventoryItemCardProps extends InventoryItemCardActions {
    /** Arma, armadura ou item (os campos lidos variam por tipo, inclusive campos legados como `ap`) */
    item: any;
    type: InventoryItemType;
    weightUnitSuffix: string;
}

/** O número que mais importa do item, para a linha fechada: dano da arma, pontos de armadura ou quantidade */
function keyStat(item: any, type: InventoryItemType): { value: string; caption: string } | null {
    if (type === 'weapon') return item.effect?.value ? { value: String(item.effect.value), caption: 'dano' } : null;
    if (type === 'armor') return { value: `+${armorPoints(item)}`, caption: 'AP' };
    return (item.quantity ?? 1) > 1 ? { value: `x${item.quantity}`, caption: '' } : null;
}

/**
 * Cartão de um item do inventário: na linha fechada o tipo (filete e ícone), o nome, a raridade, o número principal e o peso; as armas
 * trazem acerto e dano à vista. Aberto, mostra descrição, detalhes, acessórios, o crítico da arma, doar e remover.
 */
export default function InventoryItemCard({ item, type, weightUnitSuffix, canDonate, onWeaponHit, onWeaponDamage, onDonate, onRemove }: InventoryItemCardProps): ReactElement {
    const [ open, setOpen ] = useState(false);
    const config = getItemTypeConfig(type);
    const Glyph = config.icon;
    const details = getItemDetails(item, type, weightUnitSuffix);
    const rarityTint = (item.rarity ? rarityColor[item.rarity as RarityType] : undefined) ?? color.inkMuted;
    const stat = keyStat(item, type);
    const weight = entryWeight({ item, type });
    const bodyId = `inventory-item-${String(item.id ?? item.name).replace(/\W+/g, '-')}`;

    return (
        <Box
            component="li"
            data-testid="inventory-item"
            data-type={type}
            data-name={item.name}
            sx={{
                listStyle: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '3px solid',
                borderLeftColor: config.color,
                borderRadius: 2,
                bgcolor: 'background.raised',
                transition: 'border-color 120ms',
                '&:hover': { borderColor: color.borderStrong, borderLeftColor: config.color }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pr: 1.5 }}>
                <ButtonBase
                    onClick={() => { setOpen(value => !value) }}
                    aria-expanded={open}
                    aria-controls={bodyId}
                    data-testid="inventory-item-toggle"
                    sx={{
                        flex: '1 1 260px',
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        borderRadius: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary'
                        }}
                    >
                        <Glyph aria-hidden sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{item.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">{item.kind ? `${config.label} · ${item.kind}` : config.label}</Typography>
                            {item.rarity && (
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} data-testid="inventory-item-rarity">
                                    <Box component="span" aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: rarityTint }} />
                                    <Typography variant="caption" color="text.secondary">{item.rarity}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {stat && (
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }} data-testid="inventory-item-stat">
                            <Typography sx={{ fontFamily: font.mono, fontSize: 15, lineHeight: 1.2 }}>{stat.value}</Typography>
                            {stat.caption && <Typography variant="caption" color="text.secondary">{stat.caption}</Typography>}
                        </Box>
                    )}
                    <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 48 }} data-testid="inventory-item-weight">
                        <Typography sx={{ fontFamily: font.mono, fontSize: 13, color: 'text.secondary' }}>{weight > 0 ? formatWeight(weight, weightUnitSuffix) : '-'}</Typography>
                    </Box>
                    <ExpandMore aria-hidden sx={{ color: 'text.secondary', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 120ms', flexShrink: 0 }} />
                </ButtonBase>

                {type === 'weapon' && (
                    <Box sx={{ pb: { xs: 1, sm: 0 }, pl: { xs: 1.5, sm: 0 } }}>
                        <WeaponCombatActions weapon={item as Weapon} onHit={onWeaponHit} onDamage={onWeaponDamage} variant="quick" />
                    </Box>
                )}
            </Box>

            <Collapse in={open} unmountOnExit>
                <Box
                    id={bodyId}
                    sx={{ px: 1.5, pb: 1.5, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                >
                    {item.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.description}</Typography>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1.5 }} data-testid="inventory-item-details">
                        {details.map(detail => (
                            <Box key={detail.label}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{detail.label}</Typography>
                                <Typography
                                    sx={{
                                        fontFamily: font.mono,
                                        fontSize: 14,
                                        fontWeight: detail.highlight ? 700 : 400,
                                        color: detail.highlight ? 'text.primary' : 'text.secondary',
                                        overflowWrap: 'anywhere'
                                    }}
                                >
                                    {detail.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {item.accessories && item.accessories.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Acessórios</Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                {normalizeToArray<string>(item.accessories).map((accessory, index) => (
                                    <Chip key={index} label={accessory} size="small" variant="outlined" sx={{ borderColor: 'divider' }} />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {type === 'weapon' && <WeaponCombatActions weapon={item as Weapon} onHit={onWeaponHit} onDamage={onWeaponDamage} variant="full" />}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                        {canDonate && (
                            <Button
                                size="small"
                                color="secondary"
                                startIcon={<CardGiftcard fontSize="small" />}
                                onClick={(event) => { onDonate(item, type, event) }}
                                aria-label={`Doar ${item.name}`}
                                sx={{ textTransform: 'none' }}
                            >
                                Doar
                            </Button>
                        )}
                        <Button
                            size="small"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => { onRemove(item, type) }}
                            aria-label={`Remover ${item.name}`}
                            data-testid="inventory-item-remove"
                            sx={{ textTransform: 'none' }}
                        >
                            Remover
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}
