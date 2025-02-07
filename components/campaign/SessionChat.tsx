'use client';

import { Box, Paper, TextField, IconButton, Typography, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { useCampaignContext } from '@contexts/campaignContext';
import { useSession } from 'next-auth/react';
import { rollDice, rollSeparateDice, createDiceMessage } from '@utils/diceRoller';

export default function SessionChat() {
    const [ message, setMessage ] = useState('');
    const { data: session } = useSession();
    const { campaign } = useCampaignContext();

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const user = {
            id: session?.user?._id ?? '',
            image: session?.user?.image ?? '',
            name: session?.user?.name ?? 'Usuário'
        };

        if (message.startsWith('#')) {
            const separateResults = rollSeparateDice(message.trim(), user);
            if (separateResults) {
                // TODO: Implementar envio das mensagens separadas
                separateResults.forEach(msg => { console.log(msg); });
            }
        } else {
            const diceResult = rollDice(message.trim());
            if (diceResult) {
                const diceMessage = createDiceMessage(diceResult, user);
                if (diceMessage) {
                    // TODO: Implementar envio da mensagem com o resultado dos dados
                    console.log(diceMessage);
                }
            } else {
                const newMessage = {
                    text: message,
                    by: user
                };
                // TODO: Implementar envio da mensagem normal
                console.log(newMessage);
            }
        }

        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                right: 20,
                bottom: 20,
                width: 350,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper3',
                borderRadius: 2,
                boxShadow: 3
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'background.paper2',
                    bgcolor: 'background.paper4'
                }}
            >
                <Typography variant="h6" color="primary">
                    Chat da Sessão
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Digite XdY para rolar dados (ex: 3d6*2, 2d20+1/2) ou #XdY para rolar separadamente
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                {campaign?.session?.messages?.map((msg, index) => (
                    <Paper
                        key={index}
                        sx={{
                            p: 1,
                            bgcolor: 'background.paper2',
                            maxWidth: '80%',
                            alignSelf: msg.by.id === session?.user?._id ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <Typography variant="caption" color="primary.main">
                            {msg.by.name}
                        </Typography>
                        <Typography>{msg.text}</Typography>
                    </Paper>
                ))}
            </Box>

            <Stack
                direction="row"
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'background.paper2',
                    bgcolor: 'background.paper4'
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Digite sua mensagem, XdY para dados, ou #XdY para dados separados..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                    onKeyPress={handleKeyPress}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper2'
                        }
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{ ml: 1 }}
                >
                    <SendIcon />
                </IconButton>
            </Stack>
        </Paper>
    );
};