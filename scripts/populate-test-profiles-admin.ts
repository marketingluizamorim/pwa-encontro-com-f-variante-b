/**
 * Script para popular o banco de dados com perfis de teste
 * IMPORTANTE: Este script requer a SERVICE_ROLE_KEY do Supabase
 * 
 * Uso:
 * 1. Defina a variável de ambiente: $env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"
 * 2. Execute: npx tsx scripts/populate-test-profiles-admin.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co';

// A Service Role Key deve ser fornecida como variável de ambiente
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida!');
    console.log('\n💡 Para executar este script:');
    console.log('1. Obtenha a Service Role Key em: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/settings/api');
    console.log('2. Execute: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key_aqui"');
    console.log('3. Execute: npx tsx scripts/populate-test-profiles-admin.ts\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Email do usuário alvo
const TARGET_USER_EMAIL = 'marketing.luizamorim@gmail.com';

// Nomes brasileiros realistas
const FIRST_NAMES_M = ['Gabriel', 'Lucas', 'Pedro', 'Rafael', 'Thiago', 'Felipe', 'Daniel', 'Mateus', 'João', 'André'];
const FIRST_NAMES_F = ['Mariana', 'Ana', 'Júlia', 'Camila', 'Beatriz', 'Larissa', 'Isabela', 'Carolina', 'Fernanda', 'Letícia'];
const LAST_NAMES = ['Santos', 'Oliveira', 'Ferreira', 'Costa', 'Almeida', 'Martins', 'Rodrigues', 'Lima', 'Barbosa', 'Carvalho', 'Mendes', 'Gomes', 'Pereira', 'Silva', 'Souza'];

const CITIES = [
    { city: 'São Paulo', state: 'SP' },
    { city: 'Rio de Janeiro', state: 'RJ' },
    { city: 'Belo Horizonte', state: 'MG' },
    { city: 'Curitiba', state: 'PR' },
    { city: 'Porto Alegre', state: 'RS' },
    { city: 'Brasília', state: 'DF' },
    { city: 'Fortaleza', state: 'CE' },
    { city: 'Salvador', state: 'BA' },
    { city: 'Recife', state: 'PE' },
    { city: 'Manaus', state: 'AM' },
];

const OCCUPATIONS = [
    'Engenheiro de Software', 'Professora', 'Médico', 'Designer Gráfica', 'Empresário',
    'Estudante de Psicologia', 'Arquiteto', 'Enfermeira', 'Professor de Educação Física',
    'Advogada', 'Músico', 'Nutricionista', 'Contador', 'Jornalista', 'Pastor'
];

const BIOS = [
    'Apaixonado por tecnologia e pela palavra de Deus. Busco alguém para compartilhar a fé e construir um futuro juntos.',
    'Amo crianças e sonho em ter uma família abençoada. Busco alguém que ame a Deus acima de tudo.',
    'Servo de Cristo. Acredito que Deus tem alguém especial preparado para mim. Vamos caminhar juntos na fé?',
    'Criativo e apaixonado pela presença de Deus. Procuro alguém para compartilhar sonhos e construir memórias.',
    'Líder de jovens na igreja. Busco uma pessoa de Deus para caminhar ao meu lado e edificar um lar cristão.',
    'Serva do Senhor. Amo ajudar as pessoas e busco alguém que compartilhe dos mesmos valores cristãos.',
    'Apaixonado por criar coisas que glorificam a Deus. Procuro uma parceira para construir uma vida juntos.',
    'Coração missionário. Busco alguém que ame servir ao próximo tanto quanto eu e que tenha Jesus como prioridade.',
    'Acredito em relacionamentos saudáveis fundamentados em Cristo.',
    'Defensora da justiça e da fé. Procuro alguém temente a Deus para construir um relacionamento sólido.',
    'Adorador apaixonado. Busco alguém que ame louvar ao Senhor e que queira caminhar comigo na presença de Deus.',
    'Cuido do corpo como templo do Espírito Santo. Procuro alguém que valorize saúde física e espiritual.',
    'Homem de oração e da Palavra. Busco uma pessoa virtuosa para edificar um lar cristão.',
    'Comunicadora do evangelho. Amo escrever e compartilhar histórias de fé. Procuro alguém para escrever nossa história juntos.',
    'Coração missionário. Busco alguém de Deus para servir ao Senhor juntos e impactar vidas para Cristo.',
];

const CHRISTIAN_INTERESTS = [
    ['Música Gospel', 'Grupos de Oração', 'Missões'],
    ['Adoração', 'Estudo Bíblico', 'Voluntariado'],
    ['Louvor', 'Discipulado', 'Evangelismo'],
    ['Música Gospel', 'Artes', 'Retiros Espirituais'],
    ['Liderança', 'Grupos de Jovens', 'Missões'],
    ['Aconselhamento', 'Estudo Bíblico', 'Adoração'],
    ['Louvor', 'Grupos de Oração', 'Retiros'],
    ['Missões', 'Voluntariado', 'Intercessão'],
    ['Esportes na Igreja', 'Grupos de Jovens', 'Louvor'],
    ['Estudo Bíblico', 'Justiça Social', 'Adoração'],
];

const LOOKING_FOR_OPTIONS = [
    'Relacionamento sério',
    'Construir uma família',
    'Conhecer pessoas novas',
    'Amizade verdadeira',
];

const MESSAGES = [
    'Olá! Vi seu perfil e adorei! 😊',
    'Como você está?',
    'Que legal te conhecer!',
    'Também sou dessa região!',
    'Adorei seus interesses!',
    'Vamos conversar mais?',
    'Que Deus abençoe você!',
    'Feliz em dar match com você! 🙏',
];

function generateProfile(index: number) {
    const isMale = index % 2 === 0;
    const firstName = isMale
        ? FIRST_NAMES_M[index % FIRST_NAMES_M.length]
        : FIRST_NAMES_F[index % FIRST_NAMES_F.length];
    const lastName = LAST_NAMES[index % LAST_NAMES.length];
    const displayName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test${index}@example.com`;

    const location = CITIES[index % CITIES.length];
    const birthYear = 1990 + (index % 10);
    const birthMonth = String(1 + (index % 12)).padStart(2, '0');
    const birthDay = String(1 + (index % 28)).padStart(2, '0');

    const avatarId = isMale ? 10 + (index % 20) : 40 + (index % 20);

    return {
        email,
        password: 'TestPassword123!',
        profile: {
            display_name: displayName,
            gender: isMale ? 'male' : 'female',
            birth_date: `${birthYear}-${birthMonth}-${birthDay}`,
            bio: BIOS[index % BIOS.length],
            city: location.city,
            state: location.state,
            religion: index % 3 === 0 ? 'Católico' : 'Evangélico',
            church_frequency: index % 2 === 0 ? 'Semanalmente' : 'Mais de uma vez por semana',
            looking_for: LOOKING_FOR_OPTIONS[index % LOOKING_FOR_OPTIONS.length],
            occupation: OCCUPATIONS[index % OCCUPATIONS.length],
            christian_interests: CHRISTIAN_INTERESTS[index % CHRISTIAN_INTERESTS.length],
            interests: ['Fé', 'Família', 'Amizade'],
            photos: [`https://i.pravatar.cc/400?img=${avatarId}`],
        }
    };
}

async function createTestProfile(profileData: ReturnType<typeof generateProfile>, targetUserId: string, index: number) {
    try {
        console.log(`\n📝 [${index + 1}/15] Criando: ${profileData.profile.display_name}...`);

        // 1. Criar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: profileData.email,
            password: profileData.password,
            email_confirm: true,
        });

        if (authError) {
            console.error(`   ❌ Erro auth: ${authError.message}`);
            return;
        }

        const userId = authData.user.id;

        // 2. Criar perfil
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: userId,
                ...profileData.profile,
                is_active: true,
                is_profile_complete: true,
                latitude: -23.5505 + (Math.random() - 0.5) * 0.5,
                longitude: -46.6333 + (Math.random() - 0.5) * 0.5,
                last_active_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            });

        if (profileError) {
            console.error(`   ❌ Erro perfil: ${profileError.message}`);
            return;
        }

        // 3. Criar swipe (curtida) deste perfil para o usuário alvo
        const shouldLike = Math.random() > 0.2; // 80% de chance
        if (shouldLike) {
            await supabase.from('swipes').insert({
                swiper_id: userId,
                swiped_id: targetUserId,
                direction: Math.random() > 0.85 ? 'super_like' : 'like',
            });
            console.log(`   💖 Curtida enviada`);
        }

        // 4. Alguns perfis já deram match
        const shouldMatch = Math.random() > 0.5; // 50% de chance
        if (shouldMatch && shouldLike) {
            await supabase.from('swipes').insert({
                swiper_id: targetUserId,
                swiped_id: userId,
                direction: 'like',
            });

            const { data: matchData } = await supabase
                .from('matches')
                .insert({
                    user1_id: targetUserId < userId ? targetUserId : userId,
                    user2_id: targetUserId < userId ? userId : targetUserId,
                    is_active: true,
                })
                .select()
                .single();

            if (matchData) {
                console.log(`   🎉 Match criado`);

                // Enviar mensagens
                const numMessages = Math.floor(Math.random() * 4) + 1;
                for (let i = 0; i < numMessages; i++) {
                    await supabase.from('messages').insert({
                        match_id: matchData.id,
                        sender_id: userId,
                        content: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                        created_at: new Date(Date.now() - (numMessages - i) * 300000).toISOString(),
                    });
                }
                console.log(`   💬 ${numMessages} mensagens enviadas`);
            }
        }

        console.log(`   ✅ Concluído`);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Erro: ${errorMessage}`);
    }
}

async function main() {
    console.log('\n🚀 POPULAÇÃO DO BANCO DE DADOS\n');
    console.log('='.repeat(60));
    console.log(`📧 Usuário alvo: ${TARGET_USER_EMAIL}`);

    // Buscar usuário alvo
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('\n❌ Erro ao acessar API Admin:', error.message);
        console.log('\n💡 Verifique se a SERVICE_ROLE_KEY está correta.\n');
        return;
    }

    const targetUser = users.find(u => u.email === TARGET_USER_EMAIL);

    if (!targetUser) {
        console.error(`\n❌ Usuário ${TARGET_USER_EMAIL} não encontrado!`);
        console.log('\n💡 Usuários disponíveis:');
        users.slice(0, 10).forEach(u => console.log(`   - ${u.email}`));
        if (users.length > 10) console.log(`   ... e mais ${users.length - 10} usuários`);
        console.log();
        return;
    }

    const targetUserId = targetUser.id;
    console.log(`✅ Usuário encontrado: ${targetUserId}`);
    console.log('='.repeat(60));

    // Criar 15 perfis
    for (let i = 0; i < 15; i++) {
        const profileData = generateProfile(i);
        await createTestProfile(profileData, targetUserId, i);
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 POPULAÇÃO CONCLUÍDA!\n');
    console.log('📊 Resumo:');
    console.log('   - 15 perfis criados');
    console.log('   - ~12 curtidas recebidas');
    console.log('   - ~6-8 matches criados');
    console.log('   - Mensagens enviadas nos matches');
    console.log('\n✅ Teste o app agora!\n');
}

main().catch(console.error);
