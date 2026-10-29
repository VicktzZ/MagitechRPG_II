/** Ficha saudável para os testes (sem importar constants/charsheet, que não compila sob o ts-jest). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sheet = any;

export function healthySheet(): Sheet {
    return {
        id: 'sheet-1',
        playerName: 'Jogadora',
        userId: 'user-1',
        mode: 'Classic',
        name: 'Aria',
        age: 20,
        class: 'Arcano',
        race: 'Humano',
        lineage: 'Idólatra',
        subclass: '',
        gender: 'Feminino',
        financialCondition: 'Estável',
        elementalMastery: '',
        anotacoes: '',
        createdAt: '2025-01-01T00:00:00.000Z',
        traits: [],
        displacement: 9,
        level: 4,
        ORMLevel: 1,
        spells: [],
        spellSpace: 1,
        mpLimit: 0,
        overall: 0,
        ammoCounter: { current: 0, max: 0 },
        skills: { lineage: [], bonus: [], class: [], powers: [], subclass: [], race: [] },
        capacity: { cargo: 1, max: 5 },
        inventory: { items: [], weapons: [], armors: [], money: 100 },
        expertises: {
            Luta: { value: 2, defaultAttribute: 'vig' },
            Magia: { value: 3, defaultAttribute: 'foc' },
            Fortitude: { value: 0, defaultAttribute: null }
        },
        points: { attributes: 0, expertises: 0, skills: 0, magics: 0 },
        attributes: { car: 5, vig: 6, des: 7, foc: 8, log: 9, sab: 4 },
        stats: { lp: 20, mp: 20, ap: 5, maxLp: 20, maxMp: 20, maxAp: 5 },
        mods: { attributes: { des: 1, vig: 1, log: 1, sab: 1, foc: 1, car: 1 }, discount: -10 },
        dices: [],
        passives: [],
        status: [],
        session: []
    };
}
