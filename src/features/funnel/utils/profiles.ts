import { QuizAnswers } from "@/types/funnel";

// Female avatars by age range (shown to male users)
const getFemalePhotosByAge = (age: string | undefined): string[] => {
    const range = age === '18-25' ? '18-25' : age === '26-35' ? '26-35' : age === '36-55' ? '36-55' : age === '56+' ? '56-plus' : '26-35';
    // Base 4 photos for the range
    const base = [
        `/assets/matches/match-female-${range}-display.jpg`,
        `/assets/matches/match-female-${range}-1.jpg`,
        `/assets/matches/match-female-${range}-2.jpg`,
        `/assets/matches/match-female-${range}-3.jpg`,
    ];
    // Complement with photos from other ranges to ensure 9 unique photos
    const others = [
        '/assets/matches/match-female-18-25-display.jpg',
        '/assets/matches/match-female-18-25-1.jpg',
        '/assets/matches/match-female-26-35-display.jpg',
        '/assets/matches/match-female-26-35-1.jpg',
        '/assets/matches/match-female-36-55-display.jpg',
        '/assets/matches/match-female-36-55-1.jpg',
        '/assets/matches/match-female-18-25-2.jpg',
        '/assets/matches/match-female-26-35-2.jpg',
        '/assets/matches/match-female-36-55-2.jpg',
    ];
    // Return unique set of 9
    return Array.from(new Set([...base, ...others])).slice(0, 9);
};

const getMalePhotosByAge = (age: string | undefined): string[] => {
    const range = age === '18-25' ? '18-25' : age === '26-35' ? '26-35' : age === '36-55' ? '36-55' : age === '56+' ? '56-plus' : '26-35';
    const base = [
        `/assets/matches/match-male-${range}-display.jpg`,
        `/assets/matches/match-male-${range}-1.jpg`,
        `/assets/matches/match-male-${range}-2.jpg`,
        `/assets/matches/match-male-${range}-3.jpg`,
    ];
    const others = [
        '/assets/matches/match-male-18-25-display.jpg',
        '/assets/matches/match-male-18-25-1.jpg',
        '/assets/matches/match-male-26-35-display.jpg',
        '/assets/matches/match-male-26-35-1.jpg',
        '/assets/matches/match-male-36-55-display.jpg',
        '/assets/matches/match-male-36-55-1.jpg',
        '/assets/matches/match-male-18-25-2.jpg',
        '/assets/matches/match-male-26-35-2.jpg',
        '/assets/matches/match-male-36-55-2.jpg',
    ];
    return Array.from(new Set([...base, ...others])).slice(0, 9);
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

// Rich static metadata for each profile slot (index 0-2 are used as seeds)
const FEMALE_EXTRA = [
    {
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

const MALE_EXTRA = [
    {
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

export const getProfilesData = (gender: 'male' | 'female' | null, quizAnswers: QuizAnswers) => {
    const stateAbbr = getStateAbbreviation(quizAnswers.state);
    const ages = getAgesForRange(quizAnswers.age);
    const femalePhotos = getFemalePhotosByAge(quizAnswers.age);
    const malePhotos = getMalePhotosByAge(quizAnswers.age);

    const femaleProfiles = [
        { name: 'Bruna', age: ages[0], distance: '4.7 km', photo: femalePhotos[0] },
        { name: 'Amanda', age: ages[1], distance: '2.2 km', photo: femalePhotos[1] },
        { name: 'Carolina', age: ages[2], distance: '6.4 km', photo: femalePhotos[2] },
        { name: 'Juliana', age: ages[3], distance: '7.9 km', photo: femalePhotos[3] },
        { name: 'Fernanda', age: ages[4], distance: '3.1 km', photo: femalePhotos[4] },
        { name: 'Larissa', age: ages[5], distance: '5.6 km', photo: femalePhotos[5] },
        { name: 'Rebeca', age: ages[6], distance: '2.8 km', photo: femalePhotos[6] },
        { name: 'Talita', age: ages[7], distance: '4.1 km', photo: femalePhotos[7] },
        { name: 'Letícia', age: ages[8], distance: '3.5 km', photo: femalePhotos[8] },
    ];

    const maleProfiles = [
        { name: 'Lucas', age: ages[0], distance: '4.7 km', photo: malePhotos[0] },
        { name: 'Gabriel', age: ages[1], distance: '2.2 km', photo: malePhotos[1] },
        { name: 'Pedro', age: ages[2], distance: '6.4 km', photo: malePhotos[2] },
        { name: 'Mateus', age: ages[3], distance: '7.9 km', photo: malePhotos[3] },
        { name: 'Rafael', age: ages[4], distance: '3.1 km', photo: malePhotos[4] },
        { name: 'Thiago', age: ages[5], distance: '5.6 km', photo: malePhotos[5] },
        { name: 'André', age: ages[6], distance: '2.8 km', photo: malePhotos[6] },
        { name: 'Hugo', age: ages[7], distance: '4.1 km', photo: malePhotos[7] },
        { name: 'Daniel', age: ages[8], distance: '3.5 km', photo: malePhotos[8] },
    ];

    const baseProfiles = gender === 'male' ? femaleProfiles : maleProfiles;
    const extraData = gender === 'male' ? FEMALE_EXTRA : MALE_EXTRA;

    return baseProfiles.map((profile, index) => {
        const extra = extraData[index];
        return {
            ...profile,
            state: extra.state || stateAbbr,
            city: extra.city || quizAnswers.city || 'São Paulo',
            unlocked: index === 0,
            // Rich metadata so the expanded profile view looks complete
            ...extra,
            // Prioritize extra christian_interests but fallback to generated ones
            christian_interests: extra.christian_interests || generateMatchingInterests(quizAnswers, index),
            // Fallbacks for consistency
            religion: extra.religion || quizAnswers.religion || 'Cristã',
            looking_for: extra.looking_for || quizAnswers.lookingFor || 'Relacionamento sério',
        };
    });
};
