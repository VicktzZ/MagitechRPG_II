import Ficha from '@models/db/ficha'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const fichas = await Ficha.updateMany(
            {},
            [
                {
                    $set: {
                        maxLp: '$attributes.lp',
                        maxMp: '$attributes.mp',
                        maxAp: '$attributes.ap',
                        status: [
                            {
                                name: 'Normal',
                                type: 'normal'
                            }
                        ],
                        ammoCounter: {
                            current: 0,
                            max: 30
                        }
                    }
                }
            ]
        )

        return NextResponse.json({ message: 'All fichas updated', fichas })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating fichas', error: error.message }, { status: 500 })
    }
}

export async function DELETE() {
    try {
        const fichas = await Ficha.updateMany(
            {},
            {
                $unset: {
                    maxLp: 1,
                    maxMp: 1,
                    maxAp: 1,
                    ammoCounter: 1
                }
            }
        )

        return NextResponse.json({ message: 'Properties removed from all fichas', fichas })
    } catch (error: any) {
        return NextResponse.json({ message: 'Error removing properties from fichas', error: error.message }, { status: 500 })
    }
}