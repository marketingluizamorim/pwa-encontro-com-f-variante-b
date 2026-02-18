/**
 * Script para popular o banco de dados com perfis de teste V2
 * Cria 20 perfis detalhados (10 SP, 10 Outros estados)
 * Adiciona curtidas, superlikes e mensagens.
 * 
 * Uso:
 * 1. Defina a variável de ambiente: $env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"
 * 2. Execute: npx tsx scripts/populate-test-v2.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida!');
    console.log('\n💡 Para executar este script:');
    console.log('1. Obtenha a Service Role Key no dashboard do Supabase');
    console.log('2. Execute: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key_aqui"');
    console.log('3. Execute: npx tsx scripts/populate-test-v2.ts\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TARGET_USER_EMAIL = 'marketing.luizamorim@gmail.com';

const CHRISTIAN_INTERESTS_POOL = [
    'Bíblia', 'Oração', 'Adoração', 'Família',
    'Comunhão', 'Louvor', 'Santidade', 'Evangelismo',
    'Missões', 'Teatro', 'Instrumental', 'Devocional',
    'Jejum', 'Discipulado', 'Respeito', 'Propósito'
];

const INTERESTS_POOL = ['Tecnologia', 'Música', 'Viagens', 'Leitura', 'Esportes', 'Cinema', 'Culinária', 'Natureza', 'Fotografia', 'Arte'];

const TEST_PROFILES = [
    // --- 10 Perfis de SP ---
    {
        name: 'Gabriel Santos', gender: 'male', birth: '1995-03-15', city: 'São Paulo', state: 'SP',
        occupation: 'Engenheiro de Software', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Apaixonado por Jesus e tecnologia. Busco uma companheira para caminhar na fé.',
        interaction: 'like_message', msg: 'Olá! Adorei seu perfil. Vamos conversar?'
    },
    {
        name: 'Mariana Oliveira', gender: 'female', birth: '1998-07-22', city: 'Campinas', state: 'SP',
        occupation: 'Professora', education: 'Pós-graduação',
        religion: 'Católica', frequency: 'Às vezes', looking: 'Construir uma família',
        bio: 'Amo crianças e ensinar. Procuro alguém temente a Deus.',
        interaction: 'super_like'
    },
    {
        name: 'Lucas Ferreira', gender: 'male', birth: '1992-11-08', city: 'Sorocaba', state: 'SP',
        occupation: 'Médico', education: 'Mestrado/Doutorado',
        religion: 'Protestante', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Dedicado à medicina e ao Reino. Busco alguém especial.',
        interaction: 'like'
    },
    {
        name: 'Ana Costa', gender: 'female', birth: '1996-05-30', city: 'Santos', state: 'SP',
        occupation: 'Designer', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Raramente', looking: 'Conhecer pessoas novas',
        bio: 'Criativa e sonhadora. Amo a praia e a presença de Deus.',
        interaction: 'super_like_message', msg: 'Seu perfil me chamou muito a atenção! 🙏'
    },
    {
        name: 'Pedro Almeida', gender: 'male', birth: '1994-09-12', city: 'Ribeirão Preto', state: 'SP',
        occupation: 'Empresário', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Construir uma família',
        bio: 'Focado em crescer profissionalmente e espiritualmente.',
        interaction: 'like'
    },
    {
        name: 'Júlia Martins', gender: 'female', birth: '2000-01-10', city: 'São José dos Campos', state: 'SP',
        occupation: 'Psicóloga', education: 'Ensino Superior Completo',
        religion: 'Católica', frequency: 'Sim, sou ativo(a)', looking: 'Amizade verdadeira',
        bio: 'Amo ouvir as pessoas e ver a mão de Deus em tudo.',
        interaction: 'super_like'
    },
    {
        name: 'Rafael Souza', gender: 'male', birth: '1991-06-25', city: 'Jundiaí', state: 'SP',
        occupation: 'Arquiteto', education: 'Pós-graduação',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Construindo sonhos sob a rocha que é Cristo.',
        interaction: 'like_message', msg: 'Oi! Como você está? Gostaria de te conhecer melhor.'
    },
    {
        name: 'Camila Rodrigues', gender: 'female', birth: '1997-12-03', city: 'Piracicaba', state: 'SP',
        occupation: 'Enfermeira', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Construir uma família',
        bio: 'Cuidar do próximo é minha missão e meu chamado.',
        interaction: 'like'
    },
    {
        name: 'Thiago Lima', gender: 'male', birth: '1989-04-17', city: 'Bauru', state: 'SP',
        occupation: 'Professor', education: 'Mestrado/Doutorado',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Mente aberta e coração focado no Senhor.',
        interaction: 'super_like'
    },
    {
        name: 'Beatriz Silva', gender: 'female', birth: '1995-08-09', city: 'Franca', state: 'SP',
        occupation: 'Advogada', education: 'Ensino Superior Completo',
        religion: 'Católica', frequency: 'Às vezes', looking: 'Relacionamento sério',
        bio: 'Justiça e fé caminham juntas na minha vida.',
        interaction: 'like_message', msg: 'Achei seus valores muito parecidos com os meus!'
    },

    // --- 10 Perfis de outros estados ---
    {
        name: 'Felipe Barbosa', gender: 'male', birth: '1996-01-28', city: 'Rio de Janeiro', state: 'RJ',
        occupation: 'Músico', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Adorador por excelência. Vamos louvar juntos?',
        interaction: 'like'
    },
    {
        name: 'Larissa Mendes', gender: 'female', birth: '1998-10-14', city: 'Belo Horizonte', state: 'MG',
        occupation: 'Nutricionista', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Amizade verdadeira',
        bio: 'Saúde do corpo e da alma. Busco conexões reais.',
        interaction: 'super_like'
    },
    {
        name: 'Daniel Carvalho', gender: 'male', birth: '1994-07-05', city: 'Curitiba', state: 'PR',
        occupation: 'Contador', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Construir uma família',
        bio: 'Organizado na vida e firme na fé.',
        interaction: 'like_message', msg: 'Olá! Tudo bem? Vi que também gosta de missões.'
    },
    {
        name: 'Isabela Gomes', gender: 'female', birth: '1997-03-21', city: 'Porto Alegre', state: 'RS',
        occupation: 'Jornalista', education: 'Ensino Superior Completo',
        religion: 'Católica', frequency: 'Sim, sou ativo(a)', looking: 'Conhecer pessoas novas',
        bio: 'Comunicando o amor de Deus através das histórias.',
        interaction: 'like'
    },
    {
        name: 'Mateus Pereira', gender: 'male', birth: '1992-09-30', city: 'Florianópolis', state: 'SC',
        occupation: 'Pastor', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Construir uma família',
        bio: 'Dedicado ao ministério e buscando uma auxiliadora idônea.',
        interaction: 'super_like_message', msg: 'Deus te abençoe! Adorei sua bio.'
    },
    {
        name: 'Carolina Neves', gender: 'female', birth: '2001-05-12', city: 'Brasília', state: 'DF',
        occupation: 'Estudante', education: 'Cursando Ensino Superior',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Jovem e temente ao Senhor. Busco alguém com o mesmo propósito.',
        interaction: 'like'
    },
    {
        name: 'André Rocha', gender: 'male', birth: '1988-11-20', city: 'Recife', state: 'PE',
        occupation: 'Analista', education: 'Pós-graduação',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Tranquilo, caseiro e apaixonado por Jesus.',
        interaction: 'like_message', msg: 'Oi! Que perfil lindo o seu.'
    },
    {
        name: 'Fernanda Souza', gender: 'female', birth: '1995-02-28', city: 'Salvador', state: 'BA',
        occupation: 'Artesã', education: 'Ensino Médio',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Construir uma família',
        bio: 'Mãos que criam e coração que adora. Procuro meu par.',
        interaction: 'super_like'
    },
    {
        name: 'Letícia Santos', gender: 'female', birth: '1999-09-05', city: 'Fortaleza', state: 'CE',
        occupation: 'Vendedora', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Relacionamento sério',
        bio: 'Alegre e cheia de fé. Vamos conversar?',
        interaction: 'like'
    },
    {
        name: 'Ricardo Dias', gender: 'male', birth: '1993-01-18', city: 'Manaus', state: 'AM',
        occupation: 'Turismólogo', education: 'Ensino Superior Completo',
        religion: 'Evangélica', frequency: 'Sim, sou ativo(a)', looking: 'Conhecer pessoas novas',
        bio: 'Amo a criação de Deus e busco alguém para explorá-la comigo.',
        interaction: 'super_like_message', msg: 'Você parece ser uma pessoa incrível!'
    }
];

async function main() {
    console.log('\n🚀 INICIANDO POPULAÇÃO DE PERFIS DE TESTE V2\n');

    const { data: { users }, error: authListError } = await supabase.auth.admin.listUsers();
    if (authListError) {
        console.error('❌ Erro ao listar usuários:', authListError.message);
        return;
    }

    const targetUser = users.find(u => u.email === TARGET_USER_EMAIL);
    if (!targetUser) {
        console.error(`❌ Usuário alvo ${TARGET_USER_EMAIL} não encontrado!`);
        return;
    }
    const targetUserId = targetUser.id;

    const userLat = -10.9725;
    const userLon = -37.0476;

    for (let i = 0; i < TEST_PROFILES.length; i++) {
        const p = TEST_PROFILES[i];
        const email = `${p.name.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}.v3.${i}@example.com`;

        console.log(`\n👤 [${i + 1}/20] Processando ${p.name}...`);

        // 1. Verificar se usuário já existe ou criar novo
        let userId: string;
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            userId = existingUser.id;
            console.log(`   ℹ️ Usuário já existe: ${userId}`);
        } else {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password: 'TestPassword123!',
                email_confirm: true,
            });

            if (authError) {
                console.error(`   ❌ Erro Auth: ${authError.message}`);
                continue;
            }
            userId = authData.user.id;
            console.log(`   ✅ Usuário criado: ${userId}`);
        }

        // 2. Profile
        const randomInterests = CHRISTIAN_INTERESTS_POOL.sort(() => 0.5 - Math.random()).slice(0, 4);
        const randomGeneral = INTERESTS_POOL.sort(() => 0.5 - Math.random()).slice(0, 3);

        const avatarId = p.gender === 'male' ? 10 + (i % 30) : 40 + (i % 30);
        const photos = [
            `https://i.pravatar.cc/400?img=${avatarId}`,
            `https://i.pravatar.cc/400?img=${avatarId + 1}`,
            `https://i.pravatar.cc/400?img=${avatarId + 2}`
        ];

        // Definir coordenadas: 10 pertos (Aracaju), 10 longe
        const isNear = i < 10;
        const lat = isNear ? userLat + (Math.random() - 0.5) * 0.2 : userLat + (Math.random() - 0.5) * 10;
        const lon = isNear ? userLon + (Math.random() - 0.5) * 0.2 : userLon + (Math.random() - 0.5) * 10;

        const { error: profileError } = await supabase.from('profiles').upsert({
            user_id: userId,
            display_name: p.name,
            gender: p.gender,
            birth_date: p.birth,
            bio: p.bio,
            city: p.city,
            state: p.state,
            religion: p.religion,
            church_frequency: p.frequency,
            looking_for: p.looking,
            occupation: p.occupation,
            education: p.education,
            christian_interests: randomInterests,
            interests: randomGeneral,
            photos,
            avatar_url: photos[0],
            is_active: true,
            is_profile_complete: true,
            about_children: ['Já sou pai/mãe', 'Desejo ter filhos', 'Talvez no futuro', 'Não pretendo ter'][i % 4],
            values_importance: ['Sim, é essencial', 'Muito importante', 'Não é prioridade', 'Indiferente'][i % 4],
            drink: ['Nunca', 'Socialmente', 'Frequentemente'][i % 3],
            smoke: ['Não', 'Sim', 'Às vezes'][i % 3],
            pets: ['Gosto de animais', 'Tenho gato(s)', 'Tenho cachorro(s)', 'No gosto'][i % 4],
            physical_activity: ['Sedentário', 'Leve (Caminhadas)', 'Moderado (Academia/Esportes)', 'Intenso (Atleta)'][i % 4],
            languages: ['Português', 'Inglês', 'Espanhol'].slice(0, (i % 3) + 1),
            latitude: lat,
            longitude: lon,
            last_active_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }, { onConflict: 'user_id' });

        if (profileError) {
            console.error(`   ❌ Erro Perfil: ${profileError.message}`);
            continue;
        }

        // Limpar swipes anteriores para este par para garantir que apareça no Discover
        await supabase.from('swipes').delete().eq('swiper_id', targetUserId).eq('swiped_id', userId);
        await supabase.from('swipes').delete().eq('swiper_id', userId).eq('swiped_id', targetUserId);
        await supabase.from('matches').delete().or(`and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`);

        // 3. Interaction: Eles curtem VOCÊ (para você vê-los no Discover)
        const direction = p.interaction.includes('super_like') ? 'super_like' : 'like';
        const { error: swipeError } = await supabase.from('swipes').insert({
            swiper_id: userId,
            swiped_id: targetUserId,
            direction
        });

        if (swipeError) {
            console.error(`   ❌ Erro Swipe: ${swipeError.message}`);
        } else {
            console.log(`   💖 ${direction === 'super_like' ? 'Super Like' : 'Curtida'} enviada deste perfil para você!`);
        }
    }

    console.log('\n✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!');
}

main().catch(console.error);
