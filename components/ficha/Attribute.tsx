import { RPGIcon } from '@components/misc'
import { type IconType } from '@components/misc/rpg-icons'
import { useMediaQuery } from '@mui/material'
import { Box, useTheme } from '@mui/material'
import { blue, deepPurple, green, grey, orange, red, teal, yellow } from '@node_modules/@mui/material/colors'
import { type ReactElement, useMemo, useState } from 'react'

type MainAttributes = 'vig' | 'des' | 'foc' | 'log' | 'sab' | 'car'

const attributeIcons: Record<MainAttributes, { icon: IconType, color: string, filter: string }> = {
    vig: {
        color: red[500],
        icon: 'health',
        filter: 'invert(32%) sepia(55%) saturate(3060%) hue-rotate(343deg) brightness(99%) contrast(93%)'
    },
    foc: {
        color: blue[500],
        icon: 'potion',
        filter: 'invert(42%) sepia(99%) saturate(584%) hue-rotate(169deg) brightness(101%) contrast(99%)'
    },
    des: {
        color: orange[500],
        icon: 'shield',
        filter: 'invert(57%) sepia(63%) saturate(723%) hue-rotate(357deg) brightness(99%) contrast(107%)'
    },
    log: {
        color: teal[500],
        icon: 'book',
        filter: 'invert(53%) sepia(48%) saturate(7320%) hue-rotate(150deg) brightness(89%) contrast(101%)'
    },
    sab: {
        color: deepPurple[500],
        icon: 'pawprint',
        filter: 'invert(19%) sepia(90%) saturate(2394%) hue-rotate(253deg) brightness(90%) contrast(84%)'
    },
    car: {
        color: green[500],
        icon: 'aura',
        filter: 'invert(60%) sepia(41%) saturate(642%) hue-rotate(73deg) brightness(91%) contrast(85%)'
    }
}

export default function Attribute({
    attributeName,
    attributeValue,
    setAtrribute
}: { 
    attributeName: MainAttributes,
    attributeValue: number
    setAtrribute: ReactElement
}) {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    function Bar({ id }: { id: number }) {
        const [ filled ] = useState<boolean>(attributeValue >= id)

        return <Box sx={{
            width: '1.5rem',
            height: '2rem',
            border: '1px solid',
            borderColor: theme.palette.primary.main,
            bgcolor: (id === 1 && attributeValue === -1) ? red[500] : filled ? green[500] : 'transparent',
            borderRadius: 1
        }} />
    }

    const attributeBars = useMemo(() => {
        const bars = [
            <Bar key={1} id={1} />,
            <Bar key={2} id={2} />,
            <Bar key={3} id={3} />,
            <Bar key={4} id={4} />,
            <Bar key={5} id={5} />
        ]

        return bars
    }, [ attributeValue ])
    
    return (
        <Box 
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            width='100%'
        >
            <Box width='100%' display='flex' flexDirection='column' gap={1} justifyContent='space-between'>
                <Box width='18rem' maxWidth='18rem' display='flex' gap={2} alignItems='center' justifyContent='space-between'>
                    <Box width='100%' display='flex' gap={1} alignItems='center' justifyContent='space-evenly' letterSpacing={matches ? 3 : 5}>
                        <Box>
                            {attributeName.toUpperCase()}
                        </Box>
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: matches ? 0.5 : 0.8,
                            borderRadius: 5,
                            backgroundColor: `${attributeIcons[attributeName].color}50`
                        }}>
                            <RPGIcon
                                icon={attributeIcons[attributeName].icon}
                                sx={{ 
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    filter: attributeIcons[attributeName].filter
                                }} 
                            />
                        </Box>
                    </Box>
                    <Box width='100%' justifyContent='center' display='flex' gap={1}>
                        {attributeBars}
                    </Box>
                </Box>
            </Box>
            <Box display='flex' gap={1}>
                {setAtrribute}
            </Box>
        </Box>
    )
}