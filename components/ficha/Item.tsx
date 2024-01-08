/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Box, Button, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import { useState, type ReactElement } from 'react'
import { Edit } from '@mui/icons-material'
import { DiceRollModal, RPGIcon } from '@components/misc'
import type {
    Item as ItemProps, 
    Weapon as WeaponProps,
    Armor as ArmorProps
} from '@types'

// eslint-disable-next-line max-len
type ItemTyping<C> = C extends 'weapon' ? ( WeaponProps<'Leve' | 'Pesada'> & { bonusValue: number[], isDisadvantage: boolean, diceQuantity: number }) : C extends 'armor' ? ArmorProps : ItemProps

function Weapon(props: ItemTyping<'weapon'>): ReactElement {
    const [ open, setOpen ] = useState(false)
    const [ rollState, setRollState ] = useState<{
        name: string
        dice: number
        diceQuantity: number
        visibleDices: boolean
        visibleBaseAttribute: boolean
        bonus?: number[]
        sum?: boolean
    }>({
        name: 'Acerto',
        dice: 20,
        diceQuantity: props.diceQuantity,
        visibleDices: true,
        visibleBaseAttribute: true,
        bonus: props.bonusValue,
        sum: false
    })

    const damageRoll = ({ name, crit }: { name: string, crit?: boolean }): void => {
        if (!crit) {
            setRollState({
                name,
                dice: Number(props.effect?.value?.split('d')[1]),
                diceQuantity: Number(props.effect?.value?.split('d')[0]),
                visibleDices: false,
                visibleBaseAttribute: false,
                bonus: undefined,
                sum: true
            })
        } else {
            setRollState({
                name,
                dice: Number(props.effect?.critValue?.split('d')[1]),
                diceQuantity: Number(props.effect?.critValue?.split('d')[0]),
                visibleDices: false,
                visibleBaseAttribute: false,
                bonus: undefined,
                sum: true
            })
        }

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
                        <Typography fontSize='.8rem'>{String(props?.accesories ?? 'Não possui acessórios')}</Typography>
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
                        >{props.effect?.value}</Button>
                        <Button 
                            fullWidth 
                            sx={{ textTransform: 'lowercase' }} 
                            variant='outlined' 
                            color='error'
                            onClick={() => { damageRoll({ name: 'Crítico', crit: true }) }}
                        >{props.effect?.critValue}</Button>
                    </Box>
                </Box>
            </Box>
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
                    <Typography fontSize='.8rem'>{props.value}</Typography>
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

function ItemWrapper({ children, title, description }: { children: ReactElement, title: string, description: string }): ReactElement {
    const theme = useTheme()
    
    return (
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
                <Box display='flex' alignItems='center' justifyContent='center'>
                    <Typography width='100%' noWrap textAlign='center'>{title}</Typography>
                    <IconButton sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
                        <Edit />
                    </IconButton>
                </Box>
                <Box>
                    {children}
                </Box>
            </Box>
        </Tooltip>
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
        <ItemWrapper description={description} title={name}>
            <Component {...props as any} />
        </ItemWrapper>
    )
}