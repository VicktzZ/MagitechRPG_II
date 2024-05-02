import { Box, TextField, useTheme } from '@mui/material';
import { type FormEvent, useState, type ReactElement, useEffect } from 'react';
import type { EventData, Message as MessageType } from '@types';
import { Message } from '.';
import { useChannel } from '@contexts/channelContext';
import { useSession } from 'next-auth/react';

export default function CustomChat(): ReactElement {
    const theme = useTheme();
    const { channel } = useChannel();
    const { data: session } = useSession();
    const [ messages, setMessages ] = useState<MessageType[]>([]);
    const [ message, setMessage ] = useState<MessageType>({
        message: '',
        by: { 
            id: session?.user._id as unknown as string,
            image: session?.user.image as unknown as string,
            name: session?.user.name as unknown as string
        }
    });
    
    const submitForm = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        const rollMatches = message.message.match(/^[1-9]\d*d[1-9]\d*$/);

        if (rollMatches) {
            console.log(message);
        }

        setMessage({ ...message, message: '' });

        const requestData: EventData = {
            channelName: channel.name,
            eventName: 'message',
            data: message,
            triggeredBy: {
                name: channel.members.me.info.name,
                _id: channel.members.me.info._id,
                socketId: channel.members.me.id
            }
        };

        try {
            await fetch('/api/pusher/events', {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            console.log(error.message);            
        }

    };

    useEffect(() => {
        channel.bind('server-message', (msg: EventData<MessageType>['data']) => {
            setMessages([ ...messages, msg ]);
            console.log(msg);
            console.log('Message sended by: ' + msg.by.id);
        });
    }, [ channel, messages ]);	

    return (
        <Box
            display='flex'
            height='100%'
            flexDirection='column-reverse'
            alignItems='flex-end'
            p={2}
            width='30%'
            component='form'
            bgcolor='background.paper3'
            border={`1px solid ${theme.palette.primary.main}`}
            borderRadius={2}
            onSubmit={submitForm}
        >
            <Box width='100%'>
                <TextField 
                    fullWidth
                    label='Chat'
                    required
                    value={message.message}
                    onChange={e => { setMessage({ ...message, message: e.target.value }); }}
                    placeholder='Exemplo: 2d6'
                    autoComplete='off'
                />
            </Box>
            <Box 
                overflow='auto'
                display='flex' 
                mb={3}
                pr={1}
                width='100%' 
                gap={2} 
                flexDirection='column' 
                alignItems='flex-end' 
                height='100%'
                sx={{
                    overflowX: 'hidden',

                    '&::-webkit-scrollbar': {
                        width: '0.5em'
                    },

                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.background.paper
                    },

                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: `${theme.palette.background.paper}50`
                    }
                }}
            >
                { messages.map(msg => <Message key={msg.message} message={msg.message} by={msg.by} />) }
            </Box>
        </Box>    
    );
}