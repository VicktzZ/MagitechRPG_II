/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Grid, Typography, useMediaQuery, useTheme, Modal, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import React, { useEffect, type ReactElement, useMemo, memo, useState } from 'react'
import { useFormikContext, type FormikContextType } from 'formik'
import { lineageItems } from '@constants/lineageitems'
import { red, yellow } from '@mui/material/colors'
import { CustomIconButton } from '@layout'
import { Edit } from '@mui/icons-material'
import { Item } from '@components/ficha'
import type { Ficha, LineageNames, Weapon, Armor, Item } from '@types'

type ItemName = 'weapon' | 'item' | 'armor'

const Inventory = memo(({ disabled }: { disabled?: boolean }): ReactElement => {
    const f: FormikContextType<Ficha> = useFormikContext()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ weapon, setWeapon ] = useState<Partial<Weapon>>({})
    const [ armor, setArmor ] = useState<Partial<Armor>>({})
    const [ item, setItem ] = useState<Partial<Item>>({})

    const [ modalOpen, setModalOpen ] = useState<boolean>(false)
    const [ modalContent, setModalContent ] = useState<ReactElement>(<></>)
    const [ addButtonsStyle, setAddButtonsStyle ] = useState<Record<ItemName, 'outlined' | 'contained'>>({
        weapon: 'contained',
        armor: 'outlined',
        item: 'outlined'
    })

    const changeModalContent = (itemName: ItemName): void => {
        setAddButtonsStyle({
            weapon: 'outlined',
            armor: 'outlined',
            item: 'outlined',
            [itemName]: 'contained'
        })

        const content: Record<ItemName, ReactElement> = {
            weapon: <>
                <TextField 
                    label="Nome"
                />
                <TextField 
                    label="Descrição"
                />
                <FormControl fullWidth>
                  <InputLabel id="rarity">Raridade</InputLabel>
                  <Select
                    labelId="rarity"
                    id="raritySelect"
                    value={weapon.rarity ?? "Nenhuma"}
                    label="Raridade"
                    onChange={e => { setWeapon(state => ({ ...state, rarity: e.target.value })) }}
                  >
                    <MenuItem value='Nenhuma'>Nenhuma</MenuItem>
                    <MenuItem value='Comum'>Comum</MenuItem>
                    <MenuItem value='Incomum'>Incomum</MenuItem>
                    <MenuItem value='Raro'>Raro</MenuItem>
                    <MenuItem value='Épico'>Épico</MenuItem>
                    <MenuItem value='Lendário'>Lendário</MenuItem>
                    <MenuItem value='Relíquia'>Relíquia</MenuItem>
                    <MenuItem value='Mágico'>Mágico</MenuItem>
                  </Select>
                </FormControl>
            </>,
            
            armor: <>
                <TextField 
                    label="Nome"
                />
                <TextField 
                    label="Descrição"
                />
                <FormControl fullWidth>
                  <InputLabel id="rarity">Raridade</InputLabel>
                  <Select
                    labelId="rarity"
                    id="raritySelect"
                    value={weapon.rarity ?? "Nenhuma"}
                    label="Raridade"
                    onChange={e => { setArmor(state => ({ ...state, rarity: e.target.value })) }}
                  >
                    <MenuItem value='Nenhuma'>Nenhuma</MenuItem>
                    <MenuItem value='Comum'>Comum</MenuItem>
                    <MenuItem value='Incomum'>Incomum</MenuItem>
                    <MenuItem value='Raro'>Raro</MenuItem>
                    <MenuItem value='Épico'>Épico</MenuItem>
                    <MenuItem value='Lendário'>Lendário</MenuItem>
                    <MenuItem value='Relíquia'>Relíquia</MenuItem>
                    <MenuItem value='Mágico'>Mágico</MenuItem>
                  </Select>
                </FormControl>
            </>,
            
            item: <>
                <TextField 
                    label="Nome"
                />
                <TextField 
                    label="Descrição"
                />
                <FormControl fullWidth>
                  <InputLabel id="rarity">Raridade</InputLabel>
                  <Select
                    labelId="rarity"
                    id="raritySelect"
                    value={weapon.rarity ?? "Nenhuma"}
                    label="Raridade"
                    onChange={e => { setItem(state => ({ ...state, rarity: e.target.value })) }}
                  >
                    <MenuItem value='Nenhuma'>Nenhuma</MenuItem>
                    <MenuItem value='Comum'>Comum</MenuItem>
                    <MenuItem value='Incomum'>Incomum</MenuItem>
                    <MenuItem value='Raro'>Raro</MenuItem>
                    <MenuItem value='Épico'>Épico</MenuItem>
                    <MenuItem value='Lendário'>Lendário</MenuItem>
                    <MenuItem value='Relíquia'>Relíquia</MenuItem>
                    <MenuItem value='Mágico'>Mágico</MenuItem>
                  </Select>
                </FormControl>
            </>
        }

        setModalContent(content[itemName])
    }
    
    const capacity = useMemo(() => {
        const weaponsWeight = f.values.inventory.weapons.map((weapon) => weapon.weight).reduce((a, b) => a + b, 0)
        const armorsWeight = f.values.inventory.armors.map((armor) => armor.weight).reduce((a, b) => a + b, 0)
        const itemsWeight = f.values.inventory.items.map((item) => {
            if (item.kind !== 'Capacidade') {
                return item.weight * (item?.quantity ?? 1)
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const maxCargo = f.values.inventory.items.map((item) => {
            if (item.kind === 'Capacidade') {
                return item.weight
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const cargo = (weaponsWeight + armorsWeight + itemsWeight)?.toFixed(1)

        return {
            cargo,
            maxCargo
        }
    }, [ f.values.inventory, f.values.attributes.vig ])

    const itemsOfLineage = useMemo(() => {
        const itemArr: any[] = []
        const weaponArr: any[] = []

        if (!disabled) {
            f.values.inventory = f.initialValues.inventory
    
            const items = lineageItems[f.values.lineage as unknown as LineageNames]
    
            items?.forEach((item) => {
                if (item.type === 'item') itemArr.push(item) 
                if (item.type === 'weapon') weaponArr.push(item)
            })            
        }

        return {
            itemArr,
            weaponArr
        }
    }, [ f.values.lineage ])

    const weapons = useMemo(() => {
        return f.values.inventory.weapons.map((weapon) => (
            <Grid 
                item
                key={weapon.name}
            >
                <Item
                    as='weapon'
                    name={weapon.name}
                    ammo={weapon.ammo}
                    categ={weapon.categ}
                    range={weapon.range}
                    weight={weapon.weight}
                    accesories={weapon?.accesories}
                    kind={weapon.kind}
                    bonus={weapon.bonus}
                    description={weapon.description}
                    hit={weapon.hit}

                    bonusValue={[ f.values.expertises[weapon.bonus].value ]}
                    isDisadvantage={f.values.attributes[weapon.hit] < 0}
                    diceQuantity={Math.floor((f.values.attributes[weapon.hit] / 2) ?? 0) + 1}

                    effect={{
                        kind: weapon.effect.kind,
                        effectType: weapon.effect.effectType,
                        critValue: weapon.effect.critValue,
                        critChance: weapon.effect.critChance,
                        value: weapon.effect.value
                    }}
                />
            </Grid>
        ))
    }, [ f.values.inventory.weapons ])

    const armors = useMemo(() => {
        return f.values.inventory.armors.map((armor) => (
            <Grid 
                item
                key={armor.name}
            >
                <Item
                    as='armor'
                    name={armor.name}
                    categ={armor.categ}
                    weight={armor.weight}
                    kind={armor.kind}
                    displacementPenalty={armor.displacementPenalty}
                    value={armor.value}
                    description={armor.description}
                />
            </Grid>
        ))
    }, [ f.values.inventory.armors ])

    const items = useMemo(() => {
        return f.values.inventory.items.map((item) => (
            <Grid 
                item
                key={item.name}
            >
                <Item
                    as='item'
                    name={item.name}
                    weight={item.weight}
                    kind={item.kind}
                    description={item.description}
                    level={item?.level}
                    quantity={item?.quantity ?? 1}
                    effects={item?.effects}
                />
            </Grid>
        ))
    }, [ f.values.inventory.items ])

    useEffect(() => {
        const { cargo, maxCargo } = capacity
        
        f.setFieldValue('capacity.cargo', cargo)
        f.setFieldValue('capacity.max', Number(Number(f.values.attributes.vig * 1.5 + maxCargo + 5)).toFixed(1))
    }, [ capacity ])
    
    useEffect(() => {
        const { weaponArr, itemArr } = itemsOfLineage

        f.setFieldValue('inventory.weapons', [
            ...f.initialValues.inventory.weapons,
            ...weaponArr
        ])
        
        f.setFieldValue('inventory.items', [
            ...f.initialValues.inventory.items,
            ...itemArr
        ])
    }, [ itemsOfLineage ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' alignItems='center' gap={2}>
                    <Typography variant='h6'>Inventário</Typography>
                    <Typography 
                        fontWeight={900} 
                        variant='h5'
                        color={
                            f.values.capacity.cargo / f.values.capacity.max >= 1 ? red[500] :
                                f.values.capacity.cargo / f.values.capacity.max >= .75 ? yellow[500] : 'white'
                        }
                    >
                        {f.values.capacity.cargo}/{f.values.capacity.max}
                    </Typography>
                    <CustomIconButton>
                        <Edit />
                    </CustomIconButton>
                </Box>
                <Box
                    display='flex'
                    width='100%' 
                    borderRadius={2} 
                    flexDirection='column'
                    border={`1px solid ${theme.palette.primary.main}`}
                    p={5}
                    gap={10}
                >
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Typography>Armas</Typography>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {weapons}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Typography>Armaduras</Typography>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {armors}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Typography>Itens</Typography>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {items}
                        </Grid>
                    </Box>
                </Box>    
            </Box>
            <Modal
                open={modalOpen}
                onClose={e => { setModalOpen(false) }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    height='75%'
                    width='75%'
                    gap={2}
                    p={2}
                >
                    <Box>
                        <Typography variant='h6'>Adicionar Item</Typography>
                    </Box>
                    <Box display='flex' gap={2}>
                        <Button onClick={() => { changeModalContent('weapon') }} variant={addButtonsStyle.weapon}>Arma</Button>
                        <Button onClick={() => { changeModalContent('armor') }} variant={addButtonsStyle.armor}>Armadura</Button>
                        <Button onClick={() => { changeModalContent('item') }} variant={addButtonsStyle.item}>Item</Button>
                    </Box>
                    <Box display='flex' gap={2}>
                        {modalContent}
                    </Box>
                </Box>
            </Modal>
        </>
    )
})

Inventory.displayName = 'Inventory'
export default Inventory
