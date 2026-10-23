/**
 * Contador da ficha (ponto de evolução, por exemplo) que outra tela mexe enquanto a ficha está aberta.
 *
 * O formulário é uma foto da ficha: o mestre concede um ponto (ou o jogador gasta em outra aba) e o valor da tela fica velho.
 * Salvar o valor velho desfaria a mudança lá fora. Aqui o que mudou fora (`live - baseline`) é somado ao que o formulário já tem,
 * então o ponto gasto nesta tela e o concedido lá fora valem juntos. Devolve `null` quando nada mudou.
 */
export function mergeRemoteCounter(live: number, baseline: number, current: number): { current: number; baseline: number } | null {
    if (live === baseline) return null;
    return { current: Math.max(0, current + (live - baseline)), baseline: live };
}
