/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Box, Button, IconButton, Modal, type SxProps, Tooltip, Typography, useTheme, TextField } from '@mui/material'
import { useState, type ReactElement } from 'react'
import { Edit } from '@mui/icons-material'
import { DiceRollModal, RPGIcon } from '@components/misc'
import type {
    Item as ItemProps, 
    Weapon as WeaponProps,
    Armor as ArmorProps,
    MergedItems,
    Ficha,
    Roll
} from '@types'
import { WarningModal } from '@layout'
import { useSnackbar } from 'notistack'
import { type FormikContextType, useFormikContext } from 'formik'
import type { Inventory } from '@types'
import { rarityColor, toastDefault } from '@constants'
import { rarityArmorBonuses, rarityWeaponBonuses } from '@constants/dataTypes'

// eslint-disable-next-line max-len
type ItemTyping<C> = 
    C extends 'weapon' ? ( WeaponProps<'Leve' | 'Pesada'> & { bonusValue: number[], isDisadvantage: boolean, diceQuantity: number }) :
    C extends 'armor' ? ArmorProps : ItemProps

function ItemModal({ 
    open,
    onClose,
    children,
    sx
}: { 
    open: boolean,
    onClose: () => void,
    children: ReactElement | ReactElement[],
    sx?: SxProps
}): ReactElement {
    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...sx
            }}
        >
            <Box
                display='flex'
                flexDirection='column'
                height='90%'
                width='90%'
                bgcolor='background.paper3'
                borderRadius={2}
                p={3}
            >
                {children}
            </Box>
        </Modal>
    )
}

function Weapon(props: ItemTyping<'weapon'>): ReactElement {
    const [ open, setOpen ] = useState(false)
    const [ rollState, setRollState ] = useState<Roll>({
        name: 'Acerto',
        dice: 20,
        diceQuantity: props.diceQuantity,
        visibleDices: true,
        visibleBaseAttribute: true,
        bonus: props.bonusValue,
        sum: false
    })

    const damageRoll = ({ name, crit }: { name: string, crit?: boolean }): void => {
        const critOrBase = crit ? 'critValue' : 'value'

        const effectParts = props.effect?.[critOrBase]?.match(/(\d+)d(\d+)(\+\d+)?/);
        const quantity = effectParts ? Number(effectParts[1]) : 1;
        const dice = effectParts ? Number(effectParts[2]) : 0;
        const bonusValue = effectParts?.[3] ? Number(effectParts[3]) : 0;
        const rarityBonus = rarityWeaponBonuses[props.rarity]
        
        setRollState({
            name,
            dice,
            diceQuantity: quantity,
            visibleDices: false,
            visibleBaseAttribute: false,
            bonus: [ 
                bonusValue,
                critOrBase === 'critValue' ? rarityBonus * 2 : rarityBonus 
            ],
            sum: true
        })

        setOpen(true)
    }

    return (
        <>
            <Box height='100%' display='flex' flexDirection='column' justifyContent='space-around' gap={4}>
                <Box display='flex' flexDirection='column' gap={3}>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='crossed_swords' />
                        <Typography fontSize='.8rem'>{props.categ}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='wrench' />
                        <Typography fontSize='.8rem'>{String(props?.accessories ?? 'Não possui acessórios')}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='archery_target' />
                        <Typography fontSize='.8rem'>{props.range}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='spinning_sword' />
                        <Typography fontSize='.8rem'>{props.effect?.effectType}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='hand' />
                        <Typography fontSize='.8rem'>{props.kind}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='ammo_bag' />
                        <Typography fontSize='.8rem'>{props.ammo}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='anchor' />
                        <Typography fontSize='.8rem'>{props.weight?.toFixed(1)}kg</Typography>
                    </Box>
                </Box>
                <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
                    <Button 
                        fullWidth 
                        variant='outlined'
                        onClick={() => {
                            setRollState({
                                name: 'Acerto',
                                diceQuantity: props.diceQuantity,
                                dice: 20,
                                visibleDices: true,
                                visibleBaseAttribute: true,
                                bonus: props.bonusValue,
                                sum: false
                            })

                            setOpen(true)
                        }}
                    >
                        {props.hit?.toUpperCase()} + {props.bonus} ({props.effect?.critChance})
                    </Button>
                    <Box display='flex' width='100%' gap={1}>
                        <Button 
                            fullWidth 
                            variant='outlined'
                            sx={{ textTransform: 'lowercase' }}
                            onClick={() => { damageRoll({ name: 'Dano' }) }}
                        >{props.effect?.value} {props.rarity !== 'Comum' && `+ (${rarityWeaponBonuses[props.rarity]})`}</Button>
                        <Button 
                            fullWidth 
                            sx={{ textTransform: 'lowercase' }} 
                            variant='outlined' 
                            color='error'
                            onClick={() => { damageRoll({ name: 'Crítico', crit: true }) }}
                        >{props.effect?.critValue} {props.rarity !== 'Comum' && `+ (${rarityWeaponBonuses[props.rarity] * 2})`}</Button>
                    </Box>
                </Box>
            </Box>
            { open && (
                <DiceRollModal
                    open={open}
                    onClose={() => { setOpen(false) }}
                    visibleDices={rollState.visibleDices}
                    visibleBaseAttribute={rollState.visibleBaseAttribute}
                    bonus={rollState?.bonus as any}
                    isDisadvantage={props.isDisadvantage}
                    sum={rollState.sum}
                    roll={{
                        name: rollState.name,
                        quantity: rollState.diceQuantity,
                        dice: rollState.dice,
                        attribute: props.hit
                    }}
                />
            )}
        </>
    )
}

function Armor(props: ItemTyping<'armor'>): ReactElement {
    return (
        <Box height='100%' display='flex' flexDirection='column' justifyContent='space-around' gap={4}>
            <Box display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='shield' />
                    <Typography fontSize='.8rem'>{props.categ}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='aura' />
                    <Typography fontSize='.8rem'>{props.value} {props.rarity !== 'Comum' && `+ (${rarityArmorBonuses[props.rarity]})`}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='tower' />
                    <Typography fontSize='.8rem'>{props.kind}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='anvil' />
                    <Typography fontSize='.8rem'>{props.displacementPenalty}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='anchor' />
                    <Typography fontSize='.8rem'>{props.weight?.toFixed(1)}kg</Typography>
                </Box>
            </Box>
            <Box />
        </Box>
    )
}

function ItemComponent(props: ItemTyping<'item'>): ReactElement {
    return (
        <Box height='100%' display='flex' flexDirection='column' justifyContent='space-around' gap={4}>
            <Box display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='cubes' />
                    <Typography fontSize='.8rem'>{props.kind}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='anchor' />
                    <Typography fontSize='.8rem'>{props.weight?.toFixed(1)}kg {props.quantity! > 1 && '(cada)'}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <Typography fontSize='1.2rem'>x1</Typography>
                    <Typography fontSize='.8rem'>{props.quantity}</Typography>
                </Box>
                {props?.level && (
                    <Box display='flex' alignItems='center' gap={2}>
                        <RPGIcon icon='level_two_advanced' />
                        <Typography fontSize='.8rem'>{props?.level ?? 'Não possui'}</Typography>
                    </Box>

                )}
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='help' />
                    <Typography fontSize='.8rem'>{String(props?.effects?.join(', ')) ?? 'Não possui'}</Typography>
                </Box>
            </Box>
            <Box />
        </Box>
    )
}

function ItemWrapper({ 
    children,
    title,
    description,
    item
}: { 
    children: ReactElement,
    title: string,
    description: string,
    item: MergedItems<'Leve' | 'Pesada'>
}): ReactElement {
    const theme = useTheme()
    const f: FormikContextType<Ficha> = useFormikContext()
    
    const [ open, setOpen ] = useState(false)
    const [ confirmModalOpen, setConfirmModalOpen ] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const itemType: 'weapon' | 'armor' | 'item' =
        item.ammo ? 'weapon' :
            item.displacementPenalty >= 0 ? 'armor' :
                'item'

    const onConfirm = async (): Promise<void> => {
        // const itemNames = Object.values(f.values.inventory)
        //     .filter(i => typeof i !== 'number')
        //     .map((i: Array<MergedItems<any>>) => i.map(j => j.name))
        //     .flat()

        f.values.inventory[(itemType + 's') as keyof Inventory] = 
            (f.values.inventory[(itemType + 's') as keyof Inventory] as any)
                .filter((i: any) => i.name !== item.name)
                
        setConfirmModalOpen(false)
        setOpen(false)
        enqueueSnackbar(`${item.name} excluído(a) com sucesso!`, toastDefault('itemDeleted', 'success'))
    }

    return (
        <>
            <Tooltip
                title={description}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    minHeight='25rem'
                    width='18rem'
                    boxShadow={theme.shadows[10]}
                    bgcolor='background.paper3'
                    border={`3px solid ${rarityColor[item.rarity]}50`}
                    borderRadius={3}
                    p={2}
                    gap={3}
                    sx={{
                        transition: '.3s ease-in-out',
                        ':hover': {
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    <Typography 
                        fontFamily='Sakana' 
                        width='100%' 
                        noWrap pt={1} 
                        textAlign='center'
                        color={rarityColor[item.rarity]}
                    >
                        {item.rarity?.toUpperCase()}
                    </Typography>
                    <Box display='flex' alignItems='center' justifyContent='center'>
                        <Typography width='80%' noWrap textAlign='left'>{title}</Typography>
                        <IconButton onClick={() => { setOpen(true) }} sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
                            <Edit />
                        </IconButton>
                    </Box>
                    <Box>
                        {children}
                    </Box>
                </Box>
            </Tooltip>
            { open && (
                <ItemModal
                    open={open}
                    onClose={() => { setOpen(false) }}
                >
                    <>
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Box>
                                <Typography variant='h5'>{item.name}</Typography>
                                <Typography variant='caption'>{item.description}</Typography>
                            </Box>
                            <Box>
                                <Button 
                                    onClick={() => { setConfirmModalOpen(true) }} 
                                    variant='contained' 
                                    color={'terciary' as any}
                                >Excluir item</Button>
                            </Box>
                        </Box>
                        <Box
                            display='flex'
                            mt={4}
                        >
                            {
                                itemType === 'weapon' ? (
                                    <Box display='flex' gap={2}>
                                        <TextField 
                                            label='Categoria'
                                            value={item.categ}
                                        />
                                        <TextField 
                                            label='Acessórios'
                                            value={item.accessories ?? 'Nenhum'}
                                        />
                                        <TextField 
                                            label='Alcance'
                                            value={item.range}
                                        />
                                        <TextField 
                                            label='Tipo de dano'
                                            value={item.effect.effectType}
                                        />
                                        <TextField 
                                            label='Tipo de arma'
                                            value={item.kind}
                                        />
                                        <TextField 
                                            label='Munição'
                                            value={item.ammo}
                                        />
                                        <TextField 
                                            label='Peso'
                                            value={item.weight}
                                        />
                                        <TextField 
                                            label='Dano base'
                                            value={item.effect.value}
                                        />
                                        <TextField 
                                            label='Dano crítico'
                                            value={item.effect.critValue}
                                        />
                                    </Box>
                                ) : itemType === 'armor' ? (
                                    <Box display='flex' gap={2}>
                                        <TextField 
                                            label='Categoria'
                                            value={item.categ}
                                        />
                                        <TextField 
                                            label='Pontos de Armadura'
                                            value={item.value ?? 'Nenhum'}
                                        />
                                        <TextField 
                                            label='Tipo de defesa'
                                            value={item.kind}
                                        />
                                        <TextField 
                                            label='Penalidade de deslocamento'
                                            value={item.displacementPenalty}
                                        />
                                        <TextField 
                                            label='Peso'
                                            value={item.weight}
                                        />
                                    </Box>
                                ) : (
                                    <Box display='flex' gap={2}>
                                        <TextField 
                                            label='Quantidade'
                                            value={item.quantity ?? 'Nenhum'}
                                        />
                                        <TextField 
                                            label='Raridade'
                                            value={item.rarity ?? 'Nenhum'}
                                        />
                                        <TextField 
                                            label='Descrição'
                                            value={item.effects ?? 'Nenhum'}
                                        />
                                        <TextField 
                                            label='Peso'
                                            value={item.weight}
                                        />
                                    </Box>
                                )
                            }
                        </Box>
                    </>
                </ItemModal>
            )}
            { confirmModalOpen && (
                <WarningModal 
                    open={confirmModalOpen}
                    onClose={() => { setConfirmModalOpen(false) }}
                    title='Excluir item'
                    text='Tem certeza que deseja excluir este item?'
                    onConfirm={onConfirm}
                />
            )}
        </>
    )
}

export default function Item<C extends 'weapon' | 'armor' | 'item'>({
    name,
    description,
    as,
    ...props
}: {
    name: string,
    as?: C,
} & ItemTyping<C>): ReactElement {
    const Component = as === 'weapon' ? Weapon : as === 'armor' ? Armor : ItemComponent

    return (
        <ItemWrapper
            description={description} 
            title={name}
            item={{ name, description, ...props } as any}
        >
            <Component {...props as any} />
        </ItemWrapper>
    )
}