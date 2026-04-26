import { NextResponse } from 'next/server';
import { perkRepository, weaponRepository, itemRepository, armorRepository, spellRepository, powerRepository } from '@repositories';

// Força rota dinâmica (não pré-renderiza) - Firebase precisa de runtime
export const dynamic = 'force-dynamic'

export async function GET() {
    const perks = await perkRepository.find()
    const powers = await powerRepository.find()
    const items = await itemRepository.find()
    const armors = await armorRepository.find()
    const spells = await spellRepository.find()
    const weapons = await weaponRepository.find()

    return NextResponse.json({
        perks,
        powers,
        items,
        armors,
        spells,
        weapons
    })
}