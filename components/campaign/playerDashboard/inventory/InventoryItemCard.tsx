import { rarityColor } from '@constants';
import type { Weapon } from '@models';
import type { RarityType } from '@models/types/string';
import { CardGiftcard, Delete, ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Chip,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { getItemDetails } from './getItemDetails';
import type { InventoryItemType } from './inventoryTypes';
import { getItemTypeConfig } from './itemTypeConfig';
import { normalizeToArray } from '@utils/normalizeToArray';
import WeaponCombatActions from './WeaponCombatActions';

/** Ações que um cartão de item dispara (todas recebem o evento do clique para não expandir o accordion) */
export interface InventoryItemCardActions {
    /** Há outros jogadores na sessão: mostra o botão de doar */
    canDonate: boolean;
    onWeaponHit: (weapon: Weapon, e: ReactMouseEvent) => Promise<void>;
    onWeaponDamage: (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => Promise<void>;
    onDonate: (item: any, type: InventoryItemType, e: ReactMouseEvent) => void;
    onDelete: (item: any, type: InventoryItemType, e: ReactMouseEvent) => Promise<void>;
}

interface InventoryItemCardProps extends InventoryItemCardActions {
    /** Arma, armadura ou item (os campos lidos variam por tipo, inclusive campos legados como `ap`) */
    item: any;
    type: InventoryItemType;
    weightUnitSuffix: string;
}

/** Cartão expansível de um item do inventário: resumo na linha e, ao abrir, detalhes, descrição, ações de combate (armas), doar e remover */
export default function InventoryItemCard({
    item,
    type,
    weightUnitSuffix,
    canDonate,
    onWeaponHit,
    onWeaponDamage,
    onDonate,
    onDelete
}: InventoryItemCardProps): ReactElement {
    const typeConfig = getItemTypeConfig(type);
    const TypeIcon = typeConfig.icon;

    const details = getItemDetails(item, type, weightUnitSuffix);
    const rarityColorValue = (item.rarity ? rarityColor[item.rarity as RarityType] : undefined) ?? color.inkMuted;

    return (
        <Accordion
            elevation={0}
            sx={{
                bgcolor: 'background.raised',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:before': { display: 'none' },
                '&:hover': {
                    borderColor: alpha(typeConfig.color, 0.38),
                    bgcolor: 'action.hover'
                },
                mb: 1.5,
                transition: 'all 0.2s ease'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                    minHeight: 64,
                    '& .MuiAccordionSummary-content': {
                        my: 1.5,
                        gap: 2
                    }
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                    {/* Ícone e Nome */}
                    <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                        <Box 
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: alpha(typeConfig.color, 0.08),
                                border: `2px solid ${alpha(typeConfig.color, 0.19)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <TypeIcon sx={{ color: typeConfig.color, fontSize: '1.3rem' }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {typeConfig.label}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Tags */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {item.rarity && (
                            <Chip
                                label={item.rarity}
                                size="small"
                                sx={{
                                    bgcolor: item.rarity === 'Amaldiçoado' ? 'transparent' : alpha(rarityColorValue, 0.12),
                                    color: rarityColorValue,
                                    border: '1px solid',
                                    borderColor: alpha(rarityColorValue, 0.25),
                                    fontWeight: 600,
                                    height: 24
                                }}
                            />
                        )}
                        {type === 'weapon' && (
                            <Chip
                                label={`${item.effect.value} dano`}
                                size="small"
                                sx={{
                                    bgcolor: alpha(color.danger, 0.12),
                                    color: 'error.main',
                                    fontWeight: 600,
                                    height: 24
                                }}
                            />
                        )}
                        {type === 'armor' && (
                            <Chip
                                label={`+${item.ap || item.value || 0} AP`}
                                size="small"
                                sx={{
                                    bgcolor: alpha(color.cyan, 0.12),
                                    color: 'info.main',
                                    fontWeight: 600,
                                    height: 24
                                }}
                            />
                        )}
                        {type === 'item' && item.quantity && item.quantity > 1 && (
                            <Chip
                                label={`x${item.quantity}`}
                                size="small"
                                sx={{
                                    bgcolor: alpha(color.success, 0.12),
                                    color: 'success.main',
                                    fontWeight: 600,
                                    height: 24
                                }}
                            />
                        )}
                    </Stack>
                </Stack>
            </AccordionSummary>
            
            <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    {/* Detalhes em Grid */}
                    <Box 
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 2
                        }}
                    >
                        {details.map((detail, index) => (
                            <Box 
                                key={index}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: detail.highlight 
                                        ? alpha(typeConfig.color, 0.06) 
                                        : 'background.default',
                                    border: '1px solid',
                                    borderColor: detail.highlight
                                        ? alpha(typeConfig.color, 0.19)
                                        : 'divider'
                                }}
                            >
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    {detail.label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: detail.highlight ? typeConfig.color : 'text.primary' }}>
                                    {detail.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    
                    {/* Acessórios */}
                    {item.accessories && item.accessories.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Acessórios
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {normalizeToArray<string>(item.accessories).map((acc, idx) => (
                                    <Chip
                                        key={idx}
                                        label={acc}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 24 }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}
                    
                    {/* Descrição */}
                    {item.description && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Descrição
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    lineHeight: 1.6,
                                    color: 'text.secondary'
                                }}
                            >
                                {item.description}
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Ações de Combate (somente para armas) */}
                    {type === 'weapon' && (
                        <WeaponCombatActions weapon={item as Weapon} onHit={onWeaponHit} onDamage={onWeaponDamage} />
                    )}

                    {/* Botões de Ação */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        {/* Botão de Doar */}
                        {canDonate && (
                            <Tooltip title="Doar para outro jogador">
                                <IconButton
                                    size="small"
                                    onClick={(e) => onDonate(item, type, e)}
                                    sx={{
                                        color: 'info.main',
                                        '&:hover': {
                                            bgcolor: alpha(color.cyan, 0.08)
                                        }
                                    }}
                                >
                                    <CardGiftcard fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        
                        {/* Botão de Deletar */}
                        <Tooltip title="Remover do inventário">
                            <IconButton
                                size="small"
                                onClick={async (e) => await onDelete(item, type, e)}
                                sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: alpha(color.danger, 0.08)
                                    }
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
