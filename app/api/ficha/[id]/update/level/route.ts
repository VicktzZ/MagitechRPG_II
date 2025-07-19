import { connectToDb } from '@utils/database'
import Ficha from '@models/ficha'
import Notification from '@models/notification'
import { levelDefaultRewards } from '@constants/levelDefaultRewards'
import { skills } from '@constants/skills'
import type { Classes, Skill } from '@types'

// TODO: Ajustar recompensas de acordo com nível
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params
        const { level } = await req.json()

        const ficha = await Ficha.findById(id)

        if (!ficha) {
            return Response.json({ message: 'Ficha não encontrada' }, { status: 404 })
        }

        const oldLevel = ficha.level
        const newLevel = oldLevel + level
        const classRewards = levelDefaultRewards[ficha.class as Classes]
        let newORMLevel = Math.min(4, Math.floor(newLevel / 5))

        // Inicializa as recompensas
        let lpMpRewards = 0
        let testPoints = 0
        let attributePoints = 0
        let magicPowerPoints = 0
        let spellsPoints = 0
        
        // Lista para guardar as recompensas para a notificação
        const rewardsList: string[] = []
        
        // Verifica cada nível individualmente para aplicar as recompensas
        for (let currentLevel = oldLevel + 1; currentLevel <= newLevel; currentLevel++) {
            if (currentLevel === 1) {
                newORMLevel = 1
                rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`)
            }

            // No nível 20: 20 pontos de Atributo extra
            if (currentLevel === 20) {
                attributePoints += 20
                rewardsList.push('+20 pontos de atributo (bônus nível 20)')
            }

            // ? CASO LP E MP NÃO ACOMPANHE DANO NO SISTEMA, MUDAR RECOMPENSA DE LP E MP E/OU PONTOS DE ATRIBUTO
            // A cada 2 níveis: LP, MP e Pontos de Perícia
            if (currentLevel % 2 === 0) {
                lpMpRewards++
                testPoints += 3
            }

            // A cada 4 níveis: Pontos de Atributo
            if (currentLevel % 4 === 0) {
                attributePoints += 18
                rewardsList.push('+18 pontos de atributo')
            }

            // A cada 5 níveis: Pontos de Poder Mágico, Magias e Aumento de nível ORM
            if (currentLevel % 5 === 0) {
                magicPowerPoints++
                spellsPoints += 2
                rewardsList.push('+1 ponto de poder mágico')
                rewardsList.push('+2 pontos de magia')
                if (currentLevel !== 20) {
                    newORMLevel++
                    rewardsList.push(`+ORM nível ${newORMLevel} Atingido!`)
                }
            }
        }

        // Se ganhou LP/MP, adiciona na lista de recompensas
        if (lpMpRewards > 0) {
            const lpGain = lpMpRewards * (classRewards.lp + ficha.mods.attributes.vig)
            const mpGain = lpMpRewards * (classRewards.mp + ficha.mods.attributes.foc)
            rewardsList.push(`+${lpGain} LP`)
            rewardsList.push(`+${mpGain} MP`)
        }

        // Se ganhou pontos de perícia, adiciona na lista
        if (testPoints > 0) {
            rewardsList.push(`+${testPoints} pontos de perícia`)
        }

        // Busca novas habilidades
        const newClassSkills: Skill[] = []
        const newSubclassSkills: Skill[] = []
        const classSkills = skills.class[ficha.class as Classes]

        // Verifica se há novas habilidades para o nível atual
        classSkills.forEach(skill => {
            if (skill.level! > oldLevel && skill.level! <= newLevel) {
                newClassSkills.push(skill)
                rewardsList.push(`+Nova habilidade de classe: ${skill.name}`)
            }
        })

        // Verifica se há novas habilidades da subclasse
        if (ficha.subclass) {
            const subclassSkills = skills.subclass[ficha.subclass as keyof typeof skills.subclass]
            if (subclassSkills) {
                subclassSkills.forEach(skill => {
                    if (skill.level! > oldLevel && skill.level! <= newLevel) {
                        newSubclassSkills.push(skill)
                        rewardsList.push(`+Nova habilidade de subclasse: ${skill.name}`)
                    }
                })
            }
        }

        // Aplica as recompensas
        const updates = {
            level: newLevel,
            // Apenas atualiza os máximos de LP e MP
            maxLp: ficha.attributes.maxLp + (lpMpRewards * (classRewards.lp + ficha.attributes.vig)),
            maxMp: ficha.attributes.maxMp + (lpMpRewards * (classRewards.mp + ficha.attributes.foc)),
            ...(lpMpRewards > 0 && {
                'attributes.lp': ficha.attributes.lp >= ficha.attributes.maxLp ? ficha.attributes.lp + (lpMpRewards * (classRewards.lp + ficha.attributes.vig)) : ficha.attributes.lp,
                'attributes.mp': ficha.attributes.mp >= ficha.attributes.maxMp ? ficha.attributes.mp + (lpMpRewards * (classRewards.mp + ficha.attributes.foc)) : ficha.attributes.mp
            }),
            // Pontos ganhos
            'points.expertises': ficha.points.expertises + testPoints,
            'points.attributes': ficha.points.attributes + attributePoints,
            'points.skills': ficha.points.skills + magicPowerPoints,
            'points.magics': ficha.points.magics + spellsPoints,
            // Atualiza ORM
            ORMLevel: newORMLevel
        }

        const updateQuery = { $set: updates, $push: {} }

        // Adiciona habilidades de classe somente se houver alguma nova
        if (newClassSkills.length > 0) {
            updateQuery.$push = { ...updateQuery.$push, 'skills.class': { $each: newClassSkills } }
        }
        
        // Adiciona habilidades de subclasse somente se houver alguma nova
        if (newSubclassSkills.length > 0) {
            updateQuery.$push = { ...updateQuery.$push, 'skills.subclass': { $each: newSubclassSkills } }
        }

        const updatedFicha = await Ficha.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).lean()

        // Cria a notificação
        await Notification.create({
            userId: ficha.userId,
            title: 'Level Up!',
            content: `Sua ficha ${ficha.name} foi para o nível ${newLevel}!\nRecompensas: ${rewardsList.length > 0 ? `\n\n${rewardsList.join(';\n')}` : ''}`,
            timestamp: new Date(),
            type: 'levelUp',
            link: `/ficha/${ficha._id}`,
            read: false
        })

        return Response.json(updatedFicha)
    } catch (error) {
        console.error('Erro ao atualizar nível:', error)
        return Response.json({ message: 'Erro ao atualizar nível' }, { status: 500 })
    }
}
