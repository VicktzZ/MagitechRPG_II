import { cascadeRect, clampRect, computeBounds, moveBy, resizeBy, type Bounds } from '../windowGeometry';
import { WINDOW_MIN_SIZE } from '../windowKinds';

const area: Bounds = { left: 100, top: 80, right: 1100, bottom: 780 };

describe('clampRect', () => {
    it('não mexe numa janela que já cabe na área', () => {
        expect(clampRect({ x: 200, y: 200, w: 400, h: 300 }, area)).toEqual({ x: 200, y: 200, w: 400, h: 300 });
    });

    it('puxa para dentro uma janela que saiu pela esquerda, pelo topo, pela direita ou por baixo', () => {
        expect(clampRect({ x: 0, y: 0, w: 400, h: 300 }, area)).toMatchObject({ x: 100, y: 80 });
        expect(clampRect({ x: 5000, y: 5000, w: 400, h: 300 }, area)).toMatchObject({ x: 700, y: 480 });
    });

    it('limita o tamanho à área e ao mínimo', () => {
        expect(clampRect({ x: 100, y: 80, w: 5000, h: 5000 }, area)).toMatchObject({ w: 1000, h: 700 });
        expect(clampRect({ x: 100, y: 80, w: 10, h: 10 }, area)).toMatchObject({ w: WINDOW_MIN_SIZE.w, h: WINDOW_MIN_SIZE.h });
    });

    it('com a área menor que o mínimo, ancora no canto superior esquerdo em vez de fugir da tela', () => {
        const tiny: Bounds = { left: 10, top: 10, right: 110, bottom: 110 };
        expect(clampRect({ x: 500, y: 500, w: 400, h: 400 }, tiny)).toEqual({ x: 10, y: 10, w: WINDOW_MIN_SIZE.w, h: WINDOW_MIN_SIZE.h });
    });

    it('números inválidos (NaN) caem no canto da área e no tamanho mínimo', () => {
        expect(clampRect({ x: NaN, y: NaN, w: NaN, h: NaN }, area)).toEqual({ x: 100, y: 80, w: WINDOW_MIN_SIZE.w, h: WINDOW_MIN_SIZE.h });
    });

    it('janela recolhida usa a altura mínima da barra de título', () => {
        expect(clampRect({ x: 200, y: 200, w: 400, h: 40 }, area, { w: WINDOW_MIN_SIZE.w, h: 40 })).toMatchObject({ h: 40 });
    });
});

describe('cascadeRect', () => {
    it('a primeira abre perto do canto da área e cada nova desce e avança', () => {
        const first = cascadeRect(0, { w: 380, h: 560 }, area);
        const second = cascadeRect(1, { w: 380, h: 560 }, area);
        expect(first).toMatchObject({ x: 124, y: 104 });
        expect(second.x).toBeGreaterThan(first.x);
        expect(second.y).toBeGreaterThan(first.y);
    });

    it('a cascata volta ao início depois de seis janelas', () => {
        expect(cascadeRect(6, { w: 380, h: 300 }, area)).toEqual(cascadeRect(0, { w: 380, h: 300 }, area));
    });

    it('numa área estreita a janela é encolhida para caber', () => {
        const narrow: Bounds = { left: 8, top: 72, right: 520, bottom: 700 };
        const rect = cascadeRect(0, { w: 800, h: 560 }, narrow);
        expect(rect.x + rect.w).toBeLessThanOrEqual(narrow.right);
    });
});

describe('moveBy', () => {
    it('move e nunca deixa a janela sair da área', () => {
        const origin = { x: 200, y: 200, w: 400, h: 300 };
        expect(moveBy(origin, 50, -30, area)).toEqual({ x: 250, y: 170, w: 400, h: 300 });
        expect(moveBy(origin, 9999, 9999, area)).toMatchObject({ x: 700, y: 480 });
        expect(moveBy(origin, -9999, -9999, area)).toMatchObject({ x: 100, y: 80 });
    });
});

describe('resizeBy', () => {
    it('cresce e encolhe mantendo o canto superior esquerdo', () => {
        const origin = { x: 200, y: 200, w: 400, h: 300 };
        expect(resizeBy(origin, 100, 50, area)).toEqual({ x: 200, y: 200, w: 500, h: 350 });
        expect(resizeBy(origin, -9999, -9999, area)).toEqual({ x: 200, y: 200, w: WINDOW_MIN_SIZE.w, h: WINDOW_MIN_SIZE.h });
    });

    it('para na borda da área sem empurrar a janela', () => {
        const grown = resizeBy({ x: 700, y: 500, w: 300, h: 200 }, 500, 500, area);
        expect(grown).toEqual({ x: 700, y: 500, w: 400, h: 280 });
    });
});

describe('computeBounds', () => {
    it('desconta a barra do grupo, o chat e as margens da viewport', () => {
        expect(computeBounds({ width: 1440, height: 900 }, { left: 152, top: 72, right: 424, bottom: 8 }))
            .toEqual({ left: 152, top: 72, right: 1016, bottom: 892 });
    });
});
