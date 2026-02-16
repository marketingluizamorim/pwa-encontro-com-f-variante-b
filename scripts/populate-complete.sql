-- ============================================================
-- SCRIPT FINAL: Criar 15 Perfis de Teste
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- PASSO 1: Limpar perfis de teste antigos
DO $$
BEGIN
    DELETE FROM messages WHERE sender_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    );
    
    DELETE FROM matches WHERE user1_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    ) OR user2_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    );
    
    DELETE FROM swipes WHERE swiper_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    ) OR swiped_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    );
    
    DELETE FROM profiles WHERE user_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@example.com'
    );
    
    DELETE FROM auth.users WHERE email LIKE '%@example.com';
    
    RAISE NOTICE '✅ Limpeza concluída!';
END $$;

-- PASSO 2: Criar perfis de teste
DO $$
DECLARE
    target_user_id UUID := '1803e7e5-ba10-4698-827b-d8cc85735fcc';
    new_user_id UUID;
    new_match_id UUID;
    should_match BOOLEAN;
    profiles_data JSON[] := ARRAY[
        '{"email":"gabriel.santos@example.com","name":"Gabriel Santos","gender":"male","age":29,"city":"São Paulo","state":"SP","occupation":"Engenheiro de Software","bio":"Apaixonado por tecnologia e pela palavra de Deus.","img":12}'::JSON,
        '{"email":"mariana.oliveira@example.com","name":"Mariana Oliveira","gender":"female","age":26,"city":"Rio de Janeiro","state":"RJ","occupation":"Professora","bio":"Amo crianças e sonho em ter uma família abençoada.","img":47}'::JSON,
        '{"email":"lucas.ferreira@example.com","name":"Lucas Ferreira","gender":"male","age":32,"city":"Belo Horizonte","state":"MG","occupation":"Médico","bio":"Servo de Cristo. Acredito que Deus tem alguém especial para mim.","img":13}'::JSON,
        '{"email":"ana.costa@example.com","name":"Ana Costa","gender":"female","age":28,"city":"Curitiba","state":"PR","occupation":"Designer Gráfica","bio":"Criativa e apaixonada pela presença de Deus.","img":48}'::JSON,
        '{"email":"pedro.almeida@example.com","name":"Pedro Almeida","gender":"male","age":30,"city":"Porto Alegre","state":"RS","occupation":"Empresário","bio":"Líder de jovens, busco edificar um lar cristão.","img":14}'::JSON,
        '{"email":"julia.martins@example.com","name":"Júlia Martins","gender":"female","age":25,"city":"Brasília","state":"DF","occupation":"Psicóloga","bio":"Serva do Senhor, amo ajudar as pessoas.","img":49}'::JSON,
        '{"email":"rafael.souza@example.com","name":"Rafael Souza","gender":"male","age":31,"city":"Fortaleza","state":"CE","occupation":"Arquiteto","bio":"Apaixonado por criar espaços que glorificam a Deus.","img":15}'::JSON,
        '{"email":"camila.rodrigues@example.com","name":"Camila Rodrigues","gender":"female","age":27,"city":"Salvador","state":"BA","occupation":"Enfermeira","bio":"Coração missionário, busco servir ao próximo.","img":50}'::JSON,
        '{"email":"thiago.lima@example.com","name":"Thiago Lima","gender":"male","age":33,"city":"Recife","state":"PE","occupation":"Professor","bio":"Acredito em relacionamentos fundamentados em Cristo.","img":16}'::JSON,
        '{"email":"beatriz.silva@example.com","name":"Beatriz Silva","gender":"female","age":29,"city":"Manaus","state":"AM","occupation":"Advogada","bio":"Defensora da justiça e da fé.","img":51}'::JSON,
        '{"email":"felipe.barbosa@example.com","name":"Felipe Barbosa","gender":"male","age":28,"city":"Goiânia","state":"GO","occupation":"Músico","bio":"Adorador apaixonado, amo louvar ao Senhor.","img":17}'::JSON,
        '{"email":"larissa.mendes@example.com","name":"Larissa Mendes","gender":"female","age":26,"city":"Belém","state":"PA","occupation":"Nutricionista","bio":"Cuido do corpo como templo do Espírito Santo.","img":52}'::JSON,
        '{"email":"daniel.carvalho@example.com","name":"Daniel Carvalho","gender":"male","age":30,"city":"Campinas","state":"SP","occupation":"Contador","bio":"Homem de oração e da Palavra.","img":18}'::JSON,
        '{"email":"isabela.gomes@example.com","name":"Isabela Gomes","gender":"female","age":27,"city":"Florianópolis","state":"SC","occupation":"Jornalista","bio":"Comunicadora do evangelho.","img":53}'::JSON,
        '{"email":"mateus.pereira@example.com","name":"Mateus Pereira","gender":"male","age":32,"city":"Vitória","state":"ES","occupation":"Pastor","bio":"Coração missionário para impactar vidas.","img":19}'::JSON
    ];
    profile_json JSON;
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    FOREACH profile_json IN ARRAY profiles_data
    LOOP
        -- Criar usuário no Auth (trigger criará perfil vazio automaticamente)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            profile_json->>'email',
            crypt('TestPassword123!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{}'::jsonb,
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO new_user_id;
        
        -- Aguardar um pouco para o trigger criar o perfil
        PERFORM pg_sleep(0.1);
        
        -- Atualizar o perfil criado pelo trigger com dados completos
        UPDATE profiles SET
            display_name = profile_json->>'name',
            gender = profile_json->>'gender',
            birth_date = ((current_year - (profile_json->>'age')::INT) || '-01-15')::DATE,
            bio = profile_json->>'bio',
            city = profile_json->>'city',
            state = profile_json->>'state',
            religion = CASE WHEN random() > 0.5 THEN 'Evangélico' ELSE 'Católico' END,
            church_frequency = CASE WHEN random() > 0.5 THEN 'Semanalmente' ELSE 'Mais de uma vez por semana' END,
            looking_for = CASE 
                WHEN random() > 0.75 THEN 'Relacionamento sério'
                WHEN random() > 0.5 THEN 'Construir uma família'
                WHEN random() > 0.25 THEN 'Conhecer pessoas novas'
                ELSE 'Amizade verdadeira'
            END,
            occupation = profile_json->>'occupation',
            christian_interests = ARRAY['Louvor', 'Estudo Bíblico', 'Missões'],
            photos = ARRAY['https://i.pravatar.cc/400?img=' || (profile_json->>'img')],
            is_active = true,
            is_profile_complete = true,
            latitude = -23.5505 + (random() - 0.5) * 2,
            longitude = -46.6333 + (random() - 0.5) * 2,
            last_active_at = NOW() - (random() * INTERVAL '6 hours')
        WHERE user_id = new_user_id;
        
        -- Criar curtida (80% de chance)
        IF random() > 0.2 THEN
            INSERT INTO swipes (swiper_id, swiped_id, direction)
            VALUES (
                new_user_id,
                target_user_id,
                (CASE WHEN random() > 0.85 THEN 'super_like' ELSE 'like' END)::swipe_direction
            );
            
            -- Criar match (50% de chance)
            should_match := random() > 0.5;
            IF should_match THEN
                INSERT INTO swipes (swiper_id, swiped_id, direction)
                VALUES (target_user_id, new_user_id, 'like'::swipe_direction);
                
                INSERT INTO matches (user1_id, user2_id, is_active)
                VALUES (
                    CASE WHEN target_user_id < new_user_id THEN target_user_id ELSE new_user_id END,
                    CASE WHEN target_user_id < new_user_id THEN new_user_id ELSE target_user_id END,
                    true
                )
                ON CONFLICT (user1_id, user2_id) DO NOTHING
                RETURNING id INTO new_match_id;
                
                -- Se o match já existia, buscar o ID
                IF new_match_id IS NULL THEN
                    SELECT id INTO new_match_id FROM matches
                    WHERE (user1_id = CASE WHEN target_user_id < new_user_id THEN target_user_id ELSE new_user_id END
                       AND user2_id = CASE WHEN target_user_id < new_user_id THEN new_user_id ELSE target_user_id END);
                END IF;
                
                -- Enviar mensagens apenas se temos um match_id
                IF new_match_id IS NOT NULL THEN
                    FOR i IN 1..(1 + floor(random() * 3)::INT) LOOP
                        INSERT INTO messages (match_id, sender_id, content, created_at)
                        VALUES (
                            new_match_id,
                            new_user_id,
                            CASE i
                                WHEN 1 THEN 'Olá! Vi seu perfil e adorei! 😊'
                                WHEN 2 THEN 'Como você está?'
                                WHEN 3 THEN 'Que legal te conhecer!'
                                ELSE 'Vamos conversar mais?'
                            END,
                            NOW() - ((3 - i) * INTERVAL '10 minutes')
                        );
                    END LOOP;
                END IF;
            END IF;
        END IF;
        
        RAISE NOTICE '✅ Perfil criado: %', profile_json->>'name';
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 POPULAÇÃO CONCLUÍDA!';
END $$;

-- PASSO 3: Verificar resultados
SELECT 
    '✅ Perfis criados' as status,
    COUNT(*) as quantidade
FROM profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com')
UNION ALL
SELECT 
    '💖 Curtidas recebidas' as status,
    COUNT(*) as quantidade
FROM swipes 
WHERE swiped_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc'
AND swiper_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com')
UNION ALL
SELECT 
    '🎉 Matches criados' as status,
    COUNT(*) as quantidade
FROM matches 
WHERE (user1_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc' OR user2_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc')
AND (user1_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com')
     OR user2_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com'))
UNION ALL
SELECT 
    '💬 Mensagens enviadas' as status,
    COUNT(*) as quantidade
FROM messages 
WHERE sender_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com');
