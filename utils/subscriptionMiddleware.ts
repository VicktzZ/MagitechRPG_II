import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Permission } from '@enums/subscriptionEnum';
import { hasPermission } from './permissions';
import type { User } from '@models/entities';

/**
 * Middleware para verificar permissões de assinatura
 * Uso: Proteger rotas específicas baseado em permissões
 */
export async function requirePermission(
    request: NextRequest,
    permission: Permission,
    redirectUrl: string = '/subscription/plans'
) {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        const user = session.user as unknown as User;

        if (!hasPermission(user, permission)) {
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Erro no middleware de permissão:', error);
        return NextResponse.redirect(new URL('/error', request.url));
    }
}

/**
 * Middleware para verificar múltiplas permissões (AND)
 */
export async function requireAllPermissions(
    request: NextRequest,
    permissions: Permission[],
    redirectUrl: string = '/subscription/plans'
) {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        const user = session.user as unknown as User;

        const hasAllPermissions = permissions.every(permission => 
            hasPermission(user, permission)
        );

        if (!hasAllPermissions) {
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Erro no middleware de permissões:', error);
        return NextResponse.redirect(new URL('/error', request.url));
    }
}

/**
 * Middleware para verificar múltiplas permissões (OR)
 */
export async function requireAnyPermission(
    request: NextRequest,
    permissions: Permission[],
    redirectUrl: string = '/subscription/plans'
) {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        const user = session.user as unknown as User;

        const hasAnyPermission = permissions.some(permission => 
            hasPermission(user, permission)
        );

        if (!hasAnyPermission) {
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Erro no middleware de permissões:', error);
        return NextResponse.redirect(new URL('/error', request.url));
    }
}

/**
 * Helper para criar um middleware de permissão personalizado
 */
export function createPermissionMiddleware(
    permission: Permission,
    options: {
    redirectUrl?: string;
    allowUnauthenticated?: boolean;
  } = {}
) {
    return async (request: NextRequest) => {
        const { 
            redirectUrl = '/subscription/plans',
            allowUnauthenticated = false
        } = options;

        const session = await getServerSession();
    
        if (!session?.user) {
            if (allowUnauthenticated) {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        const user = session.user as unknown as User;

        if (!hasPermission(user, permission)) {
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        return NextResponse.next();
    };
}
