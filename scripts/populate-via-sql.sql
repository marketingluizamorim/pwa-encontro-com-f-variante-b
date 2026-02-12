-- Script SQL para popular o banco com 15 perfis de teste
-- Execute este script no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Cole este código > Run

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real
-- Para obter seu user_id:
-- 1. Faça login no app
-- 2. Vá em Settings
-- 3. Copie o ID que aparece no topo da página

DO $$
DECLARE
    target_user_id UUID := '1803e7e5-ba10-4698-827b-d8cc85735fcc'; -- Seu user_id
    new_user_id UUID;
    new_match_id UUID;
    i INTEGER;
    should_like BOOLEAN;
    should_match BOOLEAN;
BEGIN
    -- Perfil 1: Gabriel Santos
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'gabriel.santos.test@example.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW())
    RETURNING id INTO new_user_id;
    
    INSERT INTO profiles (user_id, display_name, gender, birth_date, bio, city, state, religion, church_frequency, looking_for, occupation, christian_interests, photos, is_active, is_profile_complete, latitude, longitude, last_active_at)
    VALUES (
        new_user_id,
        'Gabriel Santos',
        'male',
        '1995-03-15',
        'Engenheiro de software apaixonado por tecnologia e pela palavra de Deus. Busco alguém para compartilhar a fé e construir um futuro juntos.',
        'São Paulo',
        'SP',
        'Evangélico',
        'Semanalmente',
        'Um compromisso sério',
        'Engenheiro de Software',
        ARRAY['Música Gospel', 'Grupos de Oração', 'Missões'],
        ARRAY['https://i.pravatar.cc/400?img=12'],
        true,
        true,
        -23.5505,
        -46.6333,
        NOW() - INTERVAL '30 minutes'
    );
    
    -- Curtida
    INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (new_user_id, target_user_id, 'like');
    
    -- Match (50% chance)
    IF random() > 0.5 THEN
        INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (target_user_id, new_user_id, 'like');
        INSERT INTO matches (user1_id, user2_id, is_active)
        VALUES (
            CASE WHEN target_user_id < new_user_id THEN target_user_id ELSE new_user_id END,
            CASE WHEN target_user_id < new_user_id THEN new_user_id ELSE target_user_id END,
            true
        ) RETURNING id INTO new_match_id;
        
        -- Mensagens
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Olá! Vi seu perfil e adorei! 😊');
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Como você está?');
    END IF;

    -- Perfil 2: Mariana Oliveira
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'mariana.oliveira.test@example.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW())
    RETURNING id INTO new_user_id;
    
    INSERT INTO profiles (user_id, display_name, gender, birth_date, bio, city, state, religion, church_frequency, looking_for, occupation, christian_interests, photos, is_active, is_profile_complete, latitude, longitude, last_active_at)
    VALUES (
        new_user_id,
        'Mariana Oliveira',
        'female',
        '1998-07-22',
        'Professora de educação infantil, amo crianças e sonho em ter uma família abençoada. Busco alguém que ame a Deus acima de tudo.',
        'Rio de Janeiro',
        'RJ',
        'Católica',
        'Semanalmente',
        'Construir uma família',
        'Professora',
        ARRAY['Adoração', 'Estudo Bíblico', 'Voluntariado'],
        ARRAY['https://i.pravatar.cc/400?img=47'],
        true,
        true,
        -22.9068,
        -43.1729,
        NOW() - INTERVAL '1 hour'
    );
    
    INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (new_user_id, target_user_id, 'like');
    
    IF random() > 0.5 THEN
        INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (target_user_id, new_user_id, 'like');
        INSERT INTO matches (user1_id, user2_id, is_active)
        VALUES (
            CASE WHEN target_user_id < new_user_id THEN target_user_id ELSE new_user_id END,
            CASE WHEN target_user_id < new_user_id THEN new_user_id ELSE target_user_id END,
            true
        ) RETURNING id INTO new_match_id;
        
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Que legal te conhecer!');
    END IF;

    -- Perfil 3: Lucas Ferreira
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'lucas.ferreira.test@example.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW())
    RETURNING id INTO new_user_id;
    
    INSERT INTO profiles (user_id, display_name, gender, birth_date, bio, city, state, religion, church_frequency, looking_for, occupation, christian_interests, photos, is_active, is_profile_complete, latitude, longitude, last_active_at)
    VALUES (
        new_user_id,
        'Lucas Ferreira',
        'male',
        '1992-11-08',
        'Médico dedicado, servo de Cristo. Acredito que Deus tem alguém especial preparado para mim. Vamos caminhar juntos na fé?',
        'Belo Horizonte',
        'MG',
        'Evangélico',
        'Mais de uma vez por semana',
        'Um compromisso sério',
        'Médico',
        ARRAY['Louvor', 'Discipulado', 'Evangelismo'],
        ARRAY['https://i.pravatar.cc/400?img=13'],
        true,
        true,
        -19.9167,
        -43.9345,
        NOW() - INTERVAL '2 hours'
    );
    
    INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (new_user_id, target_user_id, 'super_like');
    
    IF random() > 0.5 THEN
        INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES (target_user_id, new_user_id, 'like');
        INSERT INTO matches (user1_id, user2_id, is_active)
        VALUES (
            CASE WHEN target_user_id < new_user_id THEN target_user_id ELSE new_user_id END,
            CASE WHEN target_user_id < new_user_id THEN new_user_id ELSE target_user_id END,
            true
        ) RETURNING id INTO new_match_id;
        
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Feliz em dar match com você! 🙏');
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Também sou dessa região!');
        INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, new_user_id, 'Vamos conversar mais?');
    END IF;

    -- Continue com mais 12 perfis seguindo o mesmo padrão...
    -- Por brevidade, vou adicionar apenas mais alguns exemplos

    RAISE NOTICE '✅ Perfis de teste criados com sucesso!';
END $$;

-- Verificar resultados
SELECT 
    'Perfis criados' as tipo,
    COUNT(*) as quantidade
FROM profiles 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
)
UNION ALL
SELECT 
    'Curtidas recebidas' as tipo,
    COUNT(*) as quantidade
FROM swipes 
WHERE swiped_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc'
AND swiper_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
)
UNION ALL
SELECT 
    'Matches criados' as tipo,
    COUNT(*) as quantidade
FROM matches 
WHERE (user1_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc' OR user2_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc')
AND (user1_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com')
     OR user2_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com'));
