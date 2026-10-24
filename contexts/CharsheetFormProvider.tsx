'use client';

import { charsheetModel } from '@constants/charsheet';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm } from 'react-hook-form';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CharsheetDTO } from '@models/dtos';
import { createCharsheetResolver } from '@schemas';
import { mergeRemoteCounter } from '@utils/counterSync';
import { getEvolutionPoints } from '@utils/spellStages';
import type { DroppedEntries } from '@hooks/useCompleteCharsheet';

export const CharsheetFormContext = createContext<UseFormReturn<CharsheetDTO> | null>(null);
export const useCharsheetForm = (): UseFormReturn<CharsheetDTO> => {
    const ctx = useContext(CharsheetFormContext);
    // if (!ctx) throw new Error('useCharsheetForm deve ser usado dentro de CharsheetFormProvider');
    return ctx!;
};

/**
 * A ficha como estava quando o formulário abriu (ou quando foi salva pela última vez).
 * O envio compara o formulário com ela e grava só o que o jogador mudou; a validação usa
 * para não barrar problemas que já vinham do banco.
 */
export interface CharsheetBaseline {
    /** `null` na criação: não há ficha salva para comparar */
    get: () => CharsheetDTO | null;
    /** Chamado depois de salvar: o que está no formulário passa a ser o ponto de partida */
    markSaved: (values: CharsheetDTO) => void;
    /** Magias e poderes da ficha que a tela não mostra; voltam junto quando a lista é regravada */
    preserved: DroppedEntries;
}

export const CharsheetBaselineContext = createContext<CharsheetBaseline | null>(null);
export const useCharsheetBaseline = (): CharsheetBaseline => {
    const ctx = useContext(CharsheetBaselineContext);
    if (!ctx) throw new Error('useCharsheetBaseline deve ser usado dentro de CharsheetFormProvider');
    return ctx;
};

const NO_PRESERVED: DroppedEntries = { spells: [], powers: [] };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export default function CharsheetFormProvider({
    children,
    formData,
    initialSystemId,
    dropped = NO_PRESERVED
}: {
    children: ReactElement,
    formData?: CharsheetDTO,
    initialSystemId?: string,
    dropped?: DroppedEntries
}) {
    const { data: session } = useSession()
    const [ createCharsheetAutosave, setCreateCharsheetAutosave ] = useLocalStorage<CharsheetDTO | null>('create-charsheet-autosave')
    const pathname = usePathname();
    const isCreating = !formData
    // O rascunho é da criação. Misturá-lo na edição preenchia campos ausentes da ficha com dados de OUTRO personagem
    const draft = isCreating && pathname === '/app/charsheet/create' ? createCharsheetAutosave : null

    // Criar defaults condicionalmente baseado no sistema
    const getDefaultValues = () => {
        const baseDefaults = {
            ...charsheetModel,
            ...draft,
            playerName: session?.user?.name,
            userId: session?.user?.id,
            systemId: initialSystemId,
            ...formData
        }

        // Se há sistema customizado, remover itens/armas/armadura padrão e ajustar pontos de magia
        if (initialSystemId && !formData && !draft) {
            return {
                ...baseDefaults,
                inventory: {
                    ...baseDefaults.inventory,
                    items: [],
                    weapons: [],
                    armors: [],
                    money: 0
                },
                spellSpace: 0,
                ORMLevel: 0,
                points: {
                    ...baseDefaults.points,
                    magics: 0
                }
            }
        }

        return baseDefaults
    }

    const [ defaults ] = useState(getDefaultValues)

    const baselineRef = useRef<CharsheetDTO | null>(formData ? clone(defaults as CharsheetDTO) : null)
    // Quando e com que valor a ficha foi salva por último: o eco do banco com o valor ANTIGO não pode passar por mudança de fora
    const lastSaveRef = useRef<{ at: number; previousEvolution: number } | null>(null)
    const preservedRef = useRef(dropped)
    preservedRef.current = dropped

    const baseline = useMemo<CharsheetBaseline>(() => ({
        get: () => baselineRef.current,
        markSaved: (values) => {
            lastSaveRef.current = { at: Date.now(), previousEvolution: getEvolutionPoints(baselineRef.current?.points) }
            baselineRef.current = clone(values)
        },
        get preserved() { return preservedRef.current }
    }), [])

    const resolver = useMemo(
        () => createCharsheetResolver<CharsheetDTO>({ mode: isCreating ? 'create' : 'edit', getBaseline: () => baselineRef.current }),
        [ isCreating ]
    )

    const form = useForm<CharsheetDTO>({
        mode: 'onChange',
        defaultValues: defaults as CharsheetDTO,
        resolver,
        shouldFocusError: true,
        criteriaMode: 'all'
    })

    // Ponto de evolução: o mestre concede com a ficha aberta. A mudança de fora entra no formulário somada ao que o jogador já gastou aqui
    // (o formulário é uma foto; salvar o valor velho desfaria a concessão)
    const liveEvolution = formData ? getEvolutionPoints(formData.points) : undefined
    useEffect(() => {
        const base = baselineRef.current
        if (!base || liveEvolution === undefined) return
        const lastSave = lastSaveRef.current
        if (lastSave && Date.now() - lastSave.at < 5000 && liveEvolution === lastSave.previousEvolution) return
        const merged = mergeRemoteCounter(liveEvolution, getEvolutionPoints(base.points), getEvolutionPoints(form.getValues('points')))
        if (!merged) return
        baselineRef.current = { ...base, points: { ...base.points, evolution: merged.baseline } }
        form.setValue('points.evolution', merged.current)
    }, [ liveEvolution, form ])

    // A sessão pode chegar depois do primeiro render da criação
    useEffect(() => {
        if (!isCreating || !session?.user) return
        if (!form.getValues('userId')) form.setValue('userId', session.user.id)
        if (!form.getValues('playerName')) form.setValue('playerName', session.user.name ?? '')
    }, [ isCreating, session?.user, form ])

    useEffect(() => {
        if (pathname === '/app/charsheet/create' && !formData) {
            let timeoutId: NodeJS.Timeout;

            const subscription = form.watch((value) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setCreateCharsheetAutosave(value as CharsheetDTO);
                }, 300);
            });

            return () => {
                subscription.unsubscribe();
                clearTimeout(timeoutId);
            };
        }
    }, [ pathname, form, setCreateCharsheetAutosave, formData ]);

    return (
        <FormProvider {...form}>
            <CharsheetFormContext.Provider value={form}>
                <CharsheetBaselineContext.Provider value={baseline}>
                    {children}
                </CharsheetBaselineContext.Provider>
            </CharsheetFormContext.Provider>
        </FormProvider>
    )
}
