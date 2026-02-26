/**
 * Feature flags pour activer/désactiver certaines fonctionnalités
 * 
 * IMPORTANT: Ces flags sont utilisés pour cacher des fonctionnalités non prêtes
 * pour la production. Le code reste présent mais est désactivé dans l'UI.
 */

/**
 * Active les fonctionnalités cloud (Supabase sync, authentification, etc.)
 * 
 * Quand false:
 * - L'option cloud est cachée dans les settings
 * - L'onboarding ne propose pas le cloud
 * - Le mode de stockage est forcé en 'local'
 * - Toutes les UI liées au cloud sont masquées
 * 
 * Quand true:
 * - Toutes les fonctionnalités cloud sont disponibles
 * - L'utilisateur peut choisir entre local et cloud
 */
export const ENABLE_CLOUD_FEATURES = false
