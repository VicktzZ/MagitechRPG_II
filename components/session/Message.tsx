import { Avatar, Box, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { type ReactElement } from 'react'

export default function Message({ message, by }: { message: string, by: { name: string, id: string, image: string } }): ReactElement {
    const { data: session } = useSession()

    return (
        <Box 
            display='flex'
            width='100%'
            justifyContent={by.id === session?.user._id ? 'flex-end' : 'flex-start'}
        >
            <Typography 
                textOverflow='revert-layer' 
                textAlign='justify' 
                maxWidth='60%'
                borderRadius={2} 
                bgcolor='background.paper'
                p={1.5}
            >{message}</Typography>
            <Avatar sx={{ ml: 1 }} src={by.image} alt={by?.name?.charAt(0).toUpperCase()}/>
        </Box>
    )
}