import type { ReactElement } from 'react';
import type { FilterValue } from '@utils/filterSelection';
import type { ApiParams } from './api';

export interface SubFilterConfig<T> {
    /** Rótulo da seção, ex: "Subtipo" */
    label: string;
    /** Deriva o(s) valor(es) de filtro de um item, ex: subtipos da magia */
    getValue: (item: T) => FilterValue;
    /** Opções fixas (na ordem dada). As encontradas nos itens carregados são acrescentadas ao final. */
    options?: string[];
}

export interface SecondaryFilterConfig<T> {
    /** Rótulo exibido no botão/menu do filtro, ex: "Tipo" */
    label: string;
    /** Deriva o(s) valor(es) de filtro de um item, ex: categoria(s) da magia */
    getValue: (item: T) => FilterValue;
    /** Opções fixas (na ordem dada). As encontradas nos itens carregados são acrescentadas ao final. */
    options?: string[];
    /**
     * Filtro dependente exibido no mesmo menu, sob o principal (ex: Subtipo sob Tipo). Combina
     * com o principal por E; se só ele estiver marcado, filtra por si só.
     */
    subFilter?: SubFilterConfig<T>;
}

export interface ResourceListModalProps<T extends Record<string, any>> {
    open: boolean;
    onClose: () => void;
    queryKey: string;
    fetchFunction: (params: ApiParams<string, T>) => Promise<T[]>;
    addFunction: (item: T) => void;
    validateAdd: (item: T) => { isValid: boolean; errorMessage?: string };
    successMessage: (item: T) => string;
    errorMessage: (err: Error) => string;
    filterOptions: string[];
    /** Rótulo do primeiro filtro (multi-seleção, resolvido no servidor), ex: "Elemento" */
    filterLabel?: string;
    hasGroupsInFilter?: boolean;
    sortOptions: string[];
    /** Mapeia o rótulo de ordenação exibido para o campo real da entidade */
    sortFieldMap?: Record<string, string>;
    /** Segundo filtro opcional (com subfiltro opcional), multi-seleção, resolvido no cliente (ex: Tipo e Subtipo da magia) */
    secondaryFilter?: SecondaryFilterConfig<T>;
    renderResource: ({ item, handleAddItem }: { item: T, handleAddItem?: () => void }) => ReactElement;
    /**
     * Largura mínima (px) de cada item. Quando informada, a lista vira uma grade que encaixa o máximo de
     * colunas possível e o item deve ocupar toda a célula; sem ela, usa 1/2/3 colunas fixas centralizadas.
     */
    itemMinWidth?: number;
    /** Com `itemMinWidth`: máximo de colunas, para os itens crescerem em telas muito largas em vez de multiplicar as colunas */
    itemMaxColumns?: number;
    pageSize?: number;
    title?: string;
    initialSearch?: string;
    initialFilters?: string[];
    initialSort?: { value: string; order: 'ASC' | 'DESC' };
}