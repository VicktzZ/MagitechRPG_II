import { useMediaQuery, type Theme } from '@mui/material'

/** Largura do painel do chat (em janelas mais estreitas ele ocupa a tela toda) */
export const CHAT_PANEL_WIDTH = 400

/** Espaço entre o conteúdo e o painel do chat encaixado, para o botão de abrir/fechar não cobrir nada */
export const CHAT_DOCK_GAP = 24

/**
 * O chat fica ENCAIXADO ao lado do conteúdo (a página ganha margem à direita) a partir de `lg`;
 * abaixo disso ele é uma camada sobre a página, fechada ao abrir.
 */
export const useChatDocked = (): boolean => useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))
