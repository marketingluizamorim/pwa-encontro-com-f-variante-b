-- ============================================================
-- SCRIPT: Migrar Perfis de Quiz para Estrutura Real (Supabase)
-- Objetivo: Fazer com que os bots Bruna, Amanda, Lucas, etc.
-- funcionem exatamente como os perfis reais.
-- ============================================================

DO $$
DECLARE
    target_user_id UUID := '1803e7e5-ba10-4698-827b-d8cc85735fcc'; -- Patrícia Andrade (Usuário Atual)
    new_user_id UUID;
    new_match_id UUID;
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Dados dos Bots do Quiz (Baseado em profiles.ts)
    profiles_data JSON[] := ARRAY[
        -- Mulheres (para homens ou quem busca mulheres)
        '{"email":"bruna.bot@encontro.com","name":"Bruna","gender":"female","age":24,"city":"São Paulo","state":"SP","occupation":"Professora","bio":"Amo louvar a Deus e estar com a família. Busco um relacionamento com propósito. ❤️","img":"https://images.unsplash.com/photo-1494790108377-be9c29b29330"}'::JSON,
        '{"email":"amanda.bot@encontro.com","name":"Amanda","gender":"female","age":26,"city":"São Paulo","state":"SP","occupation":"Enfermeira","bio":"Apaixonada pela Palavra de Deus e por um bom café ☕.","img":"https://images.unsplash.com/photo-1544005313-94ddf0286df2"}'::JSON,
        '{"email":"carolina.bot@encontro.com","name":"Carolina","gender":"female","age":27,"city":"São Paulo","state":"SP","occupation":"Designer","bio":"Acredito que Deus tem um plano lindo guardado para mim. 🌿","img":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80"}'::JSON,
        '{"email":"juliana.bot@encontro.com","name":"Juliana","gender":"female","age":21,"city":"São Paulo","state":"SP","occupation":"Assistente","bio":"Sou comunicativa, alegre e amo servir ao próximo.","img":"https://images.unsplash.com/photo-1517841905240-472988babdf9"}'::JSON,
        '{"email":"fernanda.bot@encontro.com","name":"Fernanda","gender":"female","age":23,"city":"São Paulo","state":"SP","occupation":"Nutricionista","bio":"Minha fé me move todos os dias. Amo natureza e leitura bíblica. 🌸","img":"https://images.unsplash.com/photo-1534528741775-53994a69daeb"}'::JSON,
        '{"email":"larissa.bot@encontro.com","name":"Larissa","gender":"female","age":20,"city":"São Paulo","state":"SP","occupation":"Contadora","bio":"Filha do Rei, apaixonada por louvor e por pessoas.","img":"https://images.unsplash.com/photo-1524504388940-b1c1722653e1"}'::JSON,
        
        -- Homens (para mulheres ou quem busca homens)
        '{"email":"lucas.bot@encontro.com","name":"Lucas","gender":"male","age":28,"city":"São Paulo","state":"SP","occupation":"Engenheiro","bio":"Homem de fé, família e propósito. Gosto de oração e churrasco. ⚽🙏","img":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}'::JSON,
        '{"email":"gabriel.bot@encontro.com","name":"Gabriel","gender":"male","age":32,"city":"São Paulo","state":"SP","occupation":"Advogado","bio":"Busco algo verdadeiro e duradouro. Minha fé é meu alicerce.","img":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"}'::JSON,
        '{"email":"pedro.bot@encontro.com","name":"Pedro","gender":"male","age":27,"city":"São Paulo","state":"SP","occupation":"Empresário","bio":"Empreendedor, cristão e apaixonado por servir. 🌟","img":"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce"}'::JSON,
        '{"email":"mateus.bot@encontro.com","name":"Mateus","gender":"male","age":30,"city":"São Paulo","state":"SP","occupation":"Professor","bio":"Amo louvor, trilhas na natureza e um bom livro.","img":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"}'::JSON,
        '{"email":"rafael.bot@encontro.com","name":"Rafael","gender":"male","age":29,"city":"São Paulo","state":"SP","occupation":"Médico","bio":"Priorizo família, caráter e comprometimento. 🩺","img":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"}'::JSON,
        '{"email":"thiago.bot@encontro.com","name":"Thiago","gender":"male","age":33,"city":"São Paulo","state":"SP","occupation":"Contador","bio":"Simples, fiel e com o coração aberto para o que Deus tem preparado.","img":"https://images.unsplash.com/photo-1463453091185-61582044d556"}'::JSON
    ];
    profile_json JSON;
BEGIN
    -- 1. Limpar bots antigos se existirem
    DELETE FROM auth.users WHERE email LIKE '%.bot@encontro.com';

    -- 2. Criar cada bot
    FOREACH profile_json IN ARRAY profiles_data
    LOOP
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
            profile_json->>'email', crypt('BotPassword123!', gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb, '{"is_bot": true}'::jsonb, NOW(), NOW()
        ) RETURNING id INTO new_user_id;

        -- Deixar o trigger criar o perfil ou forçar se necessário
        -- Aqui atualizamos com os dados específicos do bots.ts
        UPDATE profiles SET
            display_name = profile_json->>'name',
            gender = profile_json->>'gender',
            birth_date = ((current_year - (profile_json->>'age')::INT) || '-06-15')::DATE,
            bio = profile_json->>'bio',
            city = profile_json->>'city',
            state = profile_json->>'state',
            occupation = profile_json->>'occupation',
            religion = 'Cristã',
            church_frequency = 'Semanalmente',
            looking_for = 'Relacionamento sério',
            photos = ARRAY[profile_json->>'img'],
            is_active = true,
            is_profile_complete = true,
            last_active_at = NOW(),
            is_verified = true
        WHERE user_id = new_user_id;

        -- Criar uma curtida desse bot para a Patrícia (para aparecer na aba Curtidas)
        INSERT INTO swipes (swiper_id, swiped_id, direction)
        VALUES (new_user_id, target_user_id, 'like');

        RAISE NOTICE '✅ Bot criado: %', profile_json->>'name';
    END LOOP;

    RAISE NOTICE '🎉 Todos os bots de Quiz agora estão na base real!';
END $$;
