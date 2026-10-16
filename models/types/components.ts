import type { ReactElement } from 'react';
import type { ApiParams } from './api';

export interface SecondaryFilterConfig<T> {
    /** Rótulo exibido no botão/menu do filtro, ex: "Tipo" */
    label: string;
    /** Deriva o valor de filtro de um item, ex: categoria da magia */
    getValue: (item: T) => string | undefined;
    /** Opções fixas do filtro. Quando omitido, as opções são derivadas dos itens já carregados. */
    options?: string[];
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
    /** Segundo filtro opcional, multi-seleção, resolvido no cliente (ex: Tipo da magia) */
    secondaryFilter?: SecondaryFilterConfig<T>;
    renderResource: ({ item, handleAddItem }: { item: T, handleAddItem?: () => void }) => ReactElement;
    pageSize?: number;
    title?: string;
    initialSearch?: string;
    initialFilters?: string[];
    initialSort?: { value: string; order: 'ASC' | 'DESC' };
}