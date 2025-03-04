import { connectToDb } from '@utils/database'
import Ficha from '@models/ficha'
import { skills } from '@constants/skills'
import type { Skill } from '@types'

export async function POST(req: Request) {
    try {
        await connectToDb()

        const { fichaId } = await req.json()

        // Busca a ficha
        const ficha = await Ficha.findById(fichaId)
        if (!ficha) {
            return Response.json({ message: 'Ficha não encontrada' }, { status: 404 })
        }

        // Incrementa o nível
        const newLevel = ficha.level + 1

        // Calcula os bônus de atributos
        const lpBonus = 2 + ficha.attributes.vig
        const mpBonus = 2 + ficha.attributes.foc

        // Busca as habilidades da classe para o novo nível
        const classSkills = skills.class[ficha.class as keyof typeof skills.class]
        const newSkills: Skill[] = []

        // Verifica se há novas habilidades para o nível atual
        classSkills.forEach(skill => {
            if (skill.level === newLevel) {
                newSkills.push(skill)
            }
        })

        // Se tiver subclasse, verifica habilidades da subclasse também
        if (ficha.subclass) {
            const subclassSkills = skills.subclass[ficha.subclass as keyof typeof skills.subclass]
            if (subclassSkills) {
                subclassSkills.forEach(skill => {
                    if (skill.level === newLevel) {
                        newSkills.push(skill)
                    }
                })
            }
        }

        // Atualiza a ficha
        const updatedFicha = await Ficha.findByIdAndUpdate(
            fichaId,
            {
                $set: {
                    level: newLevel,
                    'attributes.maxLp': ficha.attributes.maxLp + lpBonus,
                    'attributes.maxMp': ficha.attributes.maxMp + mpBonus
                },
                $push: {
                    'skills.class': { $each: newSkills }
                }
            },
            { new: true }
        )

        return Response.json(updatedFicha)
    } catch (error) {
        console.error('Erro ao evoluir personagem:', error)
        return Response.json({ message: 'Erro ao evoluir personagem' }, { status: 500 })
    }
}
