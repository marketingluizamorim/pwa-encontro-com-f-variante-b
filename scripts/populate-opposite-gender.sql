-- ============================================================
-- SCRIPT: Criar 15 Perfis do Sexo Oposto
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

-- PASSO 2: Criar perfis do sexo oposto
DO $$
DECLARE
    target_user_id UUID := '1803e7e5-ba10-4698-827b-d8cc85735fcc';
    target_gender TEXT;
    opposite_gender TEXT;
    new_user_id UUID;
    new_match_id UUID;
    should_match BOOLEAN;
    -- Perfis FEMININOS
    female_profiles JSON[] := ARRAY[
        '{"email":"mariana.oliveira@example.com","name":"Mariana Oliveira","age":26,"city":"Rio de Janeiro","state":"RJ","occupation":"Professora","bio":"Amo crianças e sonho em ter uma família abençoada.","img":47}'::JSON,
        '{"email":"ana.costa@example.com","name":"Ana Costa","age":28,"city":"Curitiba","state":"PR","occupation":"Designer Gráfica","bio":"Criativa e apaixonada pela presença de Deus.","img":48}'::JSON,
        '{"email":"julia.martins@example.com","name":"Júlia Martins","age":25,"city":"Brasília","state":"DF","occupation":"Psicóloga","bio":"Serva do Senhor, amo ajudar as pessoas.","img":49}'::JSON,
        '{"email":"camila.rodrigues@example.com","name":"Camila Rodrigues","age":27,"city":"Salvador","state":"BA","occupation":"Enfermeira","bio":"Coração missionário, busco servir ao próximo.","img":50}'::JSON,
        '{"email":"beatriz.silva@example.com","name":"Beatriz Silva","age":29,"city":"Manaus","state":"AM","occupation":"Advogada","bio":"Defensora da justiça e da fé.","img":51}'::JSON,
        '{"email":"larissa.mendes@example.com","name":"Larissa Mendes","age":26,"city":"Belém","state":"PA","occupation":"Nutricionista","bio":"Cuido do corpo como templo do Espírito Santo.","img":52}'::JSON,
        '{"email":"isabela.gomes@example.com","name":"Isabela Gomes","age":27,"city":"Florianópolis","state":"SC","occupation":"Jornalista","bio":"Comunicadora do evangelho.","img":53}'::JSON,
        '{"email":"fernanda.santos@example.com","name":"Fernanda Santos","age":24,"city":"São Paulo","state":"SP","occupation":"Enfermeira","bio":"Dedico minha vida a cuidar das pessoas.","img":44}'::JSON,
        '{"email":"carolina.lima@example.com","name":"Carolina Lima","age":30,"city":"Porto Alegre","state":"RS","occupation":"Arquiteta","bio":"Construindo sonhos com fé.","img":45}'::JSON,
        '{"email":"leticia.alves@example.com","name":"Letícia Alves","age":23,"city":"Fortaleza","state":"CE","occupation":"Professora","bio":"Ensinar é minha missão de vida.","img":46}'::JSON,
        '{"email":"patricia.souza@example.com","name":"Patrícia Souza","age":31,"city":"Recife","state":"PE","occupation":"Médica","bio":"Servindo a Deus através da medicina.","img":54}'::JSON,
        '{"email":"amanda.costa@example.com","name":"Amanda Costa","age":25,"city":"Goiânia","state":"GO","occupation":"Psicóloga","bio":"Ajudando pessoas a encontrarem paz.","img":55}'::JSON,
        '{"email":"jessica.martins@example.com","name":"Jéssica Martins","age":28,"city":"Campinas","state":"SP","occupation":"Empresária","bio":"Fé e trabalho andam juntos.","img":56}'::JSON,
        '{"email":"renata.pereira@example.com","name":"Renata Pereira","age":27,"city":"Vitória","state":"ES","occupation":"Designer","bio":"Criando beleza para glorificar a Deus.","img":57}'::JSON,
        '{"email":"vanessa.rodrigues@example.com","name":"Vanessa Rodrigues","age":29,"city":"Belo Horizonte","state":"MG","occupation":"Advogada","bio":"Lutando pela justiça com fé.","img":58}'::JSON
    ];
    -- Perfis MASCULINOS
    male_profiles JSON[] := ARRAY[
        '{"email":"gabriel.santos@example.com","name":"Gabriel Santos","age":29,"city":"São Paulo","state":"SP","occupation":"Engenheiro de Software","bio":"Apaixonado por tecnologia e pela palavra de Deus.","img":12}'::JSON,
        '{"email":"lucas.ferreira@example.com","name":"Lucas Ferreira","age":32,"city":"Belo Horizonte","state":"MG","occupation":"Médico","bio":"Servo de Cristo. Acredito que Deus tem alguém especial para mim.","img":13}'::JSON,
        '{"email":"pedro.almeida@example.com","name":"Pedro Almeida","age":30,"city":"Porto Alegre","state":"RS","occupation":"Empresário","bio":"Líder de jovens, busco edificar um lar cristão.","img":14}'::JSON,
        '{"email":"rafael.souza@example.com","name":"Rafael Souza","age":31,"city":"Fortaleza","state":"CE","occupation":"Arquiteto","bio":"Apaixonado por criar espaços que glorificam a Deus.","img":15}'::JSON,
        '{"email":"thiago.lima@example.com","name":"Thiago Lima","age":33,"city":"Recife","state":"PE","occupation":"Professor","bio":"Acredito em relacionamentos fundamentados em Cristo.","img":16}'::JSON,
        '{"email":"felipe.barbosa@example.com","name":"Felipe Barbosa","age":28,"city":"Goiânia","state":"GO","occupation":"Músico","bio":"Adorador apaixonado, amo louvar ao Senhor.","img":17}'::JSON,
        '{"email":"daniel.carvalho@example.com","name":"Daniel Carvalho","age":30,"city":"Campinas","state":"SP","occupation":"Contador","bio":"Homem de oração e da Palavra.","img":18}'::JSON,
        '{"email":"mateus.pereira@example.com","name":"Mateus Pereira","age":32,"city":"Vitória","state":"ES","occupation":"Pastor","bio":"Coração missionário para impactar vidas.","img":19}'::JSON,
        '{"email":"andre.costa@example.com","name":"André Costa","age":27,"city":"Rio de Janeiro","state":"RJ","occupation":"Engenheiro","bio":"Construindo o futuro com fé.","img":11}'::JSON,
        '{"email":"bruno.silva@example.com","name":"Bruno Silva","age":29,"city":"Curitiba","state":"PR","occupation":"Advogado","bio":"Defendendo a justiça com princípios cristãos.","img":20}'::JSON,
        '{"email":"carlos.mendes@example.com","name":"Carlos Mendes","age":31,"city":"Brasília","state":"DF","occupation":"Médico","bio":"Curando corpos e almas.","img":21}'::JSON,
        '{"email":"diego.oliveira@example.com","name":"Diego Oliveira","age":26,"city":"Salvador","state":"BA","occupation":"Professor","bio":"Educando com amor e fé.","img":22}'::JSON,
        '{"email":"eduardo.santos@example.com","name":"Eduardo Santos","age":28,"city":"Manaus","state":"AM","occupation":"Empresário","bio":"Negócios com propósito divino.","img":23}'::JSON,
        '{"email":"fernando.lima@example.com","name":"Fernando Lima","age":30,"city":"Belém","state":"PA","occupation":"Arquiteto","bio":"Desenhando o futuro com Deus.","img":24}'::JSON,
        '{"email":"gustavo.alves@example.com","name":"Gustavo Alves","age":25,"city":"Florianópolis","state":"SC","occupation":"Designer","bio":"Criando com inspiração divina.","img":25}'::JSON
    ];
    profiles_to_use JSON[];
    profile_json JSON;
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    -- Buscar o gênero do usuário alvo
    SELECT gender INTO target_gender FROM profiles WHERE user_id = target_user_id;
    
    -- Determinar o gênero oposto e os perfis a usar
    IF target_gender = 'male' THEN
        opposite_gender := 'female';
        profiles_to_use := female_profiles;
        RAISE NOTICE '👤 Seu gênero: Masculino → Criando perfis FEMININOS';
    ELSIF target_gender = 'female' THEN
        opposite_gender := 'male';
        profiles_to_use := male_profiles;
        RAISE NOTICE '👤 Seu gênero: Feminino → Criando perfis MASCULINOS';
    ELSE
        RAISE EXCEPTION 'Gênero do usuário não encontrado ou inválido';
    END IF;
    
    RAISE NOTICE '';
    
    -- Criar perfis do sexo oposto
    FOREACH profile_json IN ARRAY profiles_to_use
    LOOP
        -- Criar usuário no Auth
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
        
        -- Aguardar trigger criar perfil
        PERFORM pg_sleep(0.1);
        
        -- Atualizar perfil com dados completos
        UPDATE profiles SET
            display_name = profile_json->>'name',
            gender = opposite_gender,
            birth_date = ((current_year - (profile_json->>'age')::INT) || '-01-15')::DATE,
            bio = profile_json->>'bio',
            city = profile_json->>'city',
            state = profile_json->>'state',
            religion = CASE WHEN random() > 0.5 THEN 'Evangélico' ELSE 'Católico' END,
            church_frequency = CASE WHEN random() > 0.5 THEN 'Semanalmente' ELSE 'Mais de uma vez por semana' END,
            looking_for = CASE 
                WHEN random() > 0.75 THEN 'Um compromisso sério'
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
                
                -- Enviar mensagens
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
