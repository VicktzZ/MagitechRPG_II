/** Largura da barra do grupo (um retrato por jogador), visível do `md` em diante */
export const PARTY_BAR_WIDTH = 96;

/** Espaço entre a barra do grupo e o conteúdo da campanha */
export const PARTY_BAR_GAP = 16;

/**
 * Margem esquerda da área das janelas quando a barra do grupo aparece: preenchimento da página
 * (24px do layout do app + 16px da moldura da campanha) + a barra + o espaço até o conteúdo.
 * As janelas não passam por cima da barra, senão cobririam os retratos que as abrem.
 */
export const WINDOW_AREA_LEFT = 24 + 16 + PARTY_BAR_WIDTH + PARTY_BAR_GAP;

/** Margens da área das janelas nas demais bordas; o topo deixa livres o menu e as notificações do app */
export const WINDOW_AREA_EDGE = 8;
export const WINDOW_AREA_TOP = 72;

/** Camada das janelas: acima do conteúdo, abaixo do dock de combate (1200), do chat e dos modais (1300) */
export const WINDOW_Z_BASE = 1100;

/** No celular a janela ocupa a tela toda, acima do dock e abaixo do chat */
export const WINDOW_Z_MOBILE = 1250;
