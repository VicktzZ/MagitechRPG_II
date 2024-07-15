import { Avatar, Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { type ReactElement } from 'react';

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
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box display='flex' gap={!matches ? 2 : 1} alignItems='center'>
            <IconButton>
                <Avatar
                    sx={{
                        height: !matches ? '4.5rem' : '4rem',
                        width: !matches ? '4.5rem' : '4rem'
                    }}
                >
                    { image ? (
                        <Image
                            height={250}
                            width={250}
                            style={{ height: '100%', width: '100%' }} 
                            src={image} 
                            alt={'Avatar de' + username} 
                        />
                    ) : (
                        <Typography>{charname.charAt(0).toUpperCase()}</Typography>
                    )}
                </Avatar>
            </IconButton>
            <Box>
                <Typography>{charname}</Typography>
                <Typography variant='caption' color='text.secondary'>{username}</Typography>
            </Box>
        </Box>
    );
}