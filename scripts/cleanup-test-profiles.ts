/**
 * Script para limpar perfis de teste do banco de dados
 * Uso: npx tsx scripts/cleanup-test-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('\n🗑️  LIMPEZA DE PERFIS DE TESTE\n');
    console.log('='.repeat(60));

    // 1. Buscar todos os usuários de teste
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const testUsers = users.filter(u => u.email?.includes('@example.com'));

    console.log(`📋 Encontrados ${testUsers.length} perfis de teste`);

    if (testUsers.length === 0) {
        console.log('\n✅ Nenhum perfil de teste para limpar!\n');
        return;
    }

    const testUserIds = testUsers.map(u => u.id);

    // 2. Deletar mensagens
    console.log('\n🗑️  Deletando mensagens...');
    const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('sender_id', testUserIds);

    if (messagesError) {
        console.error('❌ Erro ao deletar mensagens:', messagesError.message);
    } else {
        console.log('✅ Mensagens deletadas');
    }

    // 3. Deletar matches
    console.log('🗑️  Deletando matches...');
    const { error: matchesError1 } = await supabase
        .from('matches')
        .delete()
        .in('user1_id', testUserIds);

    const { error: matchesError2 } = await supabase
        .from('matches')
        .delete()
        .in('user2_id', testUserIds);

    if (matchesError1 || matchesError2) {
        console.error('❌ Erro ao deletar matches');
    } else {
        console.log('✅ Matches deletados');
    }

    // 4. Deletar swipes
    console.log('🗑️  Deletando swipes...');
    const { error: swipesError1 } = await supabase
        .from('swipes')
        .delete()
        .in('swiper_id', testUserIds);

    const { error: swipesError2 } = await supabase
        .from('swipes')
        .delete()
        .in('swiped_id', testUserIds);

    if (swipesError1 || swipesError2) {
        console.error('❌ Erro ao deletar swipes');
    } else {
        console.log('✅ Swipes deletados');
    }

    // 5. Deletar perfis
    console.log('🗑️  Deletando perfis...');
    const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('user_id', testUserIds);

    if (profilesError) {
        console.error('❌ Erro ao deletar perfis:', profilesError.message);
    } else {
        console.log('✅ Perfis deletados');
    }

    // 6. Deletar usuários do Auth
    console.log('🗑️  Deletando usuários do Auth...');
    for (const user of testUsers) {
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) {
            console.error(`❌ Erro ao deletar ${user.email}:`, error.message);
        }
    }
    console.log('✅ Usuários deletados');

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 LIMPEZA CONCLUÍDA!\n');
    console.log(`✅ ${testUsers.length} perfis de teste removidos\n`);
}

main().catch(console.error);
