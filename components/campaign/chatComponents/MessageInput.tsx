'use client';

import { memo, useState } from 'react';
import {
    IconButton,
    Paper,
    TextField,
    Tooltip
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { color } from '@themes/tokens';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
}

const MessageInput = memo(function MessageInput({ onSendMessage }: MessageInputProps) {
    const [ message, setMessage ] = useState('');

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Paper 
            elevation={3}
            sx={{
                p: 2,
                borderTop: '2px solid',
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Digite sua mensagem... (XdY para dados, #XdY para dados separados)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.raised',
                        borderRadius: 2,
                        '& fieldset': {
                            borderColor: color.borderControl,
                            borderWidth: 2
                        },
                        '&:hover fieldset': {
                            borderColor: 'text.secondary'
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2
                        }
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '0.95rem',
                        lineHeight: 1.4
                    }
                }}
            />
            <Tooltip title={message.trim() ? 'Enviar mensagem (Enter)' : 'Digite uma mensagem'}>
                <span>
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        size="large"
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                bgcolor: 'primary.light'
                            },
                            '&:disabled': {
                                bgcolor: 'background.raised',
                                color: 'text.disabled'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Send />
                    </IconButton>
                </span>
            </Tooltip>
        </Paper>
    );
});

export default MessageInput;
