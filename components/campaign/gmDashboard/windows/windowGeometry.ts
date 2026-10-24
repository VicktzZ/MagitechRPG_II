import { WINDOW_MIN_SIZE, type WindowSize } from './windowKinds';

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** Área da tela em que as janelas podem ficar (coordenadas da viewport, em px) */
export interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface Insets {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/** Desloca cada janela nova em relação à anterior para que as barras de título não fiquem empilhadas */
const CASCADE_STEP = 28;
const CASCADE_STEPS = 6;
const CASCADE_MARGIN = 24;

/** Mantém `value` entre `min` e `max`; se a faixa for invertida (área menor que o mínimo), vale `min` */
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max));

const finiteOr = (value: number, fallback: number): number => (Number.isFinite(value) ? value : fallback);

/** A janela inteira dentro da área: tamanho entre o mínimo e a área, posição de modo que nada saia da tela */
export function clampRect(rect: Rect, bounds: Bounds, min: WindowSize = WINDOW_MIN_SIZE): Rect {
    const areaW = Math.max(0, bounds.right - bounds.left);
    const areaH = Math.max(0, bounds.bottom - bounds.top);
    const w = clamp(finiteOr(rect.w, min.w), min.w, areaW);
    const h = clamp(finiteOr(rect.h, min.h), min.h, areaH);

    return {
        x: clamp(finiteOr(rect.x, bounds.left), bounds.left, bounds.right - w),
        y: clamp(finiteOr(rect.y, bounds.top), bounds.top, bounds.bottom - h),
        w,
        h
    };
}

/** Onde abre a janela de número `index`: em cascata a partir do canto superior esquerdo da área */
export function cascadeRect(index: number, size: WindowSize, bounds: Bounds): Rect {
    const offset = (Math.max(0, index) % CASCADE_STEPS) * CASCADE_STEP;

    return clampRect({
        x: bounds.left + CASCADE_MARGIN + offset,
        y: bounds.top + CASCADE_MARGIN + offset,
        w: size.w,
        h: size.h
    }, bounds);
}

/** Arrastar: move sem tirar a janela da área */
export function moveBy(origin: Rect, dx: number, dy: number, bounds: Bounds, min: WindowSize = WINDOW_MIN_SIZE): Rect {
    return clampRect({ ...origin, x: origin.x + dx, y: origin.y + dy }, bounds, min);
}

/**
 * Redimensionar pela borda direita, inferior ou pelo canto: o canto superior esquerdo fica onde está
 * e o tamanho para na borda da área (a janela não se desloca para caber).
 */
export function resizeBy(origin: Rect, dw: number, dh: number, bounds: Bounds, min: WindowSize = WINDOW_MIN_SIZE): Rect {
    return {
        x: origin.x,
        y: origin.y,
        w: clamp(origin.w + dw, min.w, bounds.right - origin.x),
        h: clamp(origin.h + dh, min.h, bounds.bottom - origin.y)
    };
}

/** Área útil a partir do tamanho da viewport e das margens (barra do grupo à esquerda, chat encaixado à direita) */
export function computeBounds(viewport: { width: number; height: number }, insets: Insets): Bounds {
    return {
        left: insets.left,
        top: insets.top,
        right: viewport.width - insets.right,
        bottom: viewport.height - insets.bottom
    };
}
