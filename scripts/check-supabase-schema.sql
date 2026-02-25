-- Script de diagnostic pour vérifier le schéma Supabase
-- Copiez-collez ce script dans votre Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

-- 1. Vérifier les types de colonnes id dans les tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('todos', 'lists', 'labels', 'user_settings')
    AND column_name LIKE '%id%'
ORDER BY table_name, column_name;

-- 2. Vérifier les contraintes de clés primaires
SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('todos', 'lists', 'labels', 'user_settings')
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- 3. Vérifier les contraintes de clés étrangères
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('todos', 'lists', 'labels', 'user_settings')
ORDER BY tc.table_name;
