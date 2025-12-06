import { Box, Button, Checkbox, Chip, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { RarityType } from '@models/types/string'

interface FilterControlsProps {
    selectedRarities: RarityType[]
    selectedType: PerkTypeEnum | ''
    selectedElement: string
    selectedSpellLevel: string
    selectedExecution: string
    selectedItemKinds: string[]
    onRaritiesChange: (rarities: RarityType[]) => void
    onTypeChange: (type: PerkTypeEnum | '') => void
    onElementChange: (element: string) => void
    onSpellLevelChange: (level: string) => void
    onExecutionChange: (execution: string) => void
    onItemKindsChange: (kinds: string[]) => void
    onReroll: () => void
}

const rarityOptions: RarityType[] = [
    'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial'
]

// Filtrar apenas os tipos principais de perks (não elementos)
const typeOptions = [
    PerkTypeEnum.WEAPON,
    PerkTypeEnum.ARMOR,
    PerkTypeEnum.ITEM,
    PerkTypeEnum.SKILL,
    PerkTypeEnum.SPELL,
    PerkTypeEnum.BONUS,
    PerkTypeEnum.UPGRADE
]

const elementOptions = [
    'Fogo', 'Água', 'Ar', 'Terra', 'Eletricidade', 'Luz', 'Trevas', 'Não-Elemental',
    'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão', 'Tóxico', 'Gelo', 'Planta', 'Metal'
]

const spellLevelOptions = ['1', '2', '3', '4']

const executionOptions = ['Livre', 'Completa', 'Padrão', 'Movimento', 'Reação', 'Bônus']

const itemKindOptions = ['Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 'Capacidade', 'Padrão', 'Arremessável', 'Equipamento']

const selectSx = {
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
}

const labelSx = {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': { color: 'rgba(255, 255, 255, 0.9)' }
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        'WEAPON': 'Arma',
        'ARMOR': 'Armadura',
        'ITEM': 'Item',
        'SKILL': 'Habilidade',
        'SPELL': 'Magia'
    }
    return labels[ type ] || type
}

export function FilterControls({
    selectedRarities,
    selectedType,
    selectedElement,
    selectedSpellLevel,
    selectedExecution,
    selectedItemKinds,
    onRaritiesChange,
    onTypeChange,
    onElementChange,
    onSpellLevelChange,
    onExecutionChange,
    onItemKindsChange,
    onReroll
}: FilterControlsProps) {
    const isSpellSelected = selectedType === PerkTypeEnum.SPELL
    const isItemSelected = selectedType === PerkTypeEnum.ITEM
    
    console.log('[FilterControls] selectedType:', selectedType, 'PerkTypeEnum.ITEM:', PerkTypeEnum.ITEM, 'isItemSelected:', isItemSelected)
    
    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={labelSx}>Raridades</InputLabel>
                <Select
                    multiple
                    value={selectedRarities}
                    label="Raridades"
                    onChange={(e) => onRaritiesChange(e.target.value as RarityType[])}
                    input={<OutlinedInput label="Raridades" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.length === 0 ? (
                                <em style={{ opacity: 0.7 }}>Todas</em>
                            ) : selected.length <= 2 ? (
                                selected.map((value) => (
                                    <Chip key={value} label={value} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                ))
                            ) : (
                                <Chip label={`${selected.length} selecionadas`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                        </Box>
                    )}
                    MenuProps={{ sx: { zIndex: 10000 } }}
                    sx={selectSx}
                >
                    {rarityOptions.map(rarity => (
                        <MenuItem key={rarity} value={rarity}>
                            <Checkbox checked={selectedRarities.includes(rarity)} size="small" />
                            <ListItemText primary={rarity} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={labelSx}>Tipo</InputLabel>
                <Select
                    value={selectedType}
                    label="Tipo"
                    onChange={(e) => onTypeChange(e.target.value as PerkTypeEnum | '')}
                    MenuProps={{ sx: { zIndex: 10000 } }}
                    sx={selectSx}
                >
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {typeOptions.map(type => (
                        <MenuItem key={type} value={type}>{getTypeLabel(type)}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Filtros específicos para magias */}
            {isSpellSelected && (
                <>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel sx={labelSx}>Elemento</InputLabel>
                        <Select
                            value={selectedElement}
                            label="Elemento"
                            onChange={(e) => onElementChange(e.target.value)}
                            MenuProps={{ sx: { zIndex: 10000 } }}
                            sx={selectSx}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {elementOptions.map(el => (
                                <MenuItem key={el} value={el}>{el}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel sx={labelSx}>Nível</InputLabel>
                        <Select
                            value={selectedSpellLevel}
                            label="Nível"
                            onChange={(e) => onSpellLevelChange(e.target.value)}
                            MenuProps={{ sx: { zIndex: 10000 } }}
                            sx={selectSx}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {spellLevelOptions.map(lvl => (
                                <MenuItem key={lvl} value={lvl}>Nível {lvl}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={labelSx}>Execução</InputLabel>
                        <Select
                            value={selectedExecution}
                            label="Execução"
                            onChange={(e) => onExecutionChange(e.target.value)}
                            MenuProps={{ sx: { zIndex: 10000 } }}
                            sx={selectSx}
                        >
                            <MenuItem value=""><em>Todas</em></MenuItem>
                            {executionOptions.map(exec => (
                                <MenuItem key={exec} value={exec}>{exec}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </>
            )}

            {/* Filtros específicos para itens */}
            {isItemSelected && (
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={labelSx}>Tipo de Item</InputLabel>
                    <Select
                        multiple
                        value={selectedItemKinds}
                        label="Tipo de Item"
                        onChange={(e) => onItemKindsChange(e.target.value as string[])}
                        input={<OutlinedInput label="Tipo de Item" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.length === 0 ? (
                                    <em style={{ opacity: 0.7 }}>Todos</em>
                                ) : selected.length <= 2 ? (
                                    selected.map((value) => (
                                        <Chip key={value} label={value} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    ))
                                ) : (
                                    <Chip label={`${selected.length} tipos`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                            </Box>
                        )}
                        MenuProps={{ sx: { zIndex: 10000 } }}
                        sx={selectSx}
                    >
                        {itemKindOptions.map(kind => (
                            <MenuItem key={kind} value={kind}>
                                <Checkbox checked={selectedItemKinds.includes(kind)} size="small" />
                                <ListItemText primary={kind} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            <Button
                variant="outlined"
                startIcon={<ShuffleIcon />}
                onClick={onReroll}
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
    )
}
