import { levelDefaultRewards } from '@constants/levelDefaultRewards';
import { skills } from '@constants/skills';
import { fichaDoc } from '@models/db/ficha';
import { notificationCollection } from '@models/db/notification';
import type { Classes, FichaDto, Skill } from '@types';
import { addDoc, getDoc, updateDoc } from 'firebase/firestore';

// TODO: Ajustar recompensas de acordo com nível
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { level } = await req.json();

        const fichaSnap = await getDoc(fichaDoc(id));

        if (!fichaSnap.exists()) {
            return Response.json({ message: 'Ficha não encontrada' }, { status: 404 });
        }

        const ficha = fichaSnap.data() as FichaDto;

        const oldLevel = ficha.level;
        const newLevel = oldLevel + level;
        const classRewards = levelDefaultRewards[ficha.class as Classes];
        let newORMLevel = newLevel % 5 === 0 ? Math.min(4, Math.floor(newLevel / 5)) : ficha.ORMLevel;

        // Inicializa as recompensas
        let lpMpRewards = 0;
        let testPoints = 0;
        let attributePoints = 0;
        let magicPowerPoints = 0;
        let spellsPoints = 0;

        // Lista para guardar as recompensas para a notificação
        const rewardsList: string[] = [];

        // Verifica cada nível individualmente para aplicar as recompensas
        for (let currentLevel = oldLevel + 1; currentLevel <= newLevel; currentLevel++) {
            if (currentLevel === 1) {
                if (ficha.lineage === 'Estrangeiro') {
                    spellsPoints += 1;
                    rewardsList.push('+1 ponto de magia (bônus de linhagem "Estrangeiro")');
                }
                newORMLevel = 1;
                rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`);
            }

            // No nível 20: 20 pontos de Atributo extra
            if (currentLevel === 20) {
                attributePoints += 20;
                rewardsList.push('+20 pontos de atributo (bônus nível 20)');
                if (ficha.lineage === 'Estrangeiro') {
                    spellsPoints += 1;
                    rewardsList.push('+1 ponto de magia (bônus de linhagem "Estrangeiro")');
                }
            }

            // ? CASO LP E MP NÃO ACOMPANHE DANO NO SISTEMA, MUDAR RECOMPENSA DE LP E MP E/OU PONTOS DE ATRIBUTO
            // A cada 2 níveis: LP, MP e Pontos de Perícia
            if (currentLevel % 2 === 0) {
                lpMpRewards++;
                testPoints += 3;
            }

            // A cada 4 níveis: Pontos de Atributo
            if (currentLevel % 4 === 0) {
                attributePoints += 12;
                rewardsList.push('+12 pontos de atributo');
            }

            // A cada 5 níveis: Pontos de Poder Mágico, Magias e Aumento de nível ORM
            if (currentLevel % 5 === 0) {
                magicPowerPoints++;
                spellsPoints += 2;
                rewardsList.push('+1 ponto de poder mágico');
                rewardsList.push('+2 pontos de magia');

                if (ficha.race === 'Humano') {
                    testPoints += 2;
                    rewardsList.push('+2 pontos de perícia (bônus de raça "Humano")');
                }

                if (currentLevel !== 20) {
                    newORMLevel++;
                    rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`);
                }
            }
        }

        let newMaxLp = ficha.attributes.maxLp;
        let newMaxMp = ficha.attributes.maxMp;
        let newLp = ficha.attributes.lp;
        let newMp = ficha.attributes.mp;

        // Se ganhou LP/MP, adiciona na lista de recompensas
        if (lpMpRewards > 0) {
            let lineageMpGain = 0;
            let lineageLpGain = 0;

            const mpPerLevel = classRewards.mp + ficha.mods.attributes.foc;
            const lpPerLevel = classRewards.lp + ficha.mods.attributes.vig;

            let mpGain = lpMpRewards * mpPerLevel;
            let lpGain = lpMpRewards * lpPerLevel;

            rewardsList.push(`+${lpGain} LP`);
            rewardsList.push(`+${mpGain} MP`);

            if (ficha.lineage === 'Idólatra') {
                lineageMpGain = lpMpRewards;
                mpGain += lineageMpGain;
                rewardsList.push(`+${lineageMpGain} MP (bônus de linhagem "Idólatra")`);
            }

            if (ficha.lineage === 'Ginasta') {
                lineageLpGain = lpMpRewards;
                lpGain += lineageLpGain;
                rewardsList.push(`+${lineageLpGain} LP (bônus de linhagem "Ginasta")`);
            }

            newMaxLp += lpGain;
            newMaxMp += mpGain;

            newLp = ficha.attributes.lp >= ficha.attributes.maxLp ? newMaxLp : ficha.attributes.lp;
            newMp = ficha.attributes.mp >= ficha.attributes.maxMp ? newMaxMp : ficha.attributes.mp;
        }

        // Se ganhou pontos de perícia, adiciona na lista
        if (testPoints > 0) {
            rewardsList.push(`+${testPoints} pontos de perícia`);
        }

        // Busca novas habilidades
        const newClassSkills: Skill[] = [];
        const newSubclassSkills: Skill[] = [];
        const classSkills = skills.class[ficha.class as Classes];

        // Verifica se há novas habilidades para o nível atual
        classSkills.forEach(skill => {
            if (skill.level! > oldLevel && skill.level! <= newLevel) {
                newClassSkills.push(skill);
                rewardsList.push(`+Nova habilidade de classe: ${skill.name}`);
            }
        });

        // Verifica se há novas habilidades da subclasse
        if (ficha.subclass) {
            const subclassSkills = skills.subclass[ficha.subclass as keyof typeof skills.subclass];
            if (subclassSkills) {
                subclassSkills.forEach(skill => {
                    if (skill.level! > oldLevel && skill.level! <= newLevel) {
                        newSubclassSkills.push(skill);
                        rewardsList.push(`+Nova habilidade de subclasse: ${skill.name}`);
                    }
                });
            }
        }

        const updatedFicha: FichaDto = {
            ...ficha,
            level: newLevel,
            ORMLevel: newORMLevel,
            attributes: {
                ...ficha.attributes,
                maxLp: newMaxLp,
                maxMp: newMaxMp,
                lp: newLp,
                mp: newMp
            },
            points: {
                ...ficha.points,
                expertises: ficha.points.expertises + testPoints,
                attributes: ficha.points.attributes + attributePoints,
                skills: ficha.points.skills + magicPowerPoints,
                magics: ficha.points.magics + spellsPoints
            },
            skills: {
                ...ficha.skills,
                class: [ ...ficha.skills.class, ...newClassSkills ],
                subclass: [ ...ficha.skills.subclass, ...newSubclassSkills ]
            }
        };

        await updateDoc(fichaDoc(id), updatedFicha);

        // Cria a notificação
        await addDoc(notificationCollection, {
            userId: ficha.userId,
            title: 'Level Up!',
            content: `Sua ficha ${ficha.name} foi para o nível ${newLevel}!\nRecompensas: ${rewardsList.length > 0 ? `\n\n${rewardsList.join('\n')}` : ''}`,
            timestamp: new Date(),
            type: 'levelUp',
            link: `/ficha/${ficha._id}`,
            read: false
        });

        return Response.json(updatedFicha);
    } catch (error) {
        console.error('Erro ao atualizar nível:', error);
        return Response.json({ message: 'Erro ao atualizar nível' }, { status: 500 });
    }
}
