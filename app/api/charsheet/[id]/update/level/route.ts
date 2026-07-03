import { levelDefaultRewards } from '@constants/levelDefaultRewards';
import { skills } from '@constants/skills';
import type { Skill } from '@models';
import type { Charsheet } from '@models/entities/Charsheet';
import type { RPGSystem } from '@models/entities/RPGSystem';
import type { ClassNames } from '@models/types/string';
import { charsheetRepository, notificationRepository, rpgSystemRepository } from '@repositories';

function normalizeToArray<T>(value: any): T[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'object') {
        const keys = Object.keys(value)
        const isNumericKeys = keys.every(key => !isNaN(Number(key)))
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => value[key])
        }
    }
    return []
}

// ─────────────────────────────────────────────
// Progressão legada do Magitech RPG (hardcoded)
// Preservada integralmente para evitar regressões
// ─────────────────────────────────────────────
function calcMagitechProgression(charsheet: Charsheet, oldLevel: number, newLevel: number) {
    const classRewards = levelDefaultRewards[charsheet.class as ClassNames];
    let newORMLevel = newLevel % 5 === 0 ? Math.min(4, Math.floor(newLevel / 5)) : charsheet.ORMLevel;

    let lpMpRewards = 0;
    let testPoints = 0;
    let attributePoints = 0;
    let magicPowerPoints = 0;
    let spellsPoints = 0;
    const rewardsList: string[] = [];

    for (let currentLevel = oldLevel + 1; currentLevel <= newLevel; currentLevel++) {
        if (currentLevel === 1) {
            if (charsheet.lineage === 'Estrangeiro') {
                spellsPoints += 1;
                rewardsList.push('+1 ponto de magia (bônus de linhagem "Estrangeiro")');
            }
            newORMLevel = 1;
            rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`);
        }

        if (currentLevel === 20) {
            attributePoints += 20;
            rewardsList.push('+20 pontos de atributo (bônus nível 20)');
            if (charsheet.lineage === 'Estrangeiro') {
                spellsPoints += 1;
                rewardsList.push('+1 ponto de magia (bônus de linhagem "Estrangeiro")');
            }
        }

        if (currentLevel % 2 === 0) {
            lpMpRewards++;
            testPoints += 3;
        }

        if (currentLevel % 4 === 0) {
            magicPowerPoints++;
            attributePoints += 12;
            rewardsList.push('+12 pontos de atributo');
            rewardsList.push('+1 ponto de poder mágico');
        }

        if (currentLevel % 5 === 0) {
            spellsPoints += 2;
            rewardsList.push('+2 pontos de magia');

            if (charsheet.race === 'Humano') {
                testPoints += 2;
                rewardsList.push('+2 pontos de perícia (bônus de raça "Humano")');
            }

            if (currentLevel !== 20) {
                newORMLevel++;
                rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`);
            }
        }
    }

    let newMaxLp = charsheet.stats.maxLp;
    let newMaxMp = charsheet.stats.maxMp;
    let newLp = charsheet.stats.lp;
    let newMp = charsheet.stats.mp;

    if (lpMpRewards > 0) {
        let lineageMpGain = 0;
        let lineageLpGain = 0;

        const mpPerLevel = classRewards.mp + charsheet.mods.attributes.foc;
        const lpPerLevel = classRewards.lp + charsheet.mods.attributes.vig;

        let mpGain = lpMpRewards * mpPerLevel;
        let lpGain = lpMpRewards * lpPerLevel;

        rewardsList.push(`+${lpGain} LP`);
        rewardsList.push(`+${mpGain} MP`);

        if (charsheet.lineage === 'Idólatra') {
            lineageMpGain = lpMpRewards;
            mpGain += lineageMpGain;
            rewardsList.push(`+${lineageMpGain} MP (bônus de linhagem "Idólatra")`);
        }

        if (charsheet.lineage === 'Ginasta') {
            lineageLpGain = lpMpRewards;
            lpGain += lineageLpGain;
            rewardsList.push(`+${lineageLpGain} LP (bônus de linhagem "Ginasta")`);
        }

        newMaxLp += lpGain;
        newMaxMp += mpGain;

        newLp = charsheet.stats.lp >= charsheet.stats.maxLp ? newMaxLp : charsheet.stats.lp;
        newMp = charsheet.stats.mp >= charsheet.stats.maxMp ? newMaxMp : charsheet.stats.mp;
    }

    if (testPoints > 0) rewardsList.push(`+${testPoints} pontos de perícia`);

    // Habilidades de classe (das constantes hardcoded do Magitech)
    const newClassSkills: Skill[] = [];
    const newSubclassSkills: Skill[] = [];
    const classSkills = skills.class[charsheet.class as ClassNames];

    classSkills?.forEach(skill => {
        if (skill.level! > oldLevel && skill.level! <= newLevel) {
            newClassSkills.push(skill);
            rewardsList.push(`+Nova habilidade de classe: ${skill.name}`);
        }
    });

    if (charsheet.subclass) {
        const subclassSkills = skills.subclass[charsheet.subclass as keyof typeof skills.subclass];
        subclassSkills?.forEach(skill => {
            if (skill.level! > oldLevel && skill.level! <= newLevel) {
                newSubclassSkills.push(skill);
                rewardsList.push(`+Nova habilidade de subclasse: ${skill.name}`);
            }
        });
    }

    return {
        newORMLevel,
        newMaxLp,
        newMaxMp,
        newLp,
        newMp,
        testPoints,
        attributePoints,
        magicPowerPoints,
        spellsPoints,
        newClassSkills,
        newSubclassSkills,
        rewardsList
    };
}

// ─────────────────────────────────────────────
// Progressão data-driven via RPGSystem.progressionTable
// Usado para sistemas customizados (ex: Cosmos RPG)
// ─────────────────────────────────────────────
function calcCustomProgression(charsheet: Charsheet, system: RPGSystem, oldLevel: number, newLevel: number) {
    let hpBonus = 0;
    let skillPoints = 0;
    let attributePoints = 0;
    const customResourceDeltas: Record<string, number> = {};
    const fieldBonusDeltas: Record<string, number> = {};
    const rewardsList: string[] = [];

    // Labels legíveis para os fieldBonuses genéricos
    const fieldBonusLabels: Record<string, string> = {
        mp: system.pointsConfig?.mpName || 'Mana',
        ap: system.pointsConfig?.apName || 'Armadura',
        magicPoints: 'Pontos de Magia',
        spellSpaces: 'Espaços de Magia',
    };

    for (let currentLevel = oldLevel + 1; currentLevel <= newLevel; currentLevel++) {
        const levelData = system.progressionTable.find(p => p.level === currentLevel);
        if (!levelData) continue;

        if (levelData.hpBonus > 0) {
            hpBonus += levelData.hpBonus;
            rewardsList.push(`+${levelData.hpBonus} HP${levelData.label ? ` (${levelData.label})` : ''}`);
        }

        if (levelData.skillPoints > 0) {
            skillPoints += levelData.skillPoints;
            rewardsList.push(`+${levelData.skillPoints} pontos de perícia`);
        }

        if (levelData.attributePoints && levelData.attributePoints > 0) {
            attributePoints += levelData.attributePoints;
            rewardsList.push(`+${levelData.attributePoints} pontos de atributo`);
        }

        if (levelData.customResourceBonuses) {
            for (const [ key, bonus ] of Object.entries(levelData.customResourceBonuses)) {
                customResourceDeltas[key] = (customResourceDeltas[key] ?? 0) + bonus;
                const resourceDef = system.customResources?.find(r => r.key === key);
                const label = resourceDef?.name ?? key;
                rewardsList.push(`+${bonus} ${label} (máximo)`);
            }
        }

        if (levelData.fieldBonuses) {
            for (const [ key, bonus ] of Object.entries(levelData.fieldBonuses)) {
                if (!bonus) continue;
                fieldBonusDeltas[key] = (fieldBonusDeltas[key] ?? 0) + bonus;
                const label = fieldBonusLabels[key] ?? key;
                rewardsList.push(`${bonus > 0 ? '+' : ''}${bonus} ${label}`);
            }
        }

        if (levelData.unlocksClassAbility) {
            rewardsList.push(`Nova habilidade de classe desbloqueada (nível ${currentLevel})`);
        }

        if (levelData.customLabel) {
            rewardsList.push(levelData.customLabel);
        }
    }

    // Habilidades de classe a partir das definições do RPGSystem
    const newClassSkills: Skill[] = [];
    const newSubclassSkills: Skill[] = [];
    const newBonusSkills: Skill[] = [];

    const systemClass = system.classes?.find(c => c.key === charsheet.class || c.name === charsheet.class);
    systemClass?.skills?.forEach(skill => {
        if (skill.level != null && skill.level > oldLevel && skill.level <= newLevel) {
            newClassSkills.push(skill as Skill);
            rewardsList.push(`+Nova habilidade de classe: ${skill.name}`);
        }
    });

    // Habilidades gerais do sistema com nível atingido e classe compatível
    // (requiredClass vazio = qualquer classe; aceita key ou name)
    system.skills?.forEach(skill => {
        if (skill.level == null || skill.level <= 0) return;
        if (!(skill.level > oldLevel && skill.level <= newLevel)) return;

        if (skill.requiredClass) {
            const matchesClass =
                skill.requiredClass === charsheet.class ||
                systemClass?.key === skill.requiredClass ||
                systemClass?.name === skill.requiredClass;
            if (!matchesClass) return;
        }

        newBonusSkills.push(skill as Skill);
        rewardsList.push(`+Nova habilidade: ${skill.name}`);
    });

    if (charsheet.subclass) {
        const systemSubclass = system.subclasses?.find(
            s => s.key === charsheet.subclass || s.name === charsheet.subclass
        );
        systemSubclass?.skills?.forEach(skill => {
            if (skill.level != null && skill.level > oldLevel && skill.level <= newLevel) {
                newSubclassSkills.push(skill as Skill);
                rewardsList.push(`+Nova habilidade de subclasse: ${skill.name}`);
            }
        });
    }

    return {
        hpBonus,
        skillPoints,
        attributePoints,
        customResourceDeltas,
        fieldBonusDeltas,
        newClassSkills,
        newSubclassSkills,
        newBonusSkills,
        rewardsList
    };
}

// ─────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: { level: number } = await req.json();
        const { level } = body;

        const charsheet = await charsheetRepository.findById(id);
        if (!charsheet) {
            return Response.json({ message: 'Charsheet não encontrada' }, { status: 404 });
        }

        // Carrega o sistema customizado se existir
        let system: RPGSystem | null = null;
        if (charsheet.systemId) {
            system = await rpgSystemRepository.findById(charsheet.systemId);
        }

        const maxLevel = system?.maxLevel ?? 20;

        if (level < 1 || level > maxLevel) {
            return Response.json(
                { message: 'BAD REQUEST', error: `Level deve estar entre 1 e ${maxLevel}` },
                { status: 400 }
            );
        }

        const oldLevel = charsheet.level;
        const newLevel = Math.min(oldLevel + level, maxLevel);

        const hasCustomProgression =
            system != null &&
            Array.isArray(system.progressionTable) &&
            system.progressionTable.length > 0;

        let updatedCharsheet: Charsheet;
        let rewardsList: string[];

        if (hasCustomProgression) {
            // ── Caminho customizado (Cosmos RPG e outros sistemas com progressionTable) ──
            const result = calcCustomProgression(charsheet, system!, oldLevel, newLevel);

            // Bônus de recursos aumentam o MÁXIMO PESSOAL do recurso
            // (ex: Estresse Máx cresce de 10 para 12 com a progressão),
            // sem alterar o valor atual do personagem.
            const updatedCustomResourceMaxes = { ...(charsheet.customResourceMaxes ?? {}) };
            for (const [ key, delta ] of Object.entries(result.customResourceDeltas)) {
                const resourceDef = system!.customResources?.find(r => r.key === key);
                const currentMax = updatedCustomResourceMaxes[key] ?? resourceDef?.max ?? 0;
                updatedCustomResourceMaxes[key] = currentMax + delta;
            }

            const fb = result.fieldBonusDeltas;
            const newMaxMp = charsheet.stats.maxMp + (fb['mp'] ?? 0);
            const newMaxAp = charsheet.stats.maxAp + (fb['ap'] ?? 0);

            updatedCharsheet = {
                ...charsheet,
                level: newLevel,
                stats: {
                    ...charsheet.stats,
                    maxLp: charsheet.stats.maxLp + result.hpBonus,
                    lp: charsheet.stats.lp >= charsheet.stats.maxLp
                        ? charsheet.stats.maxLp + result.hpBonus
                        : charsheet.stats.lp,
                    maxMp: newMaxMp,
                    mp: charsheet.stats.mp >= charsheet.stats.maxMp ? newMaxMp : charsheet.stats.mp,
                    maxAp: newMaxAp,
                    ap: charsheet.stats.ap >= charsheet.stats.maxAp ? newMaxAp : charsheet.stats.ap,
                },
                points: {
                    ...charsheet.points,
                    expertises: charsheet.points.expertises + result.skillPoints,
                    attributes: charsheet.points.attributes + result.attributePoints,
                    magics: (charsheet.points.magics ?? 0) + (fb['magicPoints'] ?? 0),
                },
                spellSpace: charsheet.spellSpace + (fb['spellSpaces'] ?? 0),
                skills: {
                    ...charsheet.skills,
                    class: [ ...normalizeToArray<Skill>(charsheet.skills?.class), ...result.newClassSkills ],
                    subclass: [ ...normalizeToArray<Skill>(charsheet.skills?.subclass), ...result.newSubclassSkills ],
                    bonus: [ ...normalizeToArray<Skill>(charsheet.skills?.bonus), ...result.newBonusSkills ]
                },
                customResourceMaxes: updatedCustomResourceMaxes
            };
            rewardsList = result.rewardsList;

        } else {
            // ── Caminho legado Magitech (sem progressionTable ou sem systemId) ──
            const newORMLevel = newLevel % 5 === 0
                ? Math.min(4, Math.floor(newLevel / 5))
                : charsheet.ORMLevel;

            const result = calcMagitechProgression(charsheet, oldLevel, newLevel);

            updatedCharsheet = {
                ...charsheet,
                level: newLevel,
                ORMLevel: result.newORMLevel ?? newORMLevel,
                stats: {
                    ...charsheet.stats,
                    lp: result.newLp,
                    mp: result.newMp,
                    maxLp: result.newMaxLp,
                    maxMp: result.newMaxMp
                },
                points: {
                    ...charsheet.points,
                    expertises: charsheet.points.expertises + result.testPoints,
                    attributes: charsheet.points.attributes + result.attributePoints,
                    skills: charsheet.points.skills + result.magicPowerPoints,
                    magics: charsheet.points.magics + result.spellsPoints
                },
                skills: {
                    ...charsheet.skills,
                    class: [ ...normalizeToArray<Skill>(charsheet.skills?.class), ...result.newClassSkills ],
                    subclass: [ ...normalizeToArray<Skill>(charsheet.skills?.subclass), ...result.newSubclassSkills ]
                }
            };
            rewardsList = result.rewardsList;
        }

        await charsheetRepository.update(updatedCharsheet);

        await notificationRepository.create({
            userId: charsheet.userId,
            title: 'Level Up!',
            content: `Sua charsheet ${charsheet.name} foi para o nível ${newLevel}!\nRecompensas: ${rewardsList.length > 0 ? `\n\n${rewardsList.join('\n')}` : ''}`,
            timestamp: new Date().toISOString(),
            type: 'levelUp',
            link: `/charsheet/${charsheet.id}`,
            read: false
        });

        return Response.json(updatedCharsheet);
    } catch (error: any) {
        console.error('Erro ao atualizar nível:', error);
        return Response.json({ message: 'Erro ao atualizar nível', error: error.message }, { status: 500 });
    }
}
