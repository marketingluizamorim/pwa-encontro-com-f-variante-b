import { QuizAnswers } from "@/types/funnel";

const getFemalePhotosByAge = (age: string | undefined): string[] => {
    const range = age === '18-25' ? '18-25' : age === '26-35' ? '26-35' : age === '36-55' ? '36-55' : age === '56+' ? '56-plus' : '26-35';
    return [
        `/assets/matches/match-female-${range}-display.jpg`,
        `/assets/matches/match-female-${range}-1.jpg`,
        `/assets/matches/match-female-${range}-2.jpg`,
        `/assets/matches/match-female-${range}-3.jpg`,
        `/assets/matches/match-female-${range}-4.jpg`,
        `/assets/matches/match-female-${range}-5.jpg`,
        `/assets/matches/match-female-${range}-6.jpg`,
        `/assets/matches/match-female-${range}-7.jpg`,
        `/assets/matches/match-female-${range}-8.jpg`,
    ];
};

const getMalePhotosByAge = (age: string | undefined): string[] => {
    const range = age === '18-25' ? '18-25' : age === '26-35' ? '26-35' : age === '36-55' ? '36-55' : age === '56+' ? '56-plus' : '26-35';
    return [
        `/assets/matches/match-male-${range}-display.jpg`,
        `/assets/matches/match-male-${range}-1.jpg`,
        `/assets/matches/match-male-${range}-2.jpg`,
        `/assets/matches/match-male-${range}-3.jpg`,
        `/assets/matches/match-male-${range}-4.jpg`,
        `/assets/matches/match-male-${range}-5.jpg`,
        `/assets/matches/match-male-${range}-6.jpg`,
        `/assets/matches/match-male-${range}-7.jpg`,
        `/assets/matches/match-male-${range}-8.jpg`,
    ];
};

const SHORT_INTEREST_MAP: Record<string, string> = {
    'Relacionamento sério': 'NAMORO',
    'Construir uma família': 'CASAR',
    'Conhecer pessoas novas': 'AMIZADE',
    'Amizade verdadeira': 'AMIZADE',
    'Já sou pai/mãe': 'COM FILHOS',
    'Desejo ter filhos': 'QUER FILHOS',
    'Talvez no futuro': 'TALVEZ',
    'Não pretendo ter': 'SEM FILHOS',
};

const generateMatchingInterests = (quizAnswers: QuizAnswers, _profileIndex: number): string[] => {
    const interests: string[] = [];
    if (quizAnswers.religion) interests.push(quizAnswers.religion.toUpperCase());
    if (quizAnswers.lookingFor) {
        interests.push(SHORT_INTEREST_MAP[quizAnswers.lookingFor] || quizAnswers.lookingFor.toUpperCase());
    }
    if (interests.length < 3) {
        const fallback = quizAnswers.religion === 'Evangélica'
            ? ['LOUVOR', 'CÉLULA', 'BÍBLIA']
            : ['FAMÍLIA', 'ORAÇÃO', 'FÉ', 'JESUS'];
        interests.push(fallback[_profileIndex % fallback.length]);
    }
    return Array.from(new Set(interests)).slice(0, 2);
};

export const getStateAbbreviation = (state: string | undefined): string => {
    if (!state) return 'SP';
    const abbreviations: Record<string, string> = {
        'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
        'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
        'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
        'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
    };
    return abbreviations[state] || 'SP';
};

const getAgesForRange = (ageRange: string | undefined): number[] => {
    switch (ageRange) {
        case '18-25': return [19, 22, 24, 21, 23, 20, 25, 18, 22];
        case '26-35': return [28, 32, 27, 30, 29, 33, 31, 26, 34];
        case '36-55': return [38, 45, 42, 48, 40, 52, 55, 36, 47];
        case '56+': return [58, 62, 60, 65, 59, 63, 61, 57, 64];
        default: return [28, 32, 27, 30, 29, 33, 31, 26, 34];
    }
};

export const FEMALE_EXTRA = [
    {
        name: 'Bruna',
        bio: 'Amo louvar a Deus e estar com a família. Busco um relacionamento com propósito, construído na fé e no amor verdadeiro. ❤️',
        occupation: 'Professora',
        religion: 'Evangélica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Bíblia', 'Oração', 'Família'],
        state: 'São Paulo',
        city: 'São Paulo'
    },
    {
        name: 'Amanda',
        bio: 'Apaixonada pela Palavra de Deus e por um bom café ☕. Valorizo honestidade e propósito em um relacionamento.',
        occupation: 'Enfermeira',
        religion: 'Evangélica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Tenho gato(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Louvor', 'Fé', 'Comunhão'],
        state: 'Rio de Janeiro',
        city: 'Rio de Janeiro'
    },
    {
        name: 'Carolina',
        bio: 'Acredito que Deus tem um plano lindo guardado para mim. Adoro viagens, música gospel e momentos em família. 🌿',
        occupation: 'Designer',
        religion: 'Católica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero mais',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Às vezes',
        pets: 'Não tenho pets',
        languages: ['Português', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Adoração', 'Grupo de Jovens', 'viagens'],
        state: 'Minas Gerais',
        city: 'Belo Horizonte'
    },
    {
        name: 'Juliana',
        bio: 'Sou comunicativa, alegre e amo servir ao próximo. Busco alguém que ame a Deus acima de tudo.',
        occupation: 'Assistente Administrativa',
        religion: 'Evangélica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Teatro', 'Música', 'Dança'],
        state: 'Paraná',
        city: 'Curitiba'
    },
    {
        name: 'Fernanda',
        bio: 'Minha fé me move todos os dias. Amo natureza, leitura bíblica e cozinhar para as pessoas que amo. 🌸',
        occupation: 'Nutricionista',
        religion: 'Protestante',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Pos-graduação',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Tenho cachorro(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Cozinha', 'Serviço', 'Comunhão'],
        state: 'Santa Catarina',
        city: 'Florianópolis'
    },
    {
        name: 'Larissa',
        bio: 'Filha do Rei, apaixonada por louvor e por pessoas. Quero construir algo sólido com quem comparte os mesmos valores.',
        occupation: 'Contadora',
        religion: 'Evangélica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Não tenho pets',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Justiça', 'Verdade', 'Integridade'],
        state: 'Goiás',
        city: 'Goiânia'
    },
    {
        name: 'Rebeca',
        bio: 'Amo a simplicidade e a alegria de viver com Deus. Procuro alguém para dividir sonhos e propósito.',
        occupation: 'Psicóloga',
        religion: 'Católica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho gato(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Modéstia', 'Beleza', 'Criação'],
        state: 'Distrito Federal',
        city: 'Brasília'
    },
    {
        name: 'Talita',
        bio: 'Sorridente e cheia de fé. Acredito que o amor verdadeiro é um presente de Deus que devemos cultivar.',
        occupation: 'Advogada',
        religion: 'Evangélica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Ainda não decidi',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Não tenho pets',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Escrita', 'Comunicação', 'Evangelismo'],
        state: 'Bahia',
        city: 'Salvador'
    },
    {
        name: 'Letícia',
        bio: 'Aventureira e dedicada à obra de Deus. Gosto de viagens missionárias e de estar em contato com a criação.',
        occupation: 'Veterinária',
        religion: 'Protestante',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Cuidado', 'Amor', 'Auxílio'],
        state: 'Rio Grande do Sul',
        city: 'Porto Alegre'
    },
];

export const MALE_EXTRA = [
    {
        name: 'Lucas',
        bio: 'Homem de fé, família e propósito. Gosto de momentos simples: oração, churrasco e um futebol com amigos. ⚽🙏',
        occupation: 'Engenheiro Civil',
        religion: 'Evangélica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Bíblia', 'Oração', 'Churrasco', 'Família'],
        state: 'São Paulo',
        city: 'São Paulo'
    },
    {
        name: 'Gabriel',
        bio: 'Busco algo verdadeiro e duradouro. Minha fé é meu alicerce e valorizo honestidade acima de tudo.',
        occupation: 'Médico Veterinário',
        religion: 'Católica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Comunhão', 'Louvor', 'Santidade', 'Evangelismo'],
        state: 'Rio de Janeiro',
        city: 'Rio de Janeiro'
    },
    {
        name: 'Pedro',
        bio: 'Empreendedor, cristão e apaixonado por servir. Acredito que o amor começa na amizade e respeito mútuo. 🌟',
        occupation: 'Advogado',
        religion: 'Católica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero mais',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Tenho gato(s)',
        languages: ['Português', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Missões', 'Teatro', 'Instrumental', 'Devocional'],
        state: 'Minas Gerais',
        city: 'Belo Horizonte'
    },
    {
        name: 'Mateus',
        bio: 'Amo louvor, trilhas na natureza e um bom livro. Quero alguém com quem crescer na fé e na vida.',
        occupation: 'Desenvolvedor de Software',
        religion: 'Evangélica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho gato(s)',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Jejum', 'Discipulado', 'Respeito', 'Propósito'],
        state: 'Paraná',
        city: 'Curitiba'
    },
    {
        name: 'Rafael',
        bio: 'Médico nas horas de trabalho, adorador nas horas livres. Priorizo família, caráter e comprometimento.',
        occupation: 'Arquiteto',
        religion: 'Católica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero mais',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Às vezes',
        pets: 'Tenho cachorro(s)',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Leitura', 'Estudos', 'Pregações', 'Podcasts'],
        state: 'Santa Catarina',
        city: 'Florianópolis'
    },
    {
        name: 'Thiago',
        bio: 'Simples, fiel e com o coração aberto para o que Deus tem preparado. Adoro comunidade e momentos em família.',
        occupation: 'Administrador',
        religion: 'Evangélica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Não tenho pets',
        languages: ['Português', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Chamado', 'Retiro', 'Acampamento', 'Viagem'],
        state: 'Goiás',
        city: 'Goiânia'
    },
    {
        name: 'André',
        bio: 'Focado em crescer profissionalmente e espiritualmente. Busco uma parceira para caminhar junto no evangelho.',
        occupation: 'Professor Universitário',
        religion: 'Protestante',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Pos-graduação',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Não tenho pets',
        languages: ['Português', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Voluntariado', 'Profético', 'Dança', 'Coral'],
        state: 'Distrito Federal',
        city: 'Brasília'
    },
    {
        name: 'Hugo',
        bio: 'Cristão praticante, gosto de música e esportes. Acredito que a base de tudo é o respeito e a temor a Deus.',
        occupation: 'Designer Gráfico',
        religion: 'Evangélica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero mais',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Tenho gato(s)',
        languages: ['Português', 'Inglês', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Teologia', 'Edificação', 'Maturidade', 'Composição'],
        state: 'Bahia',
        city: 'Salvador'
    },
    {
        name: 'Daniel',
        bio: 'Homem simples e dedicado à obra. Valorizo a lealdade e a sinceridade em todas as áreas da vida.',
        occupation: 'Contador',
        religion: 'Protestante',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero mais',
        education: 'Ensino Superior Completo',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Não tenho pets',
        languages: ['Português', 'Inglês', 'Espanhol'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Pastoreio', 'Bíblia', 'Companheirismo', 'Serviço Social'],
        state: 'Rio Grande do Sul',
        city: 'Porto Alegre'
    },
];

/**
 * Enriches a bot profile with static metadata for consistency
 * Accepts an optional ageRange to dynamically pick photos/birth_date
 */
export const enrichBotProfile = (profile: any, ageRange?: string) => {
    // 1. Proteção contra entrada nula
    if (!profile) return profile;

    // 2. Só enriquece se for explicitamente um bot
    if (!profile.is_bot) return profile;

    // 3. Determinação robusta de gênero com fallback seguro
    const botGender = profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'female';
    const extrasList = botGender === 'female' ? FEMALE_EXTRA : MALE_EXTRA;

    // 4. Seleção do 'extra' estático por nome, fallback para o primeiro da lista
    let index = extrasList.findIndex(e => e.name === profile.display_name);
    if (index === -1) index = 0;
    const extra = extrasList[index] || (extrasList.length > 0 ? extrasList[0] : {});

    // 5. Enriquecimento Dinâmico (Fotos e Idade)
    // Usamos sempre uma faixa etária (a fornecida ou uma padrão) para garantir que bots NUNCA fiquem vazios
    const activeRange = ageRange || '26-35';
    const ages = getAgesForRange(activeRange);
    const photos = botGender === 'female' ? getFemalePhotosByAge(activeRange) : getMalePhotosByAge(activeRange);

    // Uso de módulo para garantir segurança nos índices se as listas forem menores que o index
    const photo = (photos && photos.length > 0) ? photos[index % photos.length] : '/placeholder.svg';
    const ageValue = (ages && ages.length > 0) ? ages[index % ages.length] : 25;

    const dynamicData = {
        birth_date: new Date(new Date().getFullYear() - ageValue, 0, 1).toISOString(),
        photos: [photo],
        avatar_url: photo
    };

    // 6. Montagem final com fallbacks em profundidade
    return {
        ...profile,
        ...extra,
        ...dynamicData,
        // Garantimos que campos críticos nunca sejam undefined/null para evitar crashes na UI
        display_name: profile.display_name || (extra as any).name || 'Próximo Encontro',
        bio: profile.bio || (extra as any).bio || 'Olá! Estou em busca de uma companhia especial para caminhar na fé.',
        occupation: profile.occupation || (extra as any).occupation || 'Profissional',
        christian_interests: (profile.christian_interests && profile.christian_interests.length > 0)
            ? profile.christian_interests
            : ((extra as any).christian_interests || ['Fé', 'Família', 'Oração']),
        religion: profile.religion || (extra as any).religion || 'Cristã',
        looking_for: profile.looking_for || (extra as any).looking_for || 'Relacionamento sério',
        city: profile.city || (extra as any).city || 'São Paulo',
        state: profile.state || (extra as any).state || 'SP',
    };
};

// Deprecated: used for local generation, but we now use DB bots
export const getProfilesData = (gender: 'male' | 'female' | null, quizAnswers: QuizAnswers) => {
    const extras = gender === 'male' ? FEMALE_EXTRA : MALE_EXTRA;
    const ages = getAgesForRange(quizAnswers.age);
    const photos = gender === 'male' ? getFemalePhotosByAge(quizAnswers.age) : getMalePhotosByAge(quizAnswers.age);

    return extras.map((extra, index) => ({
        ...extra,
        age: ages[index % ages.length],
        photo: photos[index % photos.length],
        distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
        unlocked: index === 0,
    }));
};

