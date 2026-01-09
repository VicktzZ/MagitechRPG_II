/**
 * Lista de emails com permissões administrativas
 * Estes usuários podem gerenciar assinaturas de outros usuários
 */
export const ADMIN_EMAILS = [
  'victorhugo220br@gmail.com'
];

/**
 * Verifica se um email pertence a um administrador
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * Verifica se um usuário (por email ou ID) é administrador
 */
export function isAdmin(user: { email?: string | null; id?: string }): boolean {
  return isAdminEmail(user.email);
}

/**
 * Lista de IDs de usuários admin (se necessário usar por ID)
 */
export const ADMIN_USER_IDS: string[] = [
  // Adicione IDs aqui se necessário
];

/**
 * Verifica se um ID de usuário é admin
 */
export function isAdminById(userId?: string): boolean {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}
