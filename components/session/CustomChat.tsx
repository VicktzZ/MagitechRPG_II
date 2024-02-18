import { Box, TextField, useTheme } from '@mui/material'
import { type FormEvent, useState, type ReactElement, useEffect } from 'react'
import type { Message as MessageType } from '@types'
import { Message } from '.'
import { useChannel } from '@contexts/channelContext'

export default function CustomChat(): ReactElement {
    const theme = useTheme()
    const [ message, setMessage ] = useState<MessageType>({ message: '', by: 'me' })
    const [ messages, setMessages ] = useState<MessageType[]>([])
    const { channel } = useChannel()
    
    const submitForm = (e: FormEvent): void => {
        e.preventDefault()
        const rollMatches = message.message.match(/^[1-9]\d*d[1-9]\d*$/)

        if (rollMatches) {
            console.log(message);
        }

        setMessage({ message: '', by: 'me' })

        const triggered = channel.trigger('client-message', message)
        console.log(triggered);
    }

    useEffect(() => {
        channel.bind('client-message', (msg: MessageType) => {
            setMessages([ ...messages, msg ])
            console.log('Message sended by: ' + msg.by);
        })
    }, [ channel, messages ])	

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
                    onChange={e => { setMessage({ message: e.target.value, by: 'me' }) }}
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
                { messages.map(msg => <Message key={msg.message} message={msg.message} by={message.by} />) }
            </Box>
        </Box>    
    )
}