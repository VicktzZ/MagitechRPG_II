'use client';

import { memo, useState } from 'react';
import {
    IconButton,
    Paper,
    TextField,
    Tooltip,
    useTheme
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { blue, grey } from '@mui/material/colors';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
}

const MessageInput = memo(function MessageInput({ onSendMessage }: MessageInputProps) {
    const [ message, setMessage ] = useState('');
    const theme = useTheme();

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
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder=" Digite sua mensagem...\n\nXdY para dados\n#XdY para dados separados"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                        borderRadius: 2,
                        '& fieldset': {
                            borderColor: blue[300],
                            borderWidth: 2
                        },
                        '&:hover fieldset': {
                            borderColor: blue[500]
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: blue[600],
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
                            bgcolor: blue[600],
                            color: 'white',
                            '&:hover': {
                                bgcolor: blue[700],
                                transform: 'scale(1.05)'
                            },
                            '&:disabled': {
                                bgcolor: grey[300],
                                color: grey[500]
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
