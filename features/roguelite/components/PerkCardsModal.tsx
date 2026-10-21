/* eslint-disable no-case-declarations */
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { iconForRarity, rollRandomPerks } from '@features/roguelite/utils'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import StarIcon from '@mui/icons-material/Star'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { alpha, Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { RarityType } from '@models/types/string'
import { color } from '@themes/tokens'
import PerkCard from './PerkCard'

interface PerkCardsModalProps {
    open: boolean
    seed?: string
    level?: number // nível do personagem para ajustar pesos de raridade
}

export function PerkCardsModal({ open, seed, level }: PerkCardsModalProps) {
    const [ rerollKey, setRerollKey ] = useState(0)
    const [ isVisible, setIsVisible ] = useState(true)
    const [ selectedRarity, setSelectedRarity ] = useState<RarityType | ''>('')
    const [ selectedType, setSelectedType ] = useState<PerkTypeEnum | ''>('')

    // Opções de raridade disponíveis
    const rarityOptions: RarityType[] = [ 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial' ]

    // Opções de tipo disponíveis
    const typeOptions = Object.values(PerkTypeEnum)

    const rolled = useMemo(() => {
        const finalSeed = seed ?? `reroll-${rerollKey}-${Date.now()}`

        // Constrói filtros baseados nas seleções
        const filters = {
            rarities: selectedRarity ? [ selectedRarity ] : undefined,
            types: selectedType ? [ selectedType ] : undefined
        }

        return rollRandomPerks(finalSeed, level, filters)
    }, [ seed, rerollKey, level, selectedRarity, selectedType ])

    const handleReroll = () => {
        setRerollKey(prev => prev + 1)
    }

    const toggleVisibility = () => {
        setIsVisible(prev => !prev)
    }

    const getIcon = (rarity: string) => {
        switch (iconForRarity(rarity as any)) {
        case 'Star':
            return <StarIcon />
        case 'LocalFireDepartment':
            return <LocalFireDepartmentIcon />
        case 'Whatshot':
            return <WhatshotIcon />
        default:
            return <StarIcon />
        }
    }

    return (
        <>
            {/* Botão flutuante do olho - sempre visível quando modal está aberto */}
            {open && (
                <IconButton
                    onClick={toggleVisibility}
                    sx={{
                        position: 'fixed',
                        top: 40,
                        right: 20,
                        zIndex: 9999,
                        bgcolor: alpha(color.canvas, 0.8),
                        color: 'text.primary',
                        width: 56,
                        height: 56,
                        m: 0,
                        '&:hover': {
                            bgcolor: alpha(color.canvas, 0.9)
                        }
                    }}
                >
                    {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
            )}

            {/* Modal customizado que cobre 100% da tela */}
            {open && isVisible && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        m: '0 !important',
                        p: '0 !important',
                        width: '100vw',
                        height: '100dvh',
                        bgcolor: 'background.default',
                        zIndex: 9998,
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2.5
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} color="text.primary">
                            Escolha sua vantagem
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel
                                    sx={{
                                        color: 'text.secondary',
                                        '&.Mui-focused': { color: 'primary.main' }
                                    }}
                                >
                                    Raridade
                                </InputLabel>
                                <Select
                                    value={selectedRarity}
                                    label="Raridade"
                                    onChange={(e) => setSelectedRarity(e.target.value as RarityType | '')}
                                    MenuProps={{
                                        sx: {
                                            zIndex: 10000
                                        }
                                    }}
                                    sx={{
                                        color: 'text.primary',
                                        borderColor: color.borderControl,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: color.borderControl
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'text.secondary'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'text.secondary'
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Todas</em>
                                    </MenuItem>
                                    {rarityOptions.map(rarity => (
                                        <MenuItem key={rarity} value={rarity}>
                                            {rarity}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel
                                    sx={{
                                        color: 'text.secondary',
                                        '&.Mui-focused': { color: 'primary.main' }
                                    }}
                                >
                                    Tipo
                                </InputLabel>
                                <Select
                                    value={selectedType}
                                    label="Tipo"
                                    onChange={(e) => setSelectedType(e.target.value as PerkTypeEnum | '')}
                                    MenuProps={{
                                        sx: {
                                            zIndex: 10000
                                        }
                                    }}
                                    sx={{
                                        color: 'text.primary',
                                        borderColor: color.borderControl,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: color.borderControl
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'text.secondary'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'text.secondary'
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Todos</em>
                                    </MenuItem>
                                    {typeOptions.map(type => (
                                        <MenuItem key={type} value={type}>
                                            {type === 'WEAPON' ? 'Arma' :
                                                type === 'ARMOR' ? 'Armadura' :
                                                    type === 'ITEM' ? 'Item' :
                                                        type === 'SKILL' ? 'Habilidade' : type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                startIcon={<ShuffleIcon />}
                                onClick={handleReroll}
                                sx={{
                                    color: 'text.primary',
                                    borderColor: 'divider',
                                    '&:hover': {
                                        borderColor: color.borderStrong,
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                Rerrolar
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ pt: 0, pb: 2, px: 2, flexGrow: 1, overflow: 'auto' }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Grid
                                container
                                spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                                justifyContent="center"
                                alignItems="center"
                                sx={{
                                    maxWidth: '1600px',
                                    width: '100%'
                                }}
                            >
                                {rolled.map((perk, idx) => (
                                    <Grid
                                        key={idx}
                                        item
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        lg={3.2}
                                        xl={2.4}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <PerkCard
                                            title={perk.name}
                                            subtitle={(() => {
                                                switch (perk.perkType) {
                                                case PerkTypeEnum.ITEM:
                                                    const itemKind = (perk.data )?.kind;
                                                    if (itemKind === 'Padrão') {
                                                        return 'Item Padrão';
                                                    }
                                                    if (itemKind === 'Utilidade') {
                                                        return 'Utensílio';
                                                    }
                                                    if (itemKind === 'Capacidade') {
                                                        return 'Item de Capacidade';
                                                    }
                                                    if (itemKind === 'Especial') {
                                                        return 'Item Especial';
                                                    }
                                                    return itemKind || 'Item';
                                                case PerkTypeEnum.WEAPON:
                                                    const w = perk.data
                                                    const wCateg = w.categ.split('(')[1].slice(0, -1)
                                                    return w.weaponKind ? (w.weaponKind + ` (${wCateg})`) : w.categ;
                                                case PerkTypeEnum.EXPERTISE:
                                                    return `Bônus em ${perk.effects?.[0].expertiseName}`;
                                                case PerkTypeEnum.SKILL:
                                                    const skillType = perk.data?.type;
                                                    if (!skillType) {
                                                        return 'Poder Mágico';
                                                    }
                                                    return `Habilidade de ${skillType}`;
                                                default:
                                                    return perk.perkType;
                                                }
                                            })()}
                                            description={perk.description}
                                            rarity={perk.rarity}
                                            perkType={perk.perkType}
                                            element={undefined}
                                            icon={getIcon(perk.rarity)}
                                            weapon={
                                                perk.perkType === PerkTypeEnum.WEAPON ? (perk.data ) : undefined
                                            }
                                            armor={
                                                perk.perkType === PerkTypeEnum.ARMOR ? (perk.data ) : undefined
                                            }
                                            attributes={
                                                perk.perkType === PerkTypeEnum.SKILL
                                                    ? (() => {
                                                        const attrs = [
                                                            {
                                                                label: 'Tipo',
                                                                value: (perk.data )?.type === 'Habilidade' ? 'Bônus' : (perk.data )?.type ?? 'Bônus'
                                                            }
                                                        ];

                                                        // Adiciona origem apenas se existir
                                                        if ((perk.data )?.origin) {
                                                            attrs.push({
                                                                label: 'Origem',
                                                                value: (perk.data ).origin
                                                            });
                                                        }

                                                        // Adiciona bônus se aplicável
                                                        if ((perk.data )?.type === 'Bônus' &&
                                                            (perk.data )?.effects &&
                                                            (perk.data )?.effects.length > 0) {
                                                            attrs.push({
                                                                label: 'Bônus',
                                                                value: `+${(perk.data )?.effects[0]
                                                                } perícia`
                                                            });
                                                        }

                                                        // Adiciona nível se existir
                                                        if ((perk.data )?.level) {
                                                            attrs.push({
                                                                label: 'Nível',
                                                                value: (perk.data ).level
                                                            });
                                                        }

                                                        return attrs;
                                                    })()
                                                    : perk.perkType === PerkTypeEnum.ITEM
                                                        ? (() => {
                                                            const attrs = [];

                                                            // Adiciona tipo se existir
                                                            if ((perk.data )?.kind) {
                                                                attrs.push({
                                                                    label: 'Tipo',
                                                                    value: (perk.data ).kind
                                                                });
                                                            }

                                                            // Adiciona espaço se for Equipamento e existir
                                                            if ((perk.data )?.kind === 'Equipamento' && (perk.data )?.space) {
                                                                attrs.push({
                                                                    label: 'Espaço',
                                                                    value: (perk.data ).space
                                                                });
                                                            }

                                                            // Adiciona peso se existir
                                                            if ((perk.data )?.weight !== undefined) {
                                                                attrs.push({
                                                                    label: 'Peso',
                                                                    value: `${(perk.data ).weight} kg`
                                                                });
                                                            }

                                                            return attrs.length > 0 ? attrs : undefined;
                                                        })()
                                                        : undefined
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    )
}
