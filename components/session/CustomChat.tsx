import { Box, TextField, useTheme } from '@mui/material'
import { type FormEvent, useState, type ReactElement } from 'react'
import { Message } from '.'

export default function CustomChat(): ReactElement {
    const theme = useTheme()
    const [ message, setMessage ] = useState<string>('')
    const [ messages, setMessages ] = useState<string[]>([])
    
    const submitForm = (e: FormEvent): void => {
        e.preventDefault()
        const rollMatches = message.match(/^[1-9]\d*d[1-9]\d*$/)

        if (rollMatches) {
            console.log(message);
        }

        setMessages([ ...messages, message ])
        setMessage('')
    }

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
                    value={message}
                    onChange={e => { setMessage(e.target.value) }}
                    placeholder='Exemplo: 2d6'
                />
            </Box>
            <Box overflow='auto' display='flex' mb={3} width='100%' gap={2} flexDirection='column-reverse' alignItems='flex-end' height='100%'>
                { messages.map(msg => <Message key={msg} message={msg} />) }
            </Box>
        </Box>    
    )
}