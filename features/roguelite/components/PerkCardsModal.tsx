/* eslint-disable no-case-declarations */
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { iconForRarity, rollRandomPerks } from '@features/roguelite/utils'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { RarityType } from '@models/types/string'
import PerkCard from './PerkCard'
import { Weapon } from '@components/charsheet/subcomponents/Weapon'

interface PerkCardsModalProps {
    open: boolean
    seed?: string
    level?: number // nível do personagem para ajustar pesos de raridade
}

export function PerkCardsModal({ open, seed, level }: PerkCardsModalProps) {
    const [rerollKey, setRerollKey] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [selectedRarity, setSelectedRarity] = useState<RarityType | ''>('')
    const [selectedType, setSelectedType] = useState<PerkTypeEnum | ''>('')

    // Opções de raridade disponíveis
    const rarityOptions: RarityType[] = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial']

    // Opções de tipo disponíveis
    const typeOptions = Object.values(PerkTypeEnum)

    const rolled = useMemo(() => {
        const finalSeed = seed ?? `reroll-${rerollKey}-${Date.now()}`

        // Constrói filtros baseados nas seleções
        const filters = {
            rarities: selectedRarity ? [selectedRarity] : undefined,
            types: selectedType ? [selectedType] : undefined
        }

        return rollRandomPerks(finalSeed, level, filters)
    }, [seed, rerollKey, level, selectedRarity, selectedType])

    const handleReroll = () => {
        setRerollKey(prev => prev + 1)
    }

    const toggleVisibility = () => {
        setIsVisible(prev => !prev)
    }

    const getIcon = (rarity: string) => {
        switch (iconForRarity(rarity as any)) {
            case 'AutoAwesome':
                return <AutoAwesomeIcon />
            case 'LocalFireDepartment':
                return <LocalFireDepartmentIcon />
            case 'Whatshot':
                return <WhatshotIcon />
            default:
                return <AutoAwesomeIcon />
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
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        width: 56,
                        height: 56,
                        m: 0,
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.9)'
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
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
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
                        <Typography variant="h5" fontWeight={700} color="white">
                            Escolha sua vantagem
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-focused': { color: 'rgba(255, 255, 255, 0.9)' }
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
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.7)'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'rgba(255, 255, 255, 0.7)'
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
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-focused': { color: 'rgba(255, 255, 255, 0.9)' }
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
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255, 255, 255, 0.7)'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'rgba(255, 255, 255, 0.7)'
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
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)'
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
                                                    const itemKind = (perk.data as any)?.kind;
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
                                                perk.perkType === PerkTypeEnum.WEAPON ? (perk.data as any) : undefined
                                            }
                                            armor={
                                                perk.perkType === PerkTypeEnum.ARMOR ? (perk.data as any) : undefined
                                            }
                                            attributes={
                                                perk.perkType === PerkTypeEnum.SKILL
                                                    ? (() => {
                                                        const attrs = [
                                                            {
                                                                label: 'Tipo',
                                                                value: (perk.data as any)?.type === 'Habilidade' ? 'Bônus' : (perk.data as any)?.type ?? 'Bônus'
                                                            }
                                                        ];

                                                        // Adiciona origem apenas se existir
                                                        if ((perk.data as any)?.origin) {
                                                            attrs.push({
                                                                label: 'Origem',
                                                                value: (perk.data as any).origin
                                                            });
                                                        }

                                                        // Adiciona bônus se aplicável
                                                        if ((perk.data as any)?.type === 'Bônus' &&
                                                            (perk.data as any)?.effects &&
                                                            (perk.data as any)?.effects.length > 0) {
                                                            attrs.push({
                                                                label: 'Bônus',
                                                                value: `+${(perk.data as any)?.effects[0]
                                                                    } perícia`
                                                            });
                                                        }

                                                        // Adiciona nível se existir
                                                        if ((perk.data as any)?.level) {
                                                            attrs.push({
                                                                label: 'Nível',
                                                                value: (perk.data as any).level
                                                            });
                                                        }

                                                        return attrs;
                                                    })()
                                                    : perk.perkType === PerkTypeEnum.ITEM
                                                        ? (() => {
                                                            const attrs = [];

                                                            // Adiciona tipo se existir
                                                            if ((perk.data as any)?.kind) {
                                                                attrs.push({
                                                                    label: 'Tipo',
                                                                    value: (perk.data as any).kind
                                                                });
                                                            }

                                                            // Adiciona espaço se for Equipamento e existir
                                                            if ((perk.data as any)?.kind === 'Equipamento' && (perk.data as any)?.space) {
                                                                attrs.push({
                                                                    label: 'Espaço',
                                                                    value: (perk.data as any).space
                                                                });
                                                            }

                                                            // Adiciona peso se existir
                                                            if ((perk.data as any)?.weight !== undefined) {
                                                                attrs.push({
                                                                    label: 'Peso',
                                                                    value: `${(perk.data as any).weight} kg`
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
