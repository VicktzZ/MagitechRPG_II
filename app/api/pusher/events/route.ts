import type { NextRequest } from 'next/server'

const handler = async (req: NextRequest, res: Response): Promise<Response> => {
    const body = await req.json()

    console.log(body);

    return Response.json(body)
}

export { handler as GET, handler as POST }