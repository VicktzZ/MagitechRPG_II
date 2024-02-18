import { Avatar, Box, Typography } from '@mui/material'
import { type ReactElement } from 'react'

export default function Message({ message, by }: { message: string, by: 'me' | 'other' }): ReactElement {
    return (
        <Box 
            display='flex'
            width='100%'
            justifyContent={by === 'me' ? 'flex-end' : 'flex-start'}
        >
            <Typography 
                textOverflow='revert-layer' 
                textAlign='justify' 
                maxWidth='60%'
                borderRadius={2} 
                bgcolor='background.paper'
                p={1.5}
            >{message}</Typography>
            <Avatar sx={{ ml: 1 }} src={by === 'me' ? '/profile_photo.jpg' : '/magitech_capa.png'} />
        </Box>
    )
}