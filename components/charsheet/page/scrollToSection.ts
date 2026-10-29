/** Leva a tela até a seção da ficha (âncora `id`), sem animação para quem pediu movimento reduzido. */
export function scrollToSection(sectionId: string | undefined): void {
    if (!sectionId || typeof document === 'undefined') return;
    const element = document.getElementById(sectionId);
    if (!element) return;
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
