/**
 * Script para popular o banco de dados com perfis de teste
 * Uso: npx tsx scripts/populate-test-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcXNmaXh2cGJ0YnFvYWFyY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTM5NzgsImV4cCI6MjA1MjI4OTk3OH0.sPKJKlVjJjmXwXKxLiCNxLpqYjJXzBqzYJQqGGVHFXo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Email do usuário alvo (você)
const TARGET_USER_EMAIL = 'marketing.luizamorim@gmail.com';

// Perfis de teste (15 perfis diversos e realistas)
const TEST_PROFILES = [
    {
        email: 'gabriel.santos.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Gabriel Santos',
            gender: 'Masculino',
            birth_date: '1995-03-15',
            bio: 'Engenheiro de software apaixonado por tecnologia e pela palavra de Deus. Busco alguém para compartilhar a fé e construir um futuro juntos.',
            city: 'São Paulo',
            state: 'SP',
            religion: 'Evangélico',
            church_frequency: 'Semanalmente',
            looking_for: 'Um compromisso sério',
            occupation: 'Engenheiro de Software',
            christian_interests: ['Música Gospel', 'Grupos de Oração', 'Missões'],
            interests: ['Tecnologia', 'Música', 'Viagens'],
            photos: ['https://i.pravatar.cc/400?img=12'],
        }
    },
    {
        email: 'mariana.oliveira.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Mariana Oliveira',
            gender: 'Feminino',
            birth_date: '1998-07-22',
            bio: 'Professora de educação infantil, amo crianças e sonho em ter uma família abençoada. Busco alguém que ame a Deus acima de tudo.',
            city: 'Rio de Janeiro',
            state: 'RJ',
            religion: 'Católica',
            church_frequency: 'Semanalmente',
            looking_for: 'Construir uma família',
            occupation: 'Professora',
            christian_interests: ['Adoração', 'Estudo Bíblico', 'Voluntariado'],
            interests: ['Leitura', 'Crianças', 'Artesanato'],
            photos: ['https://i.pravatar.cc/400?img=47'],
        }
    },
    {
        email: 'lucas.ferreira.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Lucas Ferreira',
            gender: 'Masculino',
            birth_date: '1992-11-08',
            bio: 'Médico dedicado, servo de Cristo. Acredito que Deus tem alguém especial preparado para mim. Vamos caminhar juntos na fé?',
            city: 'Belo Horizonte',
            state: 'MG',
            religion: 'Evangélico',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Um compromisso sério',
            occupation: 'Médico',
            christian_interests: ['Louvor', 'Discipulado', 'Evangelismo'],
            interests: ['Medicina', 'Esportes', 'Leitura'],
            photos: ['https://i.pravatar.cc/400?img=13'],
        }
    },
    {
        email: 'ana.costa.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Ana Costa',
            gender: 'Feminino',
            birth_date: '1996-05-30',
            bio: 'Designer gráfica criativa, apaixonada por arte e pela presença de Deus. Procuro alguém para compartilhar sonhos e construir memórias.',
            city: 'Curitiba',
            state: 'PR',
            religion: 'Evangélica',
            church_frequency: 'Semanalmente',
            looking_for: 'Conhecer pessoas novas',
            occupation: 'Designer Gráfica',
            christian_interests: ['Música Gospel', 'Artes', 'Retiros Espirituais'],
            interests: ['Design', 'Fotografia', 'Café'],
            photos: ['https://i.pravatar.cc/400?img=48'],
        }
    },
    {
        email: 'pedro.almeida.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Pedro Almeida',
            gender: 'Masculino',
            birth_date: '1994-09-12',
            bio: 'Empresário cristão, líder de jovens na igreja. Busco uma mulher de Deus para caminhar ao meu lado e edificar um lar cristão.',
            city: 'Porto Alegre',
            state: 'RS',
            religion: 'Evangélico',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Construir uma família',
            occupation: 'Empresário',
            christian_interests: ['Liderança', 'Grupos de Jovens', 'Missões'],
            interests: ['Negócios', 'Liderança', 'Viagens'],
            photos: ['https://i.pravatar.cc/400?img=14'],
        }
    },
    {
        email: 'julia.martins.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Júlia Martins',
            gender: 'Feminino',
            birth_date: '1999-02-18',
            bio: 'Estudante de psicologia, serva do Senhor. Amo ajudar as pessoas e busco alguém que compartilhe dos mesmos valores cristãos.',
            city: 'Brasília',
            state: 'DF',
            religion: 'Católica',
            church_frequency: 'Semanalmente',
            looking_for: 'Amizade verdadeira',
            occupation: 'Estudante de Psicologia',
            christian_interests: ['Aconselhamento', 'Estudo Bíblico', 'Adoração'],
            interests: ['Psicologia', 'Leitura', 'Caminhadas'],
            photos: ['https://i.pravatar.cc/400?img=49'],
        }
    },
    {
        email: 'rafael.souza.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Rafael Souza',
            gender: 'Masculino',
            birth_date: '1993-06-25',
            bio: 'Arquiteto apaixonado por criar espaços que glorificam a Deus. Procuro uma parceira para construir não só projetos, mas uma vida juntos.',
            city: 'Fortaleza',
            state: 'CE',
            religion: 'Evangélico',
            church_frequency: 'Semanalmente',
            looking_for: 'Um compromisso sério',
            occupation: 'Arquiteto',
            christian_interests: ['Louvor', 'Grupos de Oração', 'Retiros'],
            interests: ['Arquitetura', 'Arte', 'Natureza'],
            photos: ['https://i.pravatar.cc/400?img=15'],
        }
    },
    {
        email: 'camila.rodrigues.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Camila Rodrigues',
            gender: 'Feminino',
            birth_date: '1997-12-03',
            bio: 'Enfermeira dedicada, coração missionário. Busco alguém que ame servir ao próximo tanto quanto eu e que tenha Jesus como prioridade.',
            city: 'Salvador',
            state: 'BA',
            religion: 'Evangélica',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Construir uma família',
            occupation: 'Enfermeira',
            christian_interests: ['Missões', 'Voluntariado', 'Intercessão'],
            interests: ['Saúde', 'Viagens Missionárias', 'Música'],
            photos: ['https://i.pravatar.cc/400?img=50'],
        }
    },
    {
        email: 'thiago.lima.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Thiago Lima',
            gender: 'Masculino',
            birth_date: '1991-04-17',
            bio: 'Professor de educação física, líder de ministério de esportes. Acredito em relacionamentos saudáveis fundamentados em Cristo.',
            city: 'Recife',
            state: 'PE',
            religion: 'Evangélico',
            church_frequency: 'Semanalmente',
            looking_for: 'Conhecer pessoas novas',
            occupation: 'Professor de Educação Física',
            christian_interests: ['Esportes na Igreja', 'Grupos de Jovens', 'Louvor'],
            interests: ['Esportes', 'Fitness', 'Aventura'],
            photos: ['https://i.pravatar.cc/400?img=16'],
        }
    },
    {
        email: 'beatriz.silva.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Beatriz Silva',
            gender: 'Feminino',
            birth_date: '1995-08-09',
            bio: 'Advogada cristã, defensora da justiça e da fé. Procuro um homem temente a Deus para construir um relacionamento sólido e duradouro.',
            city: 'Manaus',
            state: 'AM',
            religion: 'Católica',
            church_frequency: 'Semanalmente',
            looking_for: 'Um compromisso sério',
            occupation: 'Advogada',
            christian_interests: ['Estudo Bíblico', 'Justiça Social', 'Adoração'],
            interests: ['Direito', 'Leitura', 'Debates'],
            photos: ['https://i.pravatar.cc/400?img=51'],
        }
    },
    {
        email: 'felipe.barbosa.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Felipe Barbosa',
            gender: 'Masculino',
            birth_date: '1996-01-28',
            bio: 'Músico gospel, adorador apaixonado. Busco uma mulher que ame louvar ao Senhor e que queira caminhar comigo na presença de Deus.',
            city: 'Goiânia',
            state: 'GO',
            religion: 'Evangélico',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Um compromisso sério',
            occupation: 'Músico',
            christian_interests: ['Louvor e Adoração', 'Música Gospel', 'Ministério de Música'],
            interests: ['Música', 'Violão', 'Composição'],
            photos: ['https://i.pravatar.cc/400?img=17'],
        }
    },
    {
        email: 'larissa.mendes.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Larissa Mendes',
            gender: 'Feminino',
            birth_date: '1998-10-14',
            bio: 'Nutricionista dedicada, cuido do corpo como templo do Espírito Santo. Procuro alguém que valorize saúde física e espiritual.',
            city: 'Belém',
            state: 'PA',
            religion: 'Evangélica',
            church_frequency: 'Semanalmente',
            looking_for: 'Amizade verdadeira',
            occupation: 'Nutricionista',
            christian_interests: ['Saúde Integral', 'Grupos de Mulheres', 'Retiros'],
            interests: ['Nutrição', 'Culinária Saudável', 'Yoga'],
            photos: ['https://i.pravatar.cc/400?img=52'],
        }
    },
    {
        email: 'daniel.carvalho.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Daniel Carvalho',
            gender: 'Masculino',
            birth_date: '1994-07-05',
            bio: 'Contador e diácono da igreja. Homem de oração e da Palavra. Busco uma mulher virtuosa para edificar um lar cristão.',
            city: 'Campinas',
            state: 'SP',
            religion: 'Evangélico',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Construir uma família',
            occupation: 'Contador',
            christian_interests: ['Diaconia', 'Estudo Bíblico', 'Evangelismo'],
            interests: ['Finanças', 'Leitura', 'Caminhadas'],
            photos: ['https://i.pravatar.cc/400?img=18'],
        }
    },
    {
        email: 'isabela.gomes.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Isabela Gomes',
            gender: 'Feminino',
            birth_date: '1997-03-21',
            bio: 'Jornalista cristã, comunicadora do evangelho. Amo escrever e compartilhar histórias de fé. Procuro alguém para escrever nossa história juntos.',
            city: 'Florianópolis',
            state: 'SC',
            religion: 'Católica',
            church_frequency: 'Semanalmente',
            looking_for: 'Conhecer pessoas novas',
            occupation: 'Jornalista',
            christian_interests: ['Comunicação', 'Evangelização', 'Escrita'],
            interests: ['Jornalismo', 'Escrita', 'Fotografia'],
            photos: ['https://i.pravatar.cc/400?img=53'],
        }
    },
    {
        email: 'mateus.pereira.test@example.com',
        password: 'TestPassword123!',
        profile: {
            display_name: 'Mateus Pereira',
            gender: 'Masculino',
            birth_date: '1992-09-30',
            bio: 'Pastor de jovens, coração missionário. Busco uma mulher de Deus para servir ao Senhor juntos e impactar vidas para Cristo.',
            city: 'Vitória',
            state: 'ES',
            religion: 'Evangélico',
            church_frequency: 'Mais de uma vez por semana',
            looking_for: 'Construir uma família',
            occupation: 'Pastor',
            christian_interests: ['Ministério Pastoral', 'Discipulado', 'Missões'],
            interests: ['Teologia', 'Aconselhamento', 'Liderança'],
            photos: ['https://i.pravatar.cc/400?img=19'],
        }
    },
];

async function getTargetUserId(): Promise<string | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === TARGET_USER_EMAIL)?.id || '')
        .single();

    if (error) {
        console.error('❌ Erro ao buscar usuário alvo:', error);
        return null;
    }

    return data?.user_id || null;
}

async function createTestProfile(profileData: typeof TEST_PROFILES[0], targetUserId: string) {
    try {
        console.log(`\n📝 Criando perfil: ${profileData.profile.display_name}...`);

        // 1. Criar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: profileData.email,
            password: profileData.password,
            email_confirm: true,
        });

        if (authError) {
            console.error(`❌ Erro ao criar usuário ${profileData.email}:`, authError.message);
            return;
        }

        const userId = authData.user.id;
        console.log(`✅ Usuário criado: ${userId}`);

        // 2. Criar perfil
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: userId,
                ...profileData.profile,
                is_active: true,
                is_profile_complete: true,
                latitude: -23.5505 + (Math.random() - 0.5) * 0.1, // São Paulo region
                longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
                last_active_at: new Date().toISOString(),
            });

        if (profileError) {
            console.error(`❌ Erro ao criar perfil:`, profileError.message);
            return;
        }

        console.log(`✅ Perfil criado`);

        // 3. Criar swipe (curtida) deste perfil para o usuário alvo
        const shouldLike = Math.random() > 0.3; // 70% de chance de curtir
        if (shouldLike) {
            const { error: swipeError } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: userId,
                    swiped_id: targetUserId,
                    direction: Math.random() > 0.8 ? 'super_like' : 'like', // 20% super like
                });

            if (swipeError) {
                console.error(`❌ Erro ao criar swipe:`, swipeError.message);
            } else {
                console.log(`💖 Curtida enviada para você!`);
            }
        }

        // 4. Alguns perfis já deram match (você também curtiu)
        const shouldMatch = Math.random() > 0.6; // 40% de chance de match
        if (shouldMatch && shouldLike) {
            const { error: matchSwipeError } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: targetUserId,
                    swiped_id: userId,
                    direction: 'like',
                });

            if (!matchSwipeError) {
                // Criar match
                const { data: matchData, error: matchError } = await supabase
                    .from('matches')
                    .insert({
                        user1_id: targetUserId < userId ? targetUserId : userId,
                        user2_id: targetUserId < userId ? userId : targetUserId,
                        is_active: true,
                    })
                    .select()
                    .single();

                if (!matchError && matchData) {
                    console.log(`🎉 Match criado!`);

                    // Enviar algumas mensagens
                    const messages = [
                        'Olá! Vi seu perfil e adorei! 😊',
                        'Como você está?',
                        'Também sou de São Paulo!',
                    ];

                    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
                        await supabase
                            .from('messages')
                            .insert({
                                match_id: matchData.id,
                                sender_id: userId,
                                content: messages[i] || 'Que legal te conhecer!',
                            });
                    }

                    console.log(`💬 Mensagens enviadas`);
                }
            }
        }

        console.log(`✅ Perfil ${profileData.profile.display_name} criado com sucesso!`);

    } catch (error) {
        console.error(`❌ Erro geral ao criar perfil:`, error);
    }
}

async function main() {
    console.log('🚀 Iniciando população do banco de dados...\n');
    console.log(`📧 Usuário alvo: ${TARGET_USER_EMAIL}\n`);

    // Buscar ID do usuário alvo diretamente do auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('❌ Erro ao listar usuários:', usersError.message);
        console.log('\n💡 Tentando abordagem alternativa...\n');

        // Tentar buscar pela tabela profiles usando RPC ou query direta
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id')
            .limit(100);

        if (profilesError) {
            console.error('❌ Erro ao buscar perfis:', profilesError.message);
            return;
        }

        console.log(`📋 Encontrados ${profiles?.length || 0} perfis no banco`);
        console.log('\n⚠️  ATENÇÃO: Não foi possível usar admin API.');
        console.log('💡 Por favor, forneça o USER_ID manualmente.\n');
        console.log('Para obter seu USER_ID:');
        console.log('1. Faça login no app');
        console.log('2. Abra o console do navegador (F12)');
        console.log('3. Execute: localStorage.getItem("sb-cpqsfixvpbtbqoaarcjq-auth-token")');
        console.log('4. Copie o valor do campo "user.id"\n');
        return;
    }

    const targetUser = users.find(u => u.email === TARGET_USER_EMAIL);

    if (!targetUser) {
        console.error(`❌ Usuário ${TARGET_USER_EMAIL} não encontrado!`);
        console.log('\n💡 Usuários disponíveis:');
        users.slice(0, 5).forEach(u => console.log(`   - ${u.email} (${u.id})`));
        console.log(`   ... e mais ${users.length - 5} usuários\n`);
        return;
    }

    const targetUserId = targetUser.id;
    console.log(`✅ Usuário alvo encontrado: ${targetUserId}\n`);
    console.log('='.repeat(60));

    // Criar perfis de teste
    for (const profileData of TEST_PROFILES) {
        await createTestProfile(profileData, targetUserId);
        // Pequeno delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 POPULAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${TEST_PROFILES.length} perfis criados`);
    console.log(`   - ~${Math.floor(TEST_PROFILES.length * 0.7)} curtidas recebidas`);
    console.log(`   - ~${Math.floor(TEST_PROFILES.length * 0.4)} matches criados`);
    console.log(`   - Mensagens enviadas nos matches\n`);
    console.log('✅ Você pode agora testar o aplicativo com perfis realistas!\n');
}

main().catch(console.error);
