import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import { type ReactElement } from 'react'
import type {
    Item as ItemProps, 
    Weapon as WeaponProps,
    Armor as ArmorProps
} from '@types'
import { Edit } from '@mui/icons-material'
import { RPGIcon } from '@components/misc'

type ItemTyping<C> = C extends 'weapon' ? WeaponProps<'Leve' | 'Pesada'> : C extends 'armor' ? ArmorProps : ItemProps

function Weapon(props: ItemTyping<'weapon'>): ReactElement {
    return (
        <Box display='flex' flexDirection='column' justifyContent='space-between' gap={2}>
            <Box display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='crossed_swords' />
                    <Typography>{props.categ}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='archery_target' />
                    <Typography>{props.range}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='spinning_sword' />
                    <Typography>{props.effect?.effectType}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={2}>
                    <RPGIcon icon='anchor' />
                    <Typography>{props.weight?.toFixed(1)}kg</Typography>
                </Box>
            </Box>
            <Box display='flex' gap={1}>
                <Box width='50%' borderRight='1px solid white'>
                    <Typography>{props.effect?.value} + ({props.bonus})</Typography>
                </Box>
                <Box width='50%'>
                    <Typography>{props.effect?.critValue} ({props.effect?.critChance})</Typography>
                </Box>
            </Box>
        </Box>
    )
}

function Armor(props: ItemTyping<'armor'>): ReactElement {
    return (
        <Box>
            {'Armor'}
        </Box>
    )
}

function ItemComponent(props: ItemTyping<'item'>): ReactElement {
    return (
        <Box>
            {'Item'}
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
                height='25rem'
                width='15rem'
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
                    <Typography width='100%' textAlign='center' variant='h6'>{title}</Typography>
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