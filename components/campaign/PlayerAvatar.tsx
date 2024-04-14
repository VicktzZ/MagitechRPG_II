import { Avatar, Box, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import { type ReactElement } from 'react'

export default function PlayerAvatar({
    userIsGM,
    image,
    username,
    charname
}: { 
    userIsGM?: boolean,
    image: string,
    username: string,
    charname: string
}): ReactElement {
    return (
        <Box display='flex' gap={2} alignItems='center'>
            <IconButton>
                <Avatar
                    sx={{
                        height: '4rem',
                        width: '4rem'
                    }}
                >
                    <Image
                        height={250}
                        width={250}
                        style={{ height: '100%', width: '100%' }} 
                        src={image} 
                        alt={'Avatar de' + username} 
                    />
                </Avatar>
            </IconButton>
            <Box>
                <Typography>{charname}</Typography>
                <Typography variant='caption' color='text.secondary'>{username}</Typography>
            </Box>
        </Box>
    )
}