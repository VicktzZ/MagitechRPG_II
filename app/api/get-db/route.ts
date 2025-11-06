import mongoose from 'mongoose'

let isConnected = false

const connectToDb = async (): Promise<void> => {
    mongoose.set('strictQuery', true)

    if (isConnected) {
        console.log('MongoDB is already connected')
        return
    } 

    try {     
        await mongoose.connect('mongodb+srv://admin:yUpba1W1zXTqLT3i@magitech.vf71m3c.mongodb.net/?retryWrites=true&w=majority', {
            dbName: 'magitech'
        })

        isConnected = true
    } catch (error) {
        console.log(error)
    }
}

export async function GET() {
    await connectToDb()

    const collections = await mongoose.connection.db.collections()
    const collectionData = {} as { [key: string]: any[] }

    for (const collection of collections) {
        const data = await collection.find().toArray()
        let collectionName = collection.collectionName

        if (collection.collectionName === 'magias') collectionName = 'spells'
        if (collection.collectionName === 'poderes') collectionName = 'powers'
        if (collection.collectionName === 'fichas') collectionName = 'charsheets'

        collectionData[collectionName] = data.map(item => {
            if (item._id) {
                const { _id, _v, ...rest } = item
                if (collectionName === 'users') {
                    return { id: _id, createdAt: new Date(), ...rest }
                }
                if (collectionName === 'campaigns') {
                    const { players, session, _id, _v, notes, ...rest } = item
                    const returnData = {
                        id: _id,
                        createdAt: new Date(),
                        players: players?.map(player => ({ userId: player.userId, charsheetId: player.fichaId })),
                        session: {
                            ...session,
                            messages: session.messages?.map(message => ({
                                id: message._id,
                                text: message.text,
                                by: message.by,
                                timestamp: message.timestamp,
                                type: message.type,
                                isHTML: message.isHTML
                            }))
                        },
                        notes: notes?.map(note => ({
                            id: note._id,
                            content: note.content,
                            timestamp: note.timestamp
                        })),
                        ...rest
                    }
                    return returnData
                }
                if (collectionName === 'powers') {
                    return {
                        id: _id,
                        name: rest['nome'],
                        description: rest['descrição'],
                        element: rest['elemento'],
                        mastery: rest['maestria'],
                        preRequisite: rest['pré-requisito']
                    }
                }
                if (collectionName === 'spells') {
                    return {
                        id: _id,
                        name: rest['nome'],
                        stages: [
                            rest['estágio 1'],
                            rest['estágio 2'],
                            Number(rest['nível']) === 4 ? rest['maestria'] : rest['estágio 3']
                        ],
                        execution: rest['execução'],
                        range: rest['alcance'],
                        level: rest['nível'],
                        type: rest['tipo'],
                        element: rest['elemento'],
                        mpCost: rest['custo']
                    }
                }
                if (collectionName === 'charsheets') {
                    const { attributes, magics, magicsSpace, _id, _v, capacity, session, ...restCharsheet } = item
                    const returnData = {
                        id: _id, 
                        createdAt: new Date(),
                        spells: magics,
                        spellSpace: magicsSpace,
                        session: [
                            ...(session?.map?.(s => ({
                                id: s._id,
                                campaignCode: s.campaignCode,
                                stats: s.attributes
                            })) || [])
                        ],
                        stats: {
                            lp: attributes.lp,
                            maxLp: attributes.maxLp,
                            mp: attributes.mp,
                            maxMp: attributes.maxMp,
                            ap: attributes.ap,
                            maxAp: attributes.maxAp
                        },
                        capacity: {
                            cargo: Number(capacity.cargo),
                            max: Number(capacity.max)
                        },
                        attributes: {
                            vig: attributes.vig,
                            des: attributes.des,
                            log: attributes.log,
                            sab: attributes.sab,
                            foc: attributes.foc,
                            car: attributes.car
                        },
                        ...restCharsheet
                    }
                    
                    return returnData
                }
                return { id: _id, ...rest }
            }
            return item
        })
    }

    return Response.json(collectionData)
}
