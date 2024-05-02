import { Avatar, Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { type ReactElement } from 'react';

export default function Message({ message, by }: { message: string, by: { name: string, id: string, image: string } }): ReactElement {
    const { data: session } = useSession();

    return (
        <Box 
            display='flex'
            width='100%'
            justifyContent={by.id === session?.user._id ? 'flex-end' : 'flex-start'}
        >
            <Box 
                display='flex'
                flexDirection='column'
                maxWidth='60%'
                bgcolor='background.paper'
                p={1.5}
                borderRadius={2}                    
            >
                <Box display='flex' width='100%' justifyContent='end'>
                    <Typography 
                        textOverflow='revert-layer' 
                        textAlign='justify' 
                    >{message}</Typography>
                </Box>
                <Box display='flex' gap={1}>
                    <Typography color='text.secondary' variant='caption'>23:37</Typography>
                    <Typography color='text.secondary' variant='caption'>_lordVython</Typography>
                </Box>
            </Box>
            <Avatar sx={{ ml: 1 }} src={by.image} alt={by?.name?.charAt(0).toUpperCase()}/>
        </Box>
    );
}