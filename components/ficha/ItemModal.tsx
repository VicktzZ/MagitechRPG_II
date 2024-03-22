import { InputLabel, MenuItem, Select, TextField, Box, FormControl } from '@mui/material'
import { type ReactElement } from 'react'
import type { MergedItems, RarityType } from '@types'
import { armorKind, itemKind, rarities, weaponCateg, weaponKind } from '@constants/dataTypes'

export default function ItemModal({ 
    item,
    setItem,
    itemType
}: {
    item: Partial<MergedItems<'Leve' | 'Pesada'>>,
    setItem: React.Dispatch<React.SetStateAction<Partial<MergedItems<'Leve' | 'Pesada'>>>>
    itemType: 'weapon' | 'armor' | 'item'
}): ReactElement {
    return (
        <Box
            display='flex'
            flexDirection='column'
            width='100%'
            gap={2}
        >
            <Box
                display='flex'
                gap={2}
            >
                <TextField
                    label="Nome"
                    value={item.name}
                    onChange={e => { setItem(state => ({ ...state, name: e.target.value })) }}
                    sx={{
                        width: '30%'
                    }}
                />
                <FormControl sx={{ width: '20%' }}>
                    <InputLabel id="rarity">Raridade</InputLabel>
                    <Select
                        labelId="rarity"
                        id="raritySelect"
                        value={item.rarity}
                        label="Raridade"
                        onChange={e => { setItem(state => ({ ...state, rarity: e.target.value as RarityType })) }}
                    >
                        <MenuItem value='Nenhuma'>Nenhuma</MenuItem>
                        {rarities.map(rarity => (
                            <MenuItem key={rarity} value={rarity}>{rarity}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField 
                    label="Descrição"
                    value={item.description}
                    onChange={e => { setItem(state => ({ ...state, description: e.target.value })) }}
                    fullWidth
                />
            </Box>
            <Box
                display='flex'
                gap={2}
            >
                <FormControl sx={{ width: '15%' }}>
                    <InputLabel id="kind">Tipo</InputLabel>
                    <Select
                        labelId="kind"
                        id="kindSelect"
                        value={item.kind}
                        label="Tipo"
                        onChange={e => { setItem(state => ({ ...state, kind: e.target.value as any })) }}
                    >
                        {itemType === 'weapon' ? weaponKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        )) : itemType === 'armor' ? armorKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        )) : itemKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ width: '18%' }}>
                    <InputLabel id="kind">Categoria</InputLabel>
                    <Select
                        labelId="kind"
                        id="kindSelect"
                        value={item.kind}
                        label="Tipo"
                        onChange={e => { setItem(state => ({ ...state, kind: e.target.value as any })) }}
                    >
                        {itemType === 'weapon' ? weaponCateg.map(categ => (
                            <MenuItem key={categ} value={categ}>{categ}</MenuItem>
                        )) : armorKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {itemType === 'weapon' && (
                    <FormControl sx={{ width: '10%', ml: -1 }}>
                        <InputLabel id="categType"></InputLabel>
                        <Select
                            labelId="categType"
                            id="categTypeSelect"
                            value={item.kind}
                            onChange={e => { setItem(state => ({ ...state, kind: e.target.value as any })) }}
                        >
                            <MenuItem value='Leve'>Leve</MenuItem>
                            <MenuItem value='Pesada'>Pesada</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Box>
            <Box
                display='flex'
                gap={2}
            >
                <TextField
                    label="Quantidade"
                    value={item.quantity}
                    type='number'
                    onChange={e => { setItem(state => ({ ...state, quantity: Number(e.target.value) })) }}
                />
                <TextField
                    label="Peso"
                    type='number'
                    value={item.weight}
                    onChange={e => { setItem(state => ({ ...state, weight: Number(e.target.value) })) }}
                />
            </Box>
        </Box>
    )
}