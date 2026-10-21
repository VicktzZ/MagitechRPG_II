import { useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { createWidgetFromPreset, type CampaignWidget, type WidgetPreset } from '@models';
import { mergeWidgetForSave } from './mergeWidget';

interface UseWidgetManagerStateParams {
    open: boolean;
    onClose: () => void;
    /** Widget que deve ficar ativo ao abrir (ex: o painel que originou a abertura) */
    initialWidgetId?: string;
}

/**
 * Estado e ações do diálogo de administração de widgets: cópia local editável,
 * widget ativo, criação por modelo, remoção e salvamento (com merge de 3 vias).
 */
export function useWidgetManagerState({ open, onClose, initialWidgetId }: UseWidgetManagerStateParams) {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ widgets, setWidgets ] = useState<CampaignWidget[]>([]);
    /** Snapshot imutável de quando o dialog foi aberto — usado para o merge de 3 vias ao salvar. */
    const baselineRef = useRef<CampaignWidget[]>([]);
    const [ activeId, setActiveId ] = useState<string | null>(null);
    const [ addingPreset, setAddingPreset ] = useState(false);
    const [ saving, setSaving ] = useState(false);
    const [ newLogText, setNewLogText ] = useState('');

    // Sincroniza a cópia local ao abrir
    useEffect(() => {
        if (open) {
            const clone: CampaignWidget[] = campaign.widgets ? JSON.parse(JSON.stringify(campaign.widgets)) : [];
            baselineRef.current = JSON.parse(JSON.stringify(clone));
            setWidgets(clone);
            setActiveId(initialWidgetId && clone.some(w => w.id === initialWidgetId) ? initialWidgetId : (clone[0]?.id ?? null));
            setAddingPreset(clone.length === 0);
            setNewLogText('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    const widget = widgets.find(w => w.id === activeId) ?? null;

    const patch = (changes: Partial<CampaignWidget>) => {
        if (!activeId) return;
        setWidgets(prev => prev.map(w => w.id === activeId ? { ...w, ...changes } : w));
    };

    const patchLabel = (key: keyof CampaignWidget['labels'], value: string) => {
        if (!widget) return;
        patch({ labels: { ...widget.labels, [key]: value } });
    };

    const handleCreate = (preset: WidgetPreset) => {
        const created = createWidgetFromPreset(preset);
        setWidgets(prev => [ ...prev, created ]);
        setActiveId(created.id);
        setAddingPreset(false);
    };

    const persistWidgets = async (list: CampaignWidget[]): Promise<boolean> => {
        setSaving(true);
        try {
            // Busca o estado mais recente do servidor antes de salvar — evita que
            // ações de jogadores (depósitos, crafting, fundos etc.) feitas enquanto
            // este dialog estava aberto sejam sobrescritas pelo snapshot antigo.
            const freshRes = await fetch(`/api/campaign/${campaign.id}/widget`);
            const freshWidgets: CampaignWidget[] = freshRes.ok ? await freshRes.json() : [];
            const freshById = new Map(freshWidgets.map(w => [ w.id, w ]));
            const baselineById = new Map(baselineRef.current.map(w => [ w.id, w ]));

            const merged = list.map(w => mergeWidgetForSave(baselineById.get(w.id), w, freshById.get(w.id)));

            const response = await fetch(`/api/campaign/${campaign.id}/widget`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgets: merged })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao salvar os widgets');
            }
            return true;
        } catch (error) {
            enqueueSnackbar((error instanceof Error && error.message) || 'Erro ao salvar os widgets', { variant: 'error' });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveActive = async () => {
        if (!activeId) return;
        const remaining = widgets.filter(w => w.id !== activeId);
        const ok = await persistWidgets(remaining);
        if (!ok) return;
        setWidgets(remaining);
        setActiveId(remaining[0]?.id ?? null);
        setAddingPreset(remaining.length === 0);
        enqueueSnackbar('Widget removido da campanha', { variant: 'success' });
    };

    const save = async () => {
        let toSave = widgets;
        if (widget && newLogText.trim()) {
            toSave = widgets.map(w => w.id === widget.id ? {
                ...w,
                log: [ ...(w.log ?? []), { id: crypto.randomUUID(), text: newLogText.trim(), timestamp: new Date().toISOString() } ]
            } : w);
        }
        const ok = await persistWidgets(toSave);
        if (!ok) return;
        enqueueSnackbar('Widgets atualizados!', { variant: 'success' });
        onClose();
    };

    return {
        widgets,
        widget,
        activeId,
        setActiveId,
        addingPreset,
        setAddingPreset,
        saving,
        newLogText,
        setNewLogText,
        patch,
        patchLabel,
        handleCreate,
        handleRemoveActive,
        save
    };
}
