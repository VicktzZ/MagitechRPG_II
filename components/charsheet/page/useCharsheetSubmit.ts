'use client';

import { toastDefault } from '@constants';
import { useCharsheetBaseline } from '@contexts';
import { useAudio } from '@hooks';
import type { CharsheetDTO } from '@models/dtos';
import { charsheetService } from '@services';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { collectChanges } from '@utils/charsheetDiff';
import { listFormErrors } from '@utils/charsheetErrors';
import { errorMessage } from '@utils/errors';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { scrollToSection } from './scrollToSection';

const SAVE_TOAST = 'charsheetSave';

/**
 * Criar e salvar a ficha.
 *
 * - Ficha nova: manda o formulário (já tratado pelo schema) uma vez só, depois de o jogador confirmar que alguns campos travam.
 * - Ficha existente: manda só o que o jogador mudou (`collectChanges`) por `PATCH /api/charsheet/[id]/fields`. O envio do valor inteiro
 *   gravava por cima o que a campanha escreveu enquanto a página estava aberta (vantagens, dinheiro, nível) e apagava chaves que o
 *   schema não conhece.
 */
export function useCharsheetSubmit(form: UseFormReturn<CharsheetDTO>, userId: string | undefined) {
    const baseline = useCharsheetBaseline();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const submitAudio = useAudio('/sounds/sci-fi-interface-zoom.wav');
    const [ , setCreateCharsheetAutosave ] = useLocalStorage<CharsheetDTO | null>('create-charsheet-autosave');

    const [ isSaving, setIsSaving ] = useState(false);
    const [ isRedirecting, setIsRedirecting ] = useState(false);
    const [ pendingCreate, setPendingCreate ] = useState<CharsheetDTO | null>(null);
    // dois cliques seguidos chegam antes de o React renderizar o botão desabilitado
    const inFlight = useRef(false);

    const refreshLists = (charsheetId: string): void => {
        void queryClient.invalidateQueries({ queryKey: [ 'charsheet', charsheetId ] });
        void queryClient.invalidateQueries({ queryKey: [ 'charsheets', userId ] });
    };

    const run = async (task: () => Promise<void>): Promise<void> => {
        if (inFlight.current) return;
        inFlight.current = true;
        setIsSaving(true);
        enqueueSnackbar('Aguarde...', toastDefault(SAVE_TOAST, 'info'));
        try {
            await task();
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Não foi possível salvar a ficha. Tente novamente.'), toastDefault('charsheetSaveError', 'error'));
        } finally {
            closeSnackbar(SAVE_TOAST);
            inFlight.current = false;
            setIsSaving(false);
        }
    };

    const create = async (parsed: CharsheetDTO): Promise<void> => {
        await run(async () => {
            // A data é a do envio (antes era a do carregamento da página). O servidor também a define.
            const payload = { ...form.getValues(), ...parsed, createdAt: new Date().toISOString() };
            const created = await charsheetService.create<CharsheetDTO>(payload);

            enqueueSnackbar('Ficha criada com sucesso!', toastDefault('charsheetCreated', 'success'));
            submitAudio?.play()?.catch(() => undefined);
            setCreateCharsheetAutosave(null);
            setIsRedirecting(true);
            refreshLists(created.id);
            setTimeout(() => router.push('/app/charsheet/' + created.id), 500);
        });
    };

    const saveChanges = async (charsheetId: string): Promise<void> => {
        const current = form.getValues();
        const base = baseline.get();
        const changes = base ? collectChanges(base, current, { preserved: baseline.preserved }) : {};

        if (Object.keys(changes).length === 0) {
            enqueueSnackbar('Nenhuma alteração para salvar.', toastDefault('charsheetNoChanges', 'info'));
            return;
        }

        await run(async () => {
            await charsheetService.updateFields(charsheetId, changes);
            baseline.markSaved(current);
            // o que está na tela passa a ser o ponto de partida: o próximo salvar leva só o que mudar depois deste
            form.reset(current);
            refreshLists(charsheetId);
            enqueueSnackbar('Ficha salva com sucesso!', toastDefault('charsheetSaved', 'success'));
        });
    };

    const onValid = async (parsed: CharsheetDTO): Promise<void> => {
        if (inFlight.current) return;
        const charsheetId = form.getValues('id');
        if (charsheetId) {
            await saveChanges(charsheetId);
            return;
        }
        // campos como nome, classe e raça travam depois de criada: confirma antes
        setPendingCreate(parsed);
    };

    const onInvalid = (errors: FieldErrors<CharsheetDTO>): void => {
        const list = listFormErrors(errors, form.getValues());
        const first = list[0];
        const message = first
            ? `Corrija antes de salvar: ${first.label} — ${first.message}${list.length > 1 ? ` (e mais ${list.length - 1})` : ''}`
            : 'Existem erros no formulário.';
        enqueueSnackbar(message, toastDefault('charsheetInvalid', 'error'));
        scrollToSection(first?.sectionId);
    };

    return {
        /** Para `onClick`/`onSubmit` do botão Salvar */
        submit: form.handleSubmit(onValid, onInvalid),
        isSaving,
        isRedirecting,
        /** A criação espera a confirmação do jogador */
        confirmingCreate: pendingCreate !== null,
        confirmCreate: (): void => {
            const values = pendingCreate;
            setPendingCreate(null);
            if (values) void create(values);
        },
        cancelCreate: (): void => setPendingCreate(null)
    };
}
