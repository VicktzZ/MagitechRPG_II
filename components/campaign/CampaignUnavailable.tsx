import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ErrorOutline, SearchOff } from '@mui/icons-material';
import { font } from '@themes/tokens';
import type { ReactElement } from 'react';

interface CampaignUnavailableProps {
    /** `not-found`: código inexistente ou campanha excluída; `error`: falha ao carregar */
    reason: 'not-found' | 'error';
    /** Código digitado na URL, mostrado para o jogador conferir com o mestre */
    code: string;
    onBack: () => void;
    onRetry: () => void;
}

/** Tela no lugar da campanha quando ela não pode ser aberta (em vez de um spinner sem fim) */
export default function CampaignUnavailable({ reason, code, onBack, onRetry }: CampaignUnavailableProps): ReactElement {
    const notFound = reason === 'not-found';
    const Icon = notFound ? SearchOff : ErrorOutline;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p: 2 }}>
            <Paper
                role={notFound ? 'status' : 'alert'}
                sx={{
                    bgcolor: 'background.raised',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: { xs: 3, sm: 4 },
                    maxWidth: 480,
                    width: '100%'
                }}
            >
                <Stack spacing={2} alignItems="flex-start">
                    <Icon sx={{ fontSize: '2.5rem', color: 'text.secondary' }} />
                    <Typography variant="h5" component="h1">
                        {notFound ? 'Campanha não encontrada' : 'Não foi possível carregar a campanha'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {notFound
                            ? 'Nenhuma campanha tem este código, ou ela foi excluída. Confira o código com o mestre.'
                            : 'Houve um problema ao buscar os dados da campanha. Verifique a conexão e tente de novo; se continuar, avise o mestre.'}
                    </Typography>
                    {code && (
                        <Typography variant="caption" color="text.secondary">
                            Código: <span style={{ fontFamily: font.mono }}>{code}</span>
                        </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        {!notFound && (
                            <Button variant="contained" onClick={onRetry}>
                                Tentar de novo
                            </Button>
                        )}
                        <Button variant={notFound ? 'contained' : 'outlined'} onClick={onBack}>
                            Voltar às campanhas
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
