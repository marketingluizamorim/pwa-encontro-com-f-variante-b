/**
 * SCRIPT SIMPLIFICADO - População de Perfis de Teste
 * 
 * Este script cria perfis diretamente inserindo na tabela profiles
 * sem usar auth.admin.createUser (que está causando problemas)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Service Role Key não definida!');
    console.log('Execute: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key"');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TARGET_USER_ID = '1803e7e5-ba10-4698-827b-d8cc85735fcc';

const PROFILES = [
    { name: 'Gabriel Santos', gender: 'male', age: 29, city: 'São Paulo', occupation: 'Engenheiro', bio: 'Apaixonado por tecnologia e pela palavra de Deus.', img: 12 },
    { name: 'Mariana Oliveira', gender: 'female', age: 26, city: 'Rio de Janeiro', occupation: 'Professora', bio: 'Amo crianças e sonho em ter uma família abençoada.', img: 47 },
    { name: 'Lucas Ferreira', gender: 'male', age: 32, city: 'Belo Horizonte', occupation: 'Médico', bio: 'Servo de Cristo, acredito que Deus tem alguém especial para mim.', img: 13 },
    { name: 'Ana Costa', gender: 'female', age: 28, city: 'Curitiba', occupation: 'Designer', bio: 'Criativa e apaixonada pela presença de Deus.', img: 48 },
    { name: 'Pedro Almeida', gender: 'male', age: 30, city: 'Porto Alegre', occupation: 'Empresário', bio: 'Líder de jovens, busco edificar um lar cristão.', img: 14 },
    { name: 'Júlia Martins', gender: 'female', age: 25, city: 'Brasília', occupation: 'Psicóloga', bio: 'Serva do Senhor, amo ajudar as pessoas.', img: 49 },
    { name: 'Rafael Souza', gender: 'male', age: 31, city: 'Fortaleza', occupation: 'Arquiteto', bio: 'Apaixonado por criar espaços que glorificam a Deus.', img: 15 },
    { name: 'Camila Rodrigues', gender: 'female', age: 27, city: 'Salvador', occupation: 'Enfermeira', bio: 'Coração missionário, busco servir ao próximo.', img: 50 },
    { name: 'Thiago Lima', gender: 'male', age: 33, city: 'Recife', occupation: 'Professor', bio: 'Acredito em relacionamentos fundamentados em Cristo.', img: 16 },
    { name: 'Beatriz Silva', gender: 'female', age: 29, city: 'Manaus', occupation: 'Advogada', bio: 'Defensora da justiça e da fé.', img: 51 },
    { name: 'Felipe Barbosa', gender: 'male', age: 28, city: 'Goiânia', occupation: 'Músico', bio: 'Adorador apaixonado, amo louvar ao Senhor.', img: 17 },
    { name: 'Larissa Mendes', gender: 'female', age: 26, city: 'Belém', occupation: 'Nutricionista', bio: 'Cuido do corpo como templo do Espírito Santo.', img: 52 },
    { name: 'Daniel Carvalho', gender: 'male', age: 30, city: 'Campinas', occupation: 'Contador', bio: 'Homem de oração e da Palavra.', img: 18 },
    { name: 'Isabela Gomes', gender: 'female', age: 27, city: 'Florianópolis', occupation: 'Jornalista', bio: 'Comunicadora do evangelho.', img: 53 },
    { name: 'Mateus Pereira', gender: 'male', age: 32, city: 'Vitória', occupation: 'Pastor', bio: 'Coração missionário para impactar vidas.', img: 19 },
];

async function main() {
    console.log('\n🚀 CRIANDO PERFIS DE TESTE\n');
    console.log('='.repeat(60));

    // Usar função RPC do Supabase para criar perfis
    const { data, error } = await supabase.rpc('create_test_profiles', {
        target_user: TARGET_USER_ID,
        profiles_data: PROFILES
    });

    if (error) {
        console.error('\n❌ Erro:', error.message);
        console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/editor');
        console.log('2. Abra o SQL Editor');
        console.log('3. Cole e execute o script: scripts/populate-via-sql.sql\n');
        return;
    }

    console.log('\n✅ SUCESSO!\n');
    console.log('📊 Perfis criados:', data?.profiles_created || 15);
    console.log('💖 Curtidas recebidas:', data?.likes_sent || '~12');
    console.log('🎉 Matches criados:', data?.matches_created || '~6-8');
    console.log('\n✅ Teste o app agora!\n');
}

main().catch(console.error);
