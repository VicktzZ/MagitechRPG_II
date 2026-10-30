import { hitMarkKey, isHitCritical, resetHitCriticals, setHitCritical } from '../hitCriticals'

describe('acertos críticos que esperam o dano', () => {
    afterEach(() => { resetHitCriticals() })

    it('a chave separa quem rolou, de onde e o nome', () => {
        expect(hitMarkKey('f1', 'weapon', 'Adaga')).not.toBe(hitMarkKey('f2', 'weapon', 'Adaga'))
        expect(hitMarkKey('f1', 'weapon', 'Adaga')).not.toBe(hitMarkKey('f1', 'spell', 'Adaga'))
        expect(hitMarkKey(undefined, 'weapon', 'Adaga')).toBe('|weapon|Adaga')
    })

    it('marca, desmarca e é idempotente', () => {
        const key = hitMarkKey('f1', 'weapon', 'Adaga')
        expect(isHitCritical(key)).toBe(false)
        setHitCritical(key, true)
        setHitCritical(key, true)
        expect(isHitCritical(key)).toBe(true)
        setHitCritical(key, false)
        expect(isHitCritical(key)).toBe(false)
    })

    it('uma nova rolagem sem crítico apaga a marca da anterior', () => {
        const key = hitMarkKey('f1', 'weapon', 'Adaga')
        setHitCritical(key, true)
        setHitCritical(key, false)
        expect(isHitCritical(key)).toBe(false)
    })

    it('reset esvazia tudo', () => {
        setHitCritical(hitMarkKey('f1', 'weapon', 'A'), true)
        setHitCritical(hitMarkKey('f1', 'weapon', 'B'), true)
        resetHitCriticals()
        expect(isHitCritical(hitMarkKey('f1', 'weapon', 'A'))).toBe(false)
        expect(isHitCritical(hitMarkKey('f1', 'weapon', 'B'))).toBe(false)
    })
})
