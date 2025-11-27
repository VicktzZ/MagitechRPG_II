/* eslint-disable no-case-declarations */
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { iconForRarity } from '@features/roguelite/utils'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Box, Button, CircularProgress, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import type { RarityType } from '@models/types/string'
import PerkCard from './PerkCard'
import { Weapon } from '@components/charsheet/subcomponents/Weapon'
import { create as createRandom } from 'random-seed'

interface PerkCardsModalProps {
    open: boolean
    seed?: string
    level?: number // nível do personagem para ajustar pesos de raridade
    perkAmount?: number
}

export function PerkCardsModal({ open, seed, level, perkAmount = 5 }: PerkCardsModalProps) {
    // Gerar ou obter seed fixa do localStorage
    const [userSeed, setUserSeed] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            let storedSeed = localStorage.getItem('roguelite-user-seed')
            if (!storedSeed) {
                storedSeed = Math.random().toString(36).substring(2, 15)
                localStorage.setItem('roguelite-user-seed', storedSeed)
            }
            return storedSeed
        }
        return Math.random().toString(36).substring(2, 15)
    })
    
    const [rollCount, setRollCount] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [selectedRarity, setSelectedRarity] = useState<RarityType | ''>('')
    const [selectedType, setSelectedType] = useState<PerkTypeEnum | ''>('')
    const [allPerks, setAllPerks] = useState<any[]>([])
    const [rolled, setRolled] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Opções de raridade disponíveis
    const rarityOptions: RarityType[] = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial']

    // Opções de tipo disponíveis
    const typeOptions = Object.values(PerkTypeEnum)

    // Função para buscar perks da API (sem seed para maximizar cache)
    const fetchPerks = async (rarityToUse?: string, typeToUse?: string) => {
        setLoading(true)
        setError(null)
        
        try {
            const params = new URLSearchParams()
            
            if (rarityToUse) {
                params.append('rarity', rarityToUse)
            }
            
            if (typeToUse) {
                params.append('perkType', typeToUse)
            }

            // Adicionar nível do usuário para filtragem e ajuste de raridade
            if (level !== undefined) {
                params.append('level', level.toString())
            }

            const response = await fetch(`/api/roguelite/perks?${params}`)
            
            if (!response.ok) {
                throw new Error('Erro ao buscar perks')
            }
            
            const result = await response.json()
            
            // API retorna { data: [...], _query: {...} } quando há filtros
            // ou objeto com collections quando não há filtros
            let perks: any[] = []
            
            if (Array.isArray(result)) {
                perks = result
            } else if (result.data) {
                perks = result.data
            } else {
                // Unificar todas as collections em array único
                Object.values(result).forEach((value: any) => {
                    if (Array.isArray(value)) {
                        perks.push(...value)
                    }
                })
            }
            
            setAllPerks(perks)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            setAllPerks([])
            setRolled([])
        } finally {
            setLoading(false)
        }
    }

    // Função para fazer shuffle client-side com seed fixa
    const shufflePerks = (perks: any[], count: number, seed: string, rollNumber: number) => {
        if (perks.length <= count) return perks
        
        // Criar seed combinada: userSeed + rollNumber
        const combinedSeed = `${seed}-${rollNumber}`
        const rng = createRandom(combinedSeed)
        
        // Fisher-Yates shuffle com seed
        const shuffled = [...perks]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(rng.random() * (i + 1))
            const temp = shuffled[i]
            shuffled[i] = shuffled[randomIndex]
            shuffled[randomIndex] = temp
        }
        
        return shuffled.slice(0, count)
    }

    // Buscar perks quando o modal abre ou filtros mudam
    useEffect(() => {
        if (open) {
            fetchPerks(selectedRarity || undefined, selectedType || undefined)
        }
    }, [open, selectedRarity, selectedType])

    // Fazer shuffle quando os dados são carregados ou muda o rollCount
    useEffect(() => {
        if (allPerks.length > 0) {
            const shuffled = shufflePerks(allPerks, perkAmount, userSeed, rollCount)
            setRolled(shuffled)
        }
    }, [allPerks, rollCount, perkAmount, userSeed])

    const handleReroll = () => {
        // Incrementar roll count para nova variação com mesma seed
        setRollCount(prev => prev + 1)
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
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={60} sx={{ color: 'white' }} />
                                    <Typography variant="h6" color="white">
                                        Buscando vantagens...
                                    </Typography>
                                </Box>
                            ) : error ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h6" color="error">
                                        Erro ao carregar perks
                                    </Typography>
                                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                        {error}
                                    </Typography>
                                    <Button
                                        variant="outlined"
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
                                        Tentar novamente
                                    </Button>
                                </Box>
                            ) : (
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
                                    {rolled.map((perk, idx) => {
                                    // Debug: Log para verificar estrutura dos dados
                                    console.log('Perk data:', perk);
                                    
                                    return (
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
                                            title={perk.name || perk.title || 'Sem nome'}
                                            subtitle={(() => {
                                                switch (perk.perkType) {
                                                case PerkTypeEnum.ITEM:
                                                    const itemKind = (perk.data as any)?.kind || (perk as any)?.kind;
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
                                                    const w = perk.data || perk;
                                                    const wCateg = w?.categ?.split('(')?.[1]?.slice(0, -1) || w?.categ;
                                                    return w?.weaponKind ? (w.weaponKind + ` (${wCateg})`) : w?.categ || 'Arma';
                                                case PerkTypeEnum.EXPERTISE:
                                                    return `Bônus em ${perk.effects?.[0]?.expertiseName || 'Perícia'}`;
                                                case PerkTypeEnum.SKILL:
                                                    const skillType = (perk.data as any)?.type || (perk as any)?.type;
                                                    if (!skillType) {
                                                        return 'Poder Mágico';
                                                    }
                                                    return `Habilidade de ${skillType}`;
                                                case PerkTypeEnum.SPELL:
                                                    const spellElement = (perk.data as any)?.element || (perk as any)?.element || 'Neutro';
                                                    const spellLevel = (perk.data as any)?.level || (perk as any)?.level || 1;
                                                    return `Magia de ${spellElement} (Nível ${spellLevel})`;
                                                default:
                                                    return perk.perkType;
                                            }
                                            })()}
                                            description={
                                                perk.perkType === PerkTypeEnum.SPELL 
                                                    ? ((perk.data as any)?.stages?.[0] || (perk as any)?.stages?.[0] || perk.description || 'Sem descrição')
                                                    : (perk.description || 'Sem descrição')
                                            }
                                            rarity={perk.rarity || 'Comum'}
                                            perkType={perk.perkType}
                                            element={perk.element}
                                            icon={getIcon(perk.rarity || 'Comum')}
                                            weapon={
                                                perk.perkType === PerkTypeEnum.WEAPON ? (perk.data || perk) : undefined
                                            }
                                            armor={
                                                perk.perkType === PerkTypeEnum.ARMOR ? (perk.data || perk) : undefined
                                            }
                                            attributes={
                                                perk.perkType === PerkTypeEnum.SPELL
                                                    ? (() => {
                                                        const spellData = (perk.data as any) || perk;
                                                        const attrs = [];

                                                        // Tipo de magia
                                                        if (spellData?.type) {
                                                            attrs.push({
                                                                label: 'Tipo',
                                                                value: spellData.type
                                                            });
                                                        }

                                                        // Alcance
                                                        if (spellData?.range) {
                                                            attrs.push({
                                                                label: 'Alcance',
                                                                value: spellData.range
                                                            });
                                                        }

                                                        // Execução
                                                        if (spellData?.execution) {
                                                            attrs.push({
                                                                label: 'Execução',
                                                                value: spellData.execution
                                                            });
                                                        }


                                                        // Custo de mana
                                                        if (spellData?.mpCost !== undefined) {
                                                            attrs.push({
                                                                label: 'Custo',
                                                                value: `${spellData.mpCost} MP`
                                                            });
                                                        }

                                                        return attrs.length > 0 ? attrs : undefined;
                                                    })()
                                                    : perk.perkType === PerkTypeEnum.SKILL
                                                        ? (() => {
                                                            const skillData = (perk.data as any) || perk;
                                                            const attrs = [
                                                                {
                                                                    label: 'Tipo',
                                                                    value: skillData?.type === 'Habilidade' ? 'Bônus' : skillData?.type ?? 'Bônus'
                                                                }
                                                            ];

                                                            // Adiciona origem apenas se existir
                                                            if (skillData?.origin) {
                                                                attrs.push({
                                                                    label: 'Origem',
                                                                    value: skillData.origin
                                                                });
                                                            }

                                                            // Adiciona bônus se aplicável
                                                            if (skillData?.type === 'Bônus' &&
                                                                skillData?.effects &&
                                                                skillData?.effects.length > 0) {
                                                                attrs.push({
                                                                    label: 'Bônus',
                                                                    value: `+${skillData?.effects[0]} perícia`
                                                                });
                                                            }

                                                            // Adiciona nível se existir
                                                            if (skillData?.level) {
                                                                attrs.push({
                                                                    label: 'Nível',
                                                                    value: skillData.level
                                                                });
                                                            }

                                                            return attrs;
                                                        })()
                                                        : perk.perkType === PerkTypeEnum.ITEM
                                                            ? (() => {
                                                                const itemData = (perk.data as any) || perk;
                                                                const attrs = [];

                                                                // Adiciona tipo se existir
                                                                if (itemData?.kind) {
                                                                    attrs.push({
                                                                        label: 'Tipo',
                                                                        value: itemData.kind
                                                                    });
                                                                }

                                                                // Adiciona espaço se for Equipamento e existir
                                                                if (itemData?.kind === 'Equipamento' && itemData?.space) {
                                                                    attrs.push({
                                                                        label: 'Espaço',
                                                                        value: itemData.space
                                                                    });
                                                                }

                                                                // Adiciona peso se existir
                                                                if (itemData?.weight !== undefined) {
                                                                    attrs.push({
                                                                        label: 'Peso',
                                                                        value: `${itemData.weight} kg`
                                                                    });
                                                                }

                                                                return attrs.length > 0 ? attrs : undefined;
                                                            })()
                                                            : undefined
                                            }
                                        />
                                    </Grid>
                                    );
                                })}
                                </Grid>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    )
}
