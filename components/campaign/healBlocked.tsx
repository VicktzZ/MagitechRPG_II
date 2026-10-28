import { Button } from '@mui/material';
import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

interface SnackbarApi {
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
    closeSnackbar: (key?: SnackbarKey) => void;
}

/**
 * Resposta da rota de combate quando o alvo está com um efeito que bloqueia a cura (Necrose, Incurável: flag `no_healing`; 409 `HEALING_BLOCKED`).
 * Devolve `true` quando era essa resposta e já foi tratada: o jogador recebe o aviso; o mestre recebe o aviso com "Curar mesmo assim", que repete a cura com `force`.
 */
export function handleHealingBlocked(result: { code?: string; error?: string; canForce?: boolean } | null | undefined, snackbar: SnackbarApi, retryForced: () => void): boolean {
    if (result?.code !== 'HEALING_BLOCKED') return false;

    snackbar.enqueueSnackbar(result.error ?? 'A cura é bloqueada.', {
        variant: 'warning',
        ...(result.canForce
            ? {
                persist: true,
                action: (key: SnackbarKey) => (
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => { snackbar.closeSnackbar(key); retryForced(); }}
                        sx={{ textTransform: 'none' }}
                    >
                        Curar mesmo assim
                    </Button>
                )
            }
            : {})
    });
    return true;
}
