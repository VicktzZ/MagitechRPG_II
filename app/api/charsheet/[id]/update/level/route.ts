import { levelDefaultRewards } from '@constants/levelDefaultRewards';
import { skills } from '@constants/skills';
import type { Skill } from '@models';
import type { Charsheet } from '@models/entities/Charsheet';
import type { ClassNames } from '@models/types/string';
import { charsheetRepository, notificationRepository } from '@repositories';

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

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: { level: number } = await req.json();

        const { level } = body;

        if (level < 1 || level > 20) {
            return Response.json({ message: 'BAD REQUEST', error: 'Level deve estar entre 1 e 20' }, { status: 400 });
        }

        const charsheet = await charsheetRepository.findById(id);

        if (!charsheet) {
            return Response.json({ message: 'Charsheet não encontrada' }, { status: 404 });
        }

        const oldLevel = charsheet.level;
        const newLevel = oldLevel + level;
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

        if (testPoints > 0) {
            rewardsList.push(`+${testPoints} pontos de perícia`);
        }

        const newClassSkills: Skill[] = [];
        const newSubclassSkills: Skill[] = [];
        const classSkills = skills.class[charsheet.class as ClassNames];

        classSkills.forEach(skill => {
            if (skill.level! > oldLevel && skill.level! <= newLevel) {
                newClassSkills.push(skill);
                rewardsList.push(`+Nova habilidade de classe: ${skill.name}`);
            }
        });

        if (charsheet.subclass) {
            const subclassSkills = skills.subclass[charsheet.subclass as keyof typeof skills.subclass];
            if (subclassSkills) {
                subclassSkills.forEach(skill => {
                    if (skill.level! > oldLevel && skill.level! <= newLevel) {
                        newSubclassSkills.push(skill);
                        rewardsList.push(`+Nova habilidade de subclasse: ${skill.name}`);
                    }
                });
            }
        }

        const updatedCharsheet: Charsheet = {
            ...charsheet,
            level: newLevel,
            ORMLevel: newORMLevel,
            stats: {
                ...charsheet.stats,
                lp: newLp,
                mp: newMp,
                maxLp: newMaxLp,
                maxMp: newMaxMp
            },
            points: {
                ...charsheet.points,
                expertises: charsheet.points.expertises + testPoints,
                attributes: charsheet.points.attributes + attributePoints,
                skills: charsheet.points.skills + magicPowerPoints,
                magics: charsheet.points.magics + spellsPoints
            },
            skills: {
                ...charsheet.skills,
                class: [ ...normalizeToArray(charsheet.skills?.class), ...newClassSkills ],
                subclass: [ ...normalizeToArray(charsheet.skills?.subclass), ...newSubclassSkills ]
            }
        };

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