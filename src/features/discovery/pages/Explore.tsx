import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { cn } from '@/lib/utils';
import {
    Users,
    BookOpen,
    Heart,
    MessageCircle,
    ChevronRight,
    Sparkles,
    Quote,
    ArrowLeft,
    Lightbulb,
    BookMarked,
    Sparkle,
    Sun,
    Coffee,
    CloudSun,
    HandHeart,
    Bell,
    ShieldCheck,
    Check
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { LOCAL_DEVOTIONALS, type Devotional } from '../data/devotionals';
import { FeatureGateDialog } from '../components/FeatureGateDialog';
import { CheckoutManager } from '../components/CheckoutManager';
import { Header } from '@/features/discovery/components/Header';

// --- Types ---
interface TipDetail {
    id: string;
    title: string;
    shortDesc: string;
    fullDesc: string;
    points: string[];
    verse: {
        text: string;
        ref: string;
    };
}

interface Topic {
    id: string;
    title: string;
    icon: string;
    color: string;
    accent: string;
    tips: TipDetail[];
}

interface BibleLesson {
    id: string;
    title: string;
    content: string;
    verse: { text: string; ref: string };
    reflection: string;
}

interface BibleStudy {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: 'Iniciante' | 'Intermediário' | 'Avançado';
    icon: string;
    color: string;
    accent: string;
    lessons: BibleLesson[];
}



// --- Content Data ---
const RELATIONSHIP_TOPICS: Topic[] = [
    {
        id: 'comunicacao',
        title: 'Comunicação',
        icon: 'ri-chat-voice-line',
        color: 'from-blue-500/20 to-indigo-500/10',
        accent: 'text-blue-400',
        tips: [
            {
                id: 'arte-ouvir',
                title: 'A Arte de Ouvir',
                shortDesc: 'Um relacionamento saudável começa com a capacidade de ouvir...',
                fullDesc: 'Ouvir de verdade é uma das maiores demonstrações de amor que você pode oferecer. Não se trata apenas de ficar em silêncio enquanto o outro fala, mas de buscar compreender o coração por trás das palavras. Em um mundo cheio de distrações, dar sua atenção total é um presente precioso.',
                points: [
                    'Mantenha contato visual durante a conversa',
                    'Evite interromper enquanto o outro fala',
                    'Faça perguntas para entender melhor o sentimento',
                    'Repita o que ouviu para confirmar o entendimento',
                    'Desligue distrações como celular em conversas importantes'
                ],
                verse: {
                    text: 'Todo homem seja pronto para ouvir, tardio para falar, tardio para se irar.',
                    ref: 'Tiago 1:19'
                }
            },
            {
                id: 'sentimentos-clareza',
                title: 'Expressando Sentimentos com Clareza',
                shortDesc: 'Aprenda a expressar suas emoções sem gerar mal-entendidos.',
                fullDesc: 'Muitos conflitos surgem porque esperamos que o outro adivinhe o que sentimos. A comunicação clara e honesta remove as suposições e constrói um caminho de confiança e intimidade real.',
                points: [
                    'Use frases começando com "Eu sinto" em vez de "Você fez"',
                    'Seja específico sobre o que está te incomodando',
                    'Escolha o momento certo para falar, evite o cansaço extremo',
                    'Não guarde mágoas, fale enquanto o assunto é atual'
                ],
                verse: {
                    text: 'Falai a verdade cada um com o seu próximo; porque somos membros uns dos outros.',
                    ref: 'Efésios 4:25'
                }
            },
            {
                id: 'palavras-afirmacao',
                title: 'O Poder das Palavras de Afirmação',
                shortDesc: 'Palavras têm poder de construir ou destruir. Edifique seu parceiro.',
                fullDesc: 'O encorajamento é o combustível de um relacionamento. Quando você foca nas qualidades e no esforço do outro, você cria um ambiente onde o amor floresce e a insegurança diminui.',
                points: [
                    'Elogie em público e corrija no particular',
                    'Reconheça pequenos esforços do dia a dia',
                    'Diga "eu te amo" e também "eu admiro você"',
                    'Escreva bilhetes ou mensagens de encorajamento inesperadas'
                ],
                verse: {
                    text: 'A morte e a vida estão no poder da língua; o que bem a utiliza comerá do seu fruto.',
                    ref: 'Provérbios 18:21'
                }
            }
        ]
    },
    {
        id: 'identificando',
        title: 'Identificando uma Boa Pessoa',
        icon: 'ri-eye-line',
        color: 'from-emerald-500/20 to-teal-500/10',
        accent: 'text-emerald-400',
        tips: [
            {
                id: 'observar-frutos',
                title: 'Observe os Frutos, Não Apenas Palavras',
                shortDesc: 'Jesus nos ensinou que pelos frutos conhecemos a árvore.',
                fullDesc: 'Palavras podem ser ensaiadas, mas o caráter é revelado no dia a dia, especialmente sob pressão. Observe como a pessoa trata aqueles de quem ela não precisa de nada, como garçons ou familiares.',
                points: [
                    'Observe a paciência em situações difíceis',
                    'Veja se há consistência entre o que diz e o que faz',
                    'Analise como a pessoa lida com os próprios erros',
                    'Note se ela demonstra os frutos do Espírito no cotidiano'
                ],
                verse: {
                    text: 'Assim, toda árvore boa produz bons frutos, e toda árvore má produz frutos maus.',
                    ref: 'Mateus 7:17'
                }
            },
            {
                id: 'valores-alinhados',
                title: 'Valores Alinhados: O Fundamento',
                shortDesc: 'Relacionamentos duradouros são construídos sobre values comuns.',
                fullDesc: 'A paixão pode iniciar um relacionamento, mas são os valores que o mantêm. Ter a mesma visão de mundo, fé e propósito é essencial para caminhar na mesma direção.',
                points: [
                    'Converse sobre planos para o futuro e família',
                    'Verifique se a prioridade de Deus é a mesma para ambos',
                    'Discuta sobre finanças e estilo de vida cedo',
                    'Nenhum detalhe é pequeno demais quando se trata de princípios'
                ],
                verse: {
                    text: 'Andarão dois juntos, se não estiverem de acordo?',
                    ref: 'Amós 3:3'
                }
            },
            {
                id: 'red-flags',
                title: 'Bandeiras Vermelhas: Sinais de Alerta',
                shortDesc: 'É importante reconhecer sinais que indicam uma pessoa não saudável.',
                fullDesc: 'Não ignore seu discernimento. Muitas vezes Deus nos mostra sinais sutis de falta de caráter ou controle emocional que podem causar grandes dores no futuro.',
                points: [
                    'Falta de respeito com autoridades ou pais',
                    'Ciúme excessivo ou comportamento controlador',
                    'Inabilidade de pedir perdão ou admitir falhas',
                    'Histórico de mentiras, mesmo que pequenas'
                ],
                verse: {
                    text: 'O prudente vê o mal e esconde-se; mas os simples passam e sofrem a pena.',
                    ref: 'Provérbios 22:3'
                }
            }
        ]
    },
    {
        id: 'construindo',
        title: 'Construindo o Relacionamento',
        icon: 'ri-heart-pulse-line',
        color: 'from-rose-500/20 to-pink-500/10',
        accent: 'text-rose-400',
        tips: [
            {
                id: 'amizade-base',
                title: 'Amizade: A Base do Amor Duradouro',
                shortDesc: 'Os melhores relacionamentos têm a amizade como alicerce.',
                fullDesc: 'Antes de serem namorados, vocês devem ser melhores amigos. A amizade permite que vocês sejam vocês mesmos, sem máscaras, criando uma conexão segura e leve.',
                points: [
                    'Cultive interesses em comum',
                    'Riam juntos das pequenas coisas',
                    'Seja o maior apoiador dos sonhos do outro',
                    'Proteja a confiança da amizade acima de tudo'
                ],
                verse: {
                    text: 'Em todo o tempo ama o amigo e para a hora da angústia nasce o irmão.',
                    ref: 'Provérbios 17:17'
                }
            },
            {
                id: 'crescendo-fe',
                title: 'Crescendo Juntos na Fé',
                shortDesc: 'Um casal que ora junto permanece junto. Compartilhem sua vida espiritual.',
                fullDesc: 'A conexão espiritual é o nível mais profundo de intimidade. Quando Deus é o centro, o relacionamento ganha uma força que supera qualquer desafio externo.',
                points: [
                    'Separem momentos para ler a Bíblia juntos',
                    'Orem um pelo outro e um com o outro diariamente',
                    'Sirvam juntos na igreja ou em projetos sociais',
                    'Compartilhem o que Deus tem falado ao coração de cada um'
                ],
                verse: {
                    text: 'O cordão de três dobras não se quebra tão depressa.',
                    ref: 'Eclesiastes 4:12'
                }
            },
            {
                id: 'respeito-mutuo',
                title: 'Respeito Mútuo: Inegociável',
                shortDesc: 'O respeito é a base de qualquer relacionamento saudável.',
                fullDesc: 'Respeito vai além de não insultar. Significa honrar as opiniões, o espaço, o passado e o futuro do outro. É tratar o parceiro como um tesouro de Deus.',
                points: [
                    'Nunca desvalorize os sentimentos do outro',
                    'Respeite os limites individuais e a privacidade',
                    'Fale com doçura, mesmo durante discordâncias',
                    'Honre o outro na sua ausência tanto quanto na presença'
                ],
                verse: {
                    text: 'Nada façais por contenda ou por vanglória, mas com humildade cada um considere os outros superiores a si mesmo.',
                    ref: 'Filipenses 2:3'
                }
            }
        ]
    },
    {
        id: 'conflitos',
        title: 'Conflitos e Perdão',
        icon: 'ri-group-line',
        color: 'from-orange-500/20 to-amber-500/10',
        accent: 'text-orange-400',
        tips: [
            {
                id: 'conflitos-saudaveis',
                title: 'Conflitos Saudáveis: Crescendo nas Diferenças',
                shortDesc: 'Conflitos são inevitáveis, mas podem ser oportunidades.',
                fullDesc: 'O objetivo de um conflito não deve ser vencer, mas resolver. Quando vocês aprendem a brigar "limpo", o desentendimento se torna uma ponte para um entendimento mais profundo.',
                points: [
                    'Ataque o problema, nunca a pessoa',
                    'Não use palavras como "sempre" ou "nunca"',
                    'Ouça o ponto de vista do outro antes de se defender',
                    'Mantenha o tom de voz calmo e controlado'
                ],
                verse: {
                    text: 'A resposta branda desvia o furor, mas a palavra dura suscita a ira.',
                    ref: 'Provérbios 15:1'
                }
            },
            {
                id: 'poder-perdao',
                title: 'O Poder Libertador do Perdão',
                shortDesc: 'O perdão não é aprovar o erro, mas escolher não deixar a mágoa dominar.',
                fullDesc: 'Perdoar é a decisão de liberar o outro da dívida que ele tem com você. Em um relacionamento, o perdão diário é o que impede que o amor se transforme em amargura.',
                points: [
                    'Perdoe rapidamente para não criar raízes de amargura',
                    'Lembre-se de quanto Deus já te perdoou',
                    'Não traga erros passados para discussões presentes',
                    'Peça ajuda ao Espírito Santo para curar as feridas'
                ],
                verse: {
                    text: 'Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.',
                    ref: 'Efésios 4:32'
                }
            },
            {
                id: 'arte-desculpas',
                title: 'A Arte de Pedir Desculpas',
                shortDesc: 'Um pedido de desculpas genuíno tem poder de curar feridas profundas.',
                fullDesc: 'Pedir desculpas não é apenas dizer "desculpe se você se sentiu assim". É assumir a responsabilidade pelo seu erro e demonstrar arrependimento sincero através da mudança.',
                points: [
                    'Assuma seu erro sem dar desculpas ou justificativas',
                    'Reconheça como sua ação afetou o outro',
                    'Pergunte: "O que posso fazer para consertar isso?"',
                    'Demonstre mudança real de comportamento'
                ],
                verse: {
                    text: 'Confessai as vossas culpas uns aos outros, e orai uns pelos outros, para que sareis.',
                    ref: 'Tiago 5:16'
                }
            }
        ]
    },
    {
        id: 'tempo',
        title: 'Tempo de Qualidade',
        icon: 'ri-time-line',
        color: 'from-yellow-500/20 to-amber-500/10',
        accent: 'text-yellow-400',
        tips: [
            {
                id: 'presenca-intencional',
                title: 'Presença Intencional',
                shortDesc: 'Na era digital, estar junto não significa estar presente.',
                fullDesc: 'Estar presente exige intenção. É desligar o mundo lá fora para focar inteiramente na pessoa que está à sua frente. Isso comunica: "Você é mais importante do que qualquer outra notificação".',
                points: [
                    'Tenham momentos sem celular todos os dias',
                    'Tenham encontros semanais focados apenas no casal',
                    'Pratiquem o "olho no olho" ao conversar',
                    'Esteja emocionalmente disponível para ouvir e apoiar'
                ],
                verse: {
                    text: 'Ensina-nos a contar os nossos dias, para que alcancemos coração sábio.',
                    ref: 'Salmo 90:12'
                }
            },
            {
                id: 'conhecendo-profundamente',
                title: 'Conhecendo-se Profundamente',
                shortDesc: 'Mesmo após anos juntos, sempre há mais para descobrir sobre o outro.',
                fullDesc: 'Não assuma que você já sabe tudo. As pessoas mudam e amadurecem. Manter a curiosidade sobre o mundo interno do seu parceiro é o segredo para manter a chama acesa ao longo das décadas.',
                points: [
                    'Faça perguntas sobre os novos sonhos e medos do outro',
                    'Interesse-se pelos hobbies e paixões do parceiro',
                    'Compartilhem memórias de infância ainda não contadas',
                    'Criem uma lista de metas e desejos para os próximos anos'
                ],
                verse: {
                    text: 'Com a sabedoria se edifica a casa, e com a inteligência ela se firma.',
                    ref: 'Provérbios 24:3'
                }
            }
        ]
    },
    {
        id: 'casamento',
        title: 'Preparação para o Casamento',
        icon: 'ri-home-heart-line',
        color: 'from-purple-500/20 to-fuchsia-500/10',
        accent: 'text-purple-400',
        tips: [
            {
                id: 'conversas-essenciais',
                title: 'Conversas Essenciais Antes do Casamento',
                shortDesc: 'Antes de se comprometer, tenha conversas honestas sobre a vida...',
                fullDesc: 'O casamento é uma união total. Discutir temas difíceis agora evita surpresas dolorosas depois. Não tenha medo de abordar finanças, criação de filhos e carreira.',
                points: [
                    'Discutam sobre finanças e divisão de responsabilidades',
                    'Falem abertamente sobre o desejo de ter filhos e educação',
                    'Alinhem as expectativas sobre o papel de cada um na casa',
                    'Tratem sobre o relacionamento com a família de origem'
                ],
                verse: {
                    text: 'Qual de vós, querendo edificar uma torre, não se assenta primeiro a fazer as contas dos gastos?',
                    ref: 'Lucas 14:28'
                }
            },
            {
                id: 'construindo-rocha',
                title: 'Construindo Sobre a Rocha',
                shortDesc: 'Um casamento construído sobre Cristo tem fundamento sólido.',
                fullDesc: 'Quando as tempestades da vida vierem — e elas virão —, apenas um fundamento espiritual sólido manterá a casa de pé. Jesus deve ser o centro e a autoridade final do lar.',
                points: [
                    'Estabeleçam um altar familiar de oração',
                    'Permitam que a Bíblia seja a última palavra em decisões',
                    'Busquem aconselhamento sábio na sua igreja local',
                    'Entendam o casamento como um pacto sagrado, não um contrato'
                ],
                verse: {
                    text: 'Todo aquele, pois, que escuta estas minhas palavras, e as pratica, assemelhá-lo-ei ao homem prudente, que edificou a sua casa sobre a rocha.',
                    ref: 'Mateus 7:24'
                }
            }
        ]
    },
    {
        id: 'servindo',
        title: 'Servindo um ao Outro',
        icon: 'ri-hand-heart-line',
        color: 'from-teal-500/20 to-cyan-500/10',
        accent: 'text-teal-400',
        tips: [
            {
                id: 'amor-acao',
                title: 'Amor em Ação',
                shortDesc: 'O amor verdadeiro se expressa em serviço diário.',
                fullDesc: 'Jesus nos deu o maior exemplo ao lavar os pés dos discípulos. No relacionamento, o amor se manifesta quando colocamos o conforto e as necessidades do outro acima das nossas.',
                points: [
                    'Identifique a linguagem de amor predominante do parceiro',
                    'Surpreenda com atos de serviço sem ser pedido',
                    'Cuide das tarefas que o outro menos gosta de fazer',
                    'Demonstre sacrifício alegre, não por obrigação'
                ],
                verse: {
                    text: 'Filhinhos, não amemos de palavra, nem de língua, mas por obra e em verdade.',
                    ref: '1 João 3:18'
                }
            },
            {
                id: 'apoio-sonhos',
                title: 'Apoio nos Sonhos e Desafios',
                shortDesc: 'Um bom parceiro é aquele que torce pelo sucesso do outro.',
                fullDesc: 'Ser parceiro é ser o maior incentivador. Esteja presente nos dias de conquista e seja o ombro seguro nos dias de cansaço. Caminhem como um tempo.',
                points: [
                    'Celebre as vitórias do outro como se fossem suas',
                    'Ofereça suporte prático durante períodos de estresse',
                    'Ore especificamente pelos desafios profissionais e pessoais do parceiro',
                    'Nunca diminua a ambição ou os ideais do outro'
                ],
                verse: {
                    text: 'Melhor é serem dois do que um... Porque se um cair, o outro levanta o seu companheiro.',
                    ref: 'Eclesiastes 4:9-10'
                }
            }
        ]
    },
    {
        id: 'intimidade',
        title: 'Intimidade Saudável',
        icon: 'ri-sparkling-fill',
        color: 'from-pink-500/20 to-rose-500/10',
        accent: 'text-pink-400',
        tips: [
            {
                id: 'limites-namoro',
                title: 'Limites Saudáveis no Namoro',
                shortDesc: 'A pureza no namoro honra a Deus e protege o relacionamento.',
                fullDesc: 'Estabelecer limites claros não é sobre proibição, mas sobre proteção. A pureza preserva o valor da união futura e mantém a mente focada no que é eterno.',
                points: [
                    'Definam juntos os limites físicos logo no início',
                    'Evitem situações de tentação e ambientes isolados',
                    'Prestem contas a mentores ou amigos de confiança',
                    'Foquem em desenvolver a intimidade espiritual e emocional'
                ],
                verse: {
                    text: 'Fugi da fornicação... Ou não sabeis que o vosso corpo é o templo do Espírito Santo?',
                    ref: '1 Coríntios 6:18-19'
                }
            },
            {
                id: 'conexao-emocional',
                title: 'Conexão Emocional Profunda',
                shortDesc: 'A verdadeira intimidade vai muito além do físico.',
                fullDesc: 'Conexão emocional é sentir-se visto, ouvido e aceito. É a capacidade de ser vulnerável sem medo. Esse é o elo que sustenta o relacionamento através do tempo.',
                points: [
                    'Compartilhe suas fraquezas e medos mais profundos',
                    'Crie um ambiente de "não julgamento" para o parceiro',
                    'Valorize a vulnerabilidade do outro como algo sagrado',
                    'Integrem suas vidas através da partilha de pensamentos e orações'
                ],
                verse: {
                    text: 'No amor não há temor, antes o perfeito amor lança fora o temor.',
                    ref: '1 João 4:18'
                }
            }
        ]
    }
];

const MAIN_CATEGORIES = [
    {
        id: 'community',
        title: 'Comunidade',
        description: 'Junte-se ao nosso grupo no Whatsapp.',
        icon: <Users className="w-5 h-5" />,
        color: 'from-blue-500/10 via-blue-900/5 to-transparent',
        accent: 'text-blue-400'
    },
    {
        id: 'courses',
        title: 'Cursos Bíblicos',
        description: 'Estudos guiados para sua fé.',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'from-emerald-500/10 via-emerald-900/5 to-transparent',
        accent: 'text-emerald-400'
    },
    {
        id: 'devotionals',
        title: 'Devocionais Diários',
        description: 'Renove sua fé todas as manhãs.',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-amber-500/10 via-amber-900/5 to-transparent',
        accent: 'text-amber-400',
        badge: 'Hoje'
    },
    {
        id: 'tips',
        title: 'Relacionamento',
        description: 'Conselhos com propósito divino.',
        icon: <Heart className="w-5 h-5" />,
        color: 'from-rose-500/10 via-rose-900/5 to-transparent',
        accent: 'text-rose-400'
    }
];

// Local fallback moved to ../data/devotionals.ts


const BIBLE_STUDIES: BibleStudy[] = [
    {
        id: 'fundamentos-fe',
        title: 'Fundamentos da Fé',
        description: 'Construa um alicerce inabalável para sua jornada cristã através dos princípios básicos do Reino.',
        duration: '7 Dias',
        level: 'Iniciante',
        icon: 'ri-seedling-line',
        color: 'from-emerald-500/20 to-teal-500/10',
        accent: 'text-emerald-400',
        lessons: [
            {
                id: 'ff-1',
                title: 'O Plano da Salvação',
                content: 'Tudo começa com a compreensão do amor redentor de Deus. A salvação não é conquistada por mérito, mas recebida como um presente através da fé em Jesus Cristo. O pecado nos separou, mas a cruz de Cristo construiu a ponte de volta para o Pai. Entregar a vida a Jesus é o primeiro passo de uma caminhada eterna.',
                verse: { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', ref: 'João 3:16' },
                reflection: 'Você entende que a salvação é um presente gratuito e não algo que você precisa "pagar" com boas obras?'
            },
            {
                id: 'ff-2',
                title: 'A Autoridade da Palavra',
                content: 'A Bíblia não é apenas um livro de histórias ou regras morais, mas a voz viva de Deus para nós hoje. Ela serve como alimento espiritual e bússola moral. Quando nos submetemos às Escrituras, encontramos clareza em meio às incertezas do mundo. Estudar a Bíblia é ouvir o próprio Criador falando ao nosso coração.',
                verse: { text: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção e para a instrução na justiça.', ref: '2 Timóteo 3:16' },
                reflection: 'A Bíblia tem sido a sua primeira consulta diante de decisões importantes ou apenas um recurso para momentos de crise?'
            },
            {
                id: 'ff-3',
                title: 'A Vida de Oração',
                content: 'Oração é comunicação direta com Deus. Não se trata de rituais ou palavras repetitivas, mas de um relacionamento honesto. Jesus nos ensinou que podemos chamar Deus de "Aba" (Pai), demonstrando a intimidade que Ele deseja ter conosco. Orar é tanto falar quanto ouvir a voz do Espírito.',
                verse: { text: 'Orai sem cessar.', ref: '1 Tessalonicenses 5:17' },
                reflection: 'Como seria sua vida se você conversasse com Deus com a mesma frequência que conversa com seu melhor amigo?'
            },
            {
                id: 'ff-4',
                title: 'O Propósito da Igreja',
                content: 'Ninguém foi chamado para ser cristão sozinho. A igreja é o corpo de Cristo na terra, onde cada membro tem um papel vital. Fazer parte de uma comunidade de fé nos protege, nos fortalece e nos permite exercer os dons que Deus nos deu para servir ao próximo.',
                verse: { text: 'Não deixemos de reunir-nos como igreja, segundo o costume de alguns, mas encorajemo-nos uns aos outros.', ref: 'Hebreus 10:25' },
                reflection: 'Você vê a igreja como um lugar para "receber" algo ou como um corpo onde você é parte essencial do serviço?'
            },
            {
                id: 'ff-5',
                title: 'Caminhando em Santidade',
                content: 'Santidade não significa perfeição, mas separação para o propósito de Deus. Significa escolher diariamente caminhos que honrem ao Senhor, fugindo do que nos afasta dEle. É um processo contínuo de transformação onde nos tornamos mais parecidos com Jesus a cada dia.',
                verse: { text: 'Segui a paz com todos e a santificação, sem a qual ninguém verá o Senhor.', ref: 'Hebreus 12:14' },
                reflection: 'Qual área da sua vida você sente que o Espírito Santo está pedindo mais entrega e santificação hoje?'
            }
        ]
    },
    {
        id: 'sermao-monte',
        title: 'O Sermão do Monte',
        description: 'Uma imersão profunda nos ensinos mais revolucionários de Jesus sobre a ética do Reino de Deus.',
        duration: '14 Dias',
        level: 'Intermediário',
        icon: 'ri-landscape-line',
        color: 'from-blue-500/20 to-indigo-500/10',
        accent: 'text-blue-400',
        lessons: [
            {
                id: 'sm-1',
                title: 'As Bem-Aventuranças',
                content: 'Jesus começa seu maior sermão virando o conceito de mundo sobre "felicidade" de cabeça para baixo. Ele declara que os humildes, os que choram e os mansos são os verdadeiros abençoados. O Reino de Deus pertence àqueles que reconhecem sua pobreza espiritual diante de Deus.',
                verse: { text: 'Bem-aventurados os humildes de espírito, porque deles é o reino dos céus.', ref: 'Mateus 5:3' },
                reflection: 'Você busca sua felicidade na aprovação do mundo ou na provisão do Reino de Deus?'
            },
            {
                id: 'sm-2',
                title: 'Sal e Luz na Terra',
                content: 'Nossa identidade em Cristo tem um impacto público. O sal preserva e dá sabor; a luz dissipa as trevas. Como cristãos, somos chamados a influenciar a sociedade com os valores do Evangelho, não nos escondendo, mas brilhando através de nossas boas obras para a glória do Pai.',
                verse: { text: 'Vós sois o sal da terra... Vós sois a luz do mundo.', ref: 'Mateus 5:13-14' },
                reflection: 'Se você desaparecesse da sua comunidade hoje, alguém sentiria falta da "luz" e do "tempero" de Deus que você carrega?'
            },
            {
                id: 'sm-3',
                title: 'A Lei e o Coração',
                content: 'Jesus leva a lei de Deus além do comportamento externo e mergulha nas intenções do coração. Ele nos ensina que o ódio é raiz do homicídio e a cobiça é raiz do adultério. No Reino, o que pensamos e sentimos em segredo é tão importante quanto o que fazemos em público.',
                verse: { text: 'Ouvistes o que foi dito... Eu, porém, vos digo...', ref: 'Mateus 5:21-22' },
                reflection: 'Como você tem cuidado do seu "quintal secreto" — seus pensamentos e desejos mais profundos?'
            },
            {
                id: 'sm-4',
                title: 'Amando os Inimigos',
                content: 'Talvez o ensino mais difícil de Jesus: amar aqueles que nos perseguem. No Reino, não retribuímos mal com mal. Nosso padrão de amor não é o mundo, mas a perfeição do Pai, que faz nascer o sol sobre bons e maus. O perdão é a prova máxima da nossa nova natureza.',
                verse: { text: 'Amai os vossos inimigos e orai pelos que vos perseguem.', ref: 'Mateus 5:44' },
                reflection: 'Existe alguém a quem você está retendo o amor e o perdão por causa de uma ofensa passada?'
            },
            {
                id: 'sm-5',
                title: 'Oração e Jejum em Segredo',
                content: 'Nossa espiritualidade não deve ser uma exibição para homens, mas uma audiência com Deus. Jesus alerta contra a hipocrisia de fazer o bem apenas para ser visto. A verdadeira recompensa vem do Pai que vê o que é feito em secreto. A intimidade real acontece na porta fechada do quarto.',
                verse: { text: 'Mas tu, quando orares, entra no teu quarto e, fechada a porta, ora a teu Pai, que está em secreto.', ref: 'Mateus 6:6' },
                reflection: 'Sua vida de oração secreta é mais vibrante ou mais pobre do que sua aparência espiritual pública?'
            },
            {
                id: 'sm-6',
                title: 'Ansiedade e Confiança',
                content: 'Jesus nos convida a observar as aves e as flores para entender o cuidado de Deus. A ansiedade revela uma falta de confiança no caráter providente do Pai. Buscar primeiro o Reino resolve o caos das preocupações terrenas, pois tudo o mais nos será acrescentado por Ele.',
                verse: { text: 'Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas.', ref: 'Mateus 6:33' },
                reflection: 'Qual preocupação hoje está roubando o lugar que deveria ser da confiança no cuidado de Deus?'
            },
            {
                id: 'sm-7',
                title: 'A Rocha ou a Areia',
                content: 'Jesus termina seu sermão com um desafio prático: não basta ouvir, é preciso praticar. Aquele que aplica seus ensinos constrói uma vida sobre a Rocha. Quando as tempestades vierem — e elas virão para todos — apenas o que foi construído na obediência permanecerá de pé.',
                verse: { text: 'Todo aquele, pois, que ouve estas minhas palavras e as pratica será comparado a um homem prudente que edificou a sua casa sobre a rocha.', ref: 'Mateus 7:24' },
                reflection: 'Suas fundações espirituais estão sendo testadas hoje. Você tem praticado o que tem aprendido?'
            }
        ]
    },
    {
        id: 'vida-espirito',
        title: 'Vida no Espírito',
        description: 'Aprenda a ouvir, seguir e fluir com a voz do Espírito Santo em todas as áreas da sua vida.',
        duration: '10 Dias',
        level: 'Avançado',
        icon: 'ri-fire-line',
        color: 'from-orange-500/20 to-red-500/10',
        accent: 'text-orange-400',
        lessons: [
            {
                id: 've-1',
                title: 'Conhecendo a Pessoa do Espírito',
                content: 'O Espírito Santo não é uma força impessoal ou uma energia, mas a terceira Pessoa da Trindade. Ele tem sentimentos, vontade e inteligência. O primeiro passo para uma vida no Espírito é desejar amizade com Ele. Jesus O chamou de "Consolador" e "Ajudador" que estaria conosco para sempre.',
                verse: { text: 'E eu rogarei ao Pai, e ele vos dará outro Consolador, para que fique convosco para sempre.', ref: 'João 14:16' },
                reflection: 'Você tem tratado o Espírito Santo como uma influência distante ou como um Amigo presente hoje?'
            },
            {
                id: 've-2',
                title: 'O Fruto do Espírito',
                content: 'A evidência de uma vida cheia do Espírito não é o barulho, mas o caráter. O fruto do Espírito — amor, alegria, paz, paciência, benignidade, bondade, fidelidade, mansidão e domínio próprio — é produzido quando permanecemos ligados em Cristo. É a natureza de Jesus sendo formada em nós.',
                verse: { text: 'Mas o fruto do Espírito é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade, mansidão, domínio próprio.', ref: 'Gálatas 5:22-23' },
                reflection: 'Qual dessas nove características do fruto você sente que mais precisa de crescimento nesta estação da sua vida?'
            },
            {
                id: 've-3',
                title: 'Dons para o Serviço',
                content: 'Enquanto o fruto é caráter, os dons são ferramentas. Deus concede dons espirituais a cada cristão para a edificação da igreja. Eles não são troféus de santidade, mas instrumentos de serviço. Operar nos dons requer humildade e um compromisso inegociável com o amor.',
                verse: { text: 'A cada um, porém, é dada a manifestação do Espírito, visando ao bem comum.', ref: '1 Coríntios 12:7' },
                reflection: 'Você já parou para descobrir qual dom espiritual Deus colocou em suas mãos para abençoar a outros?'
            },
            {
                id: 've-4',
                title: 'Ouvindo a Voz de Deus',
                content: 'Ovelhas conhecem a voz do seu Pastor. O Espírito Santo fala através da Bíblia, da nossa consciência limpa, de conselhos sábios e de uma paz interior profunda. Discernir a voz de Deus requer silêncio, solitude e uma disposição total para obedecer, mesmo quando o comando desafia nossa lógica.',
                verse: { text: 'As minhas ovelhas ouvem a minha voz; eu as conheço, e elas me seguem.', ref: 'João 10:27' },
                reflection: 'Sua rotina permite momentos de silêncio para que você possa realmente ouvir o sussurro do Espírito?'
            },
            {
                id: 've-5',
                title: 'A Batalha Espiritual',
                content: 'Viver no Espírito é entrar em uma zona de guerra. Nossa luta não é contra pessoas de carne e sangue, mas contra forças espirituais da maldade. A armadura de Deus e a espada do Espírito (a Palavra) são nossas defesas e ataques necessários para permanecermos firmes e avançarmos o Reino.',
                verse: { text: 'Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.', ref: 'Efésios 6:11' },
                reflection: 'Você tem se sentido cansado espiritualmente? Pode ser que esteja tentando lutar sem as armas da luz.'
            }
        ]
    },
    {
        id: 'relacionamento-proposito',
        title: 'Relacionamento com Propósito',
        description: 'Prepare seu coração para um namoro e casamento que glorifiquem a Deus no mundo moderno.',
        duration: '5 Dias',
        level: 'Intermediário',
        icon: 'ri-heart-2-line',
        color: 'from-rose-500/20 to-pink-500/10',
        accent: 'text-rose-400',
        lessons: [
            {
                id: 'rp-1',
                title: 'Sua Identidade em Primeiro Lugar',
                content: 'Nenhum relacionamento humano será saudável se você não estiver seguro na sua identidade como filho(a) de Deus. Antes de procurar alguém para te completar, você precisa ser transbordante no amor do Pai. O casamento não é a fonte da sua felicidade, mas o lugar onde você compartilha a felicidade que já encontrou em Deus.',
                verse: { text: 'Porque nEle habita corporalmente toda a plenitude da divindade; e estais perfeitos nEle...', ref: 'Colossenses 2:9-10' },
                reflection: 'Você está buscando alguém para preencher um vazio que só Deus pode ocupar?'
            },
            {
                id: 'rp-2',
                title: 'O Jugo Desigual',
                content: 'Alinhar valores espirituais é o fundamento de uma casa sólida. O jugo desigual não se refere apenas a religiões diferentes, mas a direções de vida opostas. Caminhar com alguém que não tem o mesmo compromisso com Cristo que você criará tensões dolorosas no futuro. Escolha alguém que ame a Deus mais do que ama você.',
                verse: { text: 'Não vos prendais a um jugo desigual com os infiéis; porque, que sociedade tem a justiça com a injustiça?', ref: '2 Coríntios 6:14' },
                reflection: 'Na sua lista de prioridades para um parceiro, onde está o "Amor a Deus em primeiro lugar"?'
            },
            {
                id: 'rp-3',
                title: 'Corte vs Namoro Moderno',
                content: 'O objetivo do namoro cristão é o discernimento para o casamento, não apenas o entretenimento emocional ou físico. Uma "corte" santa envolve clareza de intenções, limites físicos inegociáveis e a participação da comunidade/família. É proteger o coração do outro como se fosse um tesouro confiado por Deus.',
                verse: { text: 'Fugi da impureza... Ou não sabeis que o vosso corpo é o templo do Espírito Santo?', ref: '1 Coríntios 6:18-19' },
                reflection: 'Seus relacionamentos passados deixaram feridas ou construíram caminhos de honra?'
            },
            {
                id: 'rp-4',
                title: 'O Poder da Espera',
                content: 'Esperar não é passividade, é preparação. Deus trabalha naqueles que esperam nEle. Use solteirice para servir, estudar e crescer em caráter. Quando você foca no seu propósito, acaba encontrando quem está correndo na mesma direção. Não apresse o que Deus quer amadurecer.',
                verse: { text: 'Espera pelo Senhor, tem bom ânimo, e ele fortalecerá o teu coração; espera, pois, pelo Senhor.', ref: 'Salmo 27:14' },
                reflection: 'Você consegue descansar na soberania de Deus sobre o seu futuro afetivo ou vive ansioso para "resolver" essa área?'
            },
            {
                id: 'rp-5',
                title: 'Visão Bíblica do Casamento',
                content: 'O casamento cristão é um reflexo da união entre Cristo e a Igreja. É um pacto de sacrifício mútuo, entrega e serviço. Homens são chamados a amar como Cristo amou; mulheres são chamadas a honrar como a igreja honra a Cristo. É uma parceria divina para mostrar ao mundo como Deus ama Seu povo.',
                verse: { text: 'Vós, maridos, amai vossas mulheres, como também Cristo amou a igreja, e a si mesmo se entregou por ela.', ref: 'Efésios 5:25' },
                reflection: 'Você está disposto(a) a entrar em uma união onde o "eu" morre para que o "nós" em Cristo floresça?'
            }
        ]
    }
];

const COMMUNITY_DATA = {
    main: {
        title: "Comunidade Principal",
        description: "O portal central que conecta todos os nossos grupos e membros.",
        link: "https://chat.whatsapp.com/ILQXCaGJ4Ci2nL0AXADDgd",
        icon: 'ri-global-line'
    },
    categories: [
        {
            id: 'general',
            title: 'Grupos Gerais e Idade',
            description: 'Conecte-se por afinidade, idade ou denominação.',
            icon: 'ri-group-line',
            color: 'from-blue-500/20 to-indigo-500/10',
            accent: 'text-blue-400',
            groups: [
                { name: 'Grupo GERAL BRASIL', link: 'https://chat.whatsapp.com/GEuPUAZJ5zSFxcxb6TTdBs' },
                { name: 'Encontro +30 Anos', link: 'https://chat.whatsapp.com/CyXiRQ2PeQ8FGFrTSIFxPL' },
                { name: 'Encontro +40 Anos', link: 'https://chat.whatsapp.com/FUAPAVSV36C19vJsYxPRtZ' },
                { name: 'Encontro +60 Anos', link: 'https://chat.whatsapp.com/DhKIoOmu2I2LUYoMqYgJCf' },
                { name: 'Encontro – Evangélicos', link: 'https://chat.whatsapp.com/FV74DG8j0Io95banX2QPQT' },
                { name: 'Encontro – Católicos', link: 'https://chat.whatsapp.com/H9NZqD79QED1naSybQspkM' }
            ]
        },
        {
            id: 'states',
            title: 'Grupos por Estado',
            description: 'Encontre pessoas da sua região.',
            icon: 'ri-map-pin-line',
            color: 'from-emerald-500/20 to-teal-500/10',
            accent: 'text-emerald-400',
            groups: [
                { name: 'ACRE', link: 'https://chat.whatsapp.com/Co6vQYg8bFw5zCm1gJcnwC' },
                { name: 'ALAGOAS', link: 'https://chat.whatsapp.com/IHaE8yJlbuc0Z52nB7jgIa' },
                { name: 'AMAPÁ', link: 'https://chat.whatsapp.com/FjZrYLbvE5pAu9EugwcKhS' },
                { name: 'AMAZONAS', link: 'https://chat.whatsapp.com/Lq6FwgNw04YBP8iM2rrbCj' },
                { name: 'BAHIA', link: 'https://chat.whatsapp.com/ITe6TiP1eWS4IzCy6ap5vT' },
                { name: 'CEARÁ', link: 'https://chat.whatsapp.com/LZlUVXqZ9aDAGQv8P4031n' },
                { name: 'DISTRITO FEDERAL', link: 'https://chat.whatsapp.com/LwAi6RyqqAm0BcUMEOGUrl' },
                { name: 'ESPÍRITO SANTO', link: 'https://chat.whatsapp.com/BGqAXnzWxjrEG1dpgkQaM3' },
                { name: 'GOIÁS', link: 'https://chat.whatsapp.com/HRM8iQr0ayj1dscVy7m7W5' },
                { name: 'MARANHÃO', link: 'https://chat.whatsapp.com/J0KUrIvGii07Mjopx5alNr' },
                { name: 'MATO GROSSO', link: 'https://chat.whatsapp.com/LU08u8yYWdg6Y5BU4N6Qtu' },
                { name: 'MATO GROSSO DO SUL', link: 'https://chat.whatsapp.com/FJcBjTVY7Fx4MmvpPFDDBM' },
                { name: 'MINAS GERAIS', link: 'https://chat.whatsapp.com/IF5blvoV67KFtkvISOC8aM' },
                { name: 'PARÁ', link: 'https://chat.whatsapp.com/JdFz1Uwh6kU3Vh7U5hrUmt' },
                { name: 'PARAÍBA', link: 'https://chat.whatsapp.com/G1IsyPhnYaT2BRbruLPSkx' },
                { name: 'PARANÁ', link: 'https://chat.whatsapp.com/HECWdkLufsr4j96GcCjUDN' },
                { name: 'PERNAMBUCO', link: 'https://chat.whatsapp.com/H0qMMxz0NBP1fefbkdeadY' },
                { name: 'PIAUÍ', link: 'https://chat.whatsapp.com/LJk7ygppiugIB9ub2LuY3X' },
                { name: 'RIO DE JANEIRO', link: 'https://chat.whatsapp.com/KT8tFi68TkRKkauZyVlOGz' },
                { name: 'RIO GRANDE DO NORTE', link: 'https://chat.whatsapp.com/D80n9u8KByc7iiZ3gd4aVs' },
                { name: 'RIO GRANDE DO SUL', link: 'https://chat.whatsapp.com/F0IayUWsAb98tVUvlUtjr3' },
                { name: 'RONDÔNIA', link: 'https://chat.whatsapp.com/JU0qJ1outqyLWvCr05uTth' },
                { name: 'RORAIMA', link: 'https://chat.whatsapp.com/IvC99vbEan1FwAHNm2hllz' },
                { name: 'SANTA CATARINA', link: 'https://chat.whatsapp.com/CwadHlvzZMM1uzSP6sAk20' },
                { name: 'SÃO PAULO', link: 'https://chat.whatsapp.com/IcERbTlSYaGCcyG2380eYX' },
                { name: 'SERGIPE', link: 'https://chat.whatsapp.com/L5EifOXu1Yi9JDvvnAgdzr' },
                { name: 'TOCANTINS', link: 'https://chat.whatsapp.com/IrsHNR0dzffIEUmIFXatqC' }
            ]
        }
    ]
};

export default function Explore() {
    const [view, setView] = useState<'categories' | 'tips-list' | 'tip-detail' | 'devotional-detail' | 'courses-list' | 'course-detail' | 'community-list'>('categories');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [selectedTip, setSelectedTip] = useState<TipDetail | null>(null);
    const [selectedStudy, setSelectedStudy] = useState<BibleStudy | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<BibleLesson | null>(null);
    const [completedStudies, setCompletedStudies] = useState<string[]>(() => {
        const saved = localStorage.getItem('completed_studies');
        return saved ? JSON.parse(saved) : [];
    });
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [pendingGroupLink, setPendingGroupLink] = useState<string | null>(null);
    const { data: subscription } = useSubscription();
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showCheckoutManager, setShowCheckoutManager] = useState(false);
    const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);
    const [upgradeData, setUpgradeData] = useState({
        title: '',
        description: '',
        features: [] as string[],
        icon: null as React.ReactNode,
        price: 0,
        planId: ''
    });
    const isGold = subscription?.tier === 'gold';
    const hasCommunityAccess = subscription?.tier === 'silver' || isGold;

    const containerRef = useRef<HTMLDivElement>(null);

    // --- Animation Variants ---
    const staggerContainer = {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { staggerChildren: 0.12 } }
    };

    const itemFadeUp = {
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 100 } }
    };

    // --- Daily Devotional Logic (External API + Fallback) ---
    const getBrazilDateString = () => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    const [currentBrazilDate, setCurrentBrazilDate] = useState(getBrazilDateString());

    const [todayDevotional, setTodayDevotional] = useState<Devotional>(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % LOCAL_DEVOTIONALS.length;
        const initial = LOCAL_DEVOTIONALS[index];
        const formattedDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date());
        return { ...initial, date: formattedDate };
    });

    // Detect day change at midnight Brazil time
    useEffect(() => {
        const interval = setInterval(() => {
            const nowBR = getBrazilDateString();
            if (nowBR !== currentBrazilDate) {
                setCurrentBrazilDate(nowBR);
            }
        }, 1000 * 60); // Check every minute
        return () => clearInterval(interval);
    }, [currentBrazilDate]);

    // Handle Daily Devotional Fetching with Cache & Error Handling
    useEffect(() => {
        const fetchDevotional = async () => {
            const CACHE_KEY = `devotional-cache-${currentBrazilDate}`;

            // 1. Try Cache First
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.date && parsed.content) {
                        setTodayDevotional(parsed);
                        return; // Successfully loaded from cache
                    }
                }
            } catch (e) {
                console.error("Cache read error", e);
            }

            // 2. Fetch from API if no valid cache
            try {
                const response = await fetch('https://micromab.com/wp-json/openheavens/v1/today');
                const data = await response.json();

                if (data && data.message) {
                    const msg = data.message;

                    const extract = (startMarker: string, endMarker?: string) => {
                        const start = msg.indexOf(startMarker);
                        if (start === -1) return '';
                        let content = msg.substring(start + startMarker.length);
                        if (endMarker) {
                            const end = content.indexOf(endMarker);
                            if (end !== -1) content = content.substring(0, end);
                        }
                        return content.trim().replace(/&#[0-9]+;/g, (match: string) => {
                            const num = parseInt(match.match(/\d+/)![0]);
                            return String.fromCharCode(num);
                        });
                    };

                    const translateText = async (text: string): Promise<string | null> => {
                        if (!text || text.length < 3) return text;
                        try {
                            const paragraphs = text.split('\n\n');
                            const translatedParagraphs = await Promise.all(paragraphs.map(async (p) => {
                                if (p.length < 3) return p;
                                const encoded = encodeURIComponent(p.substring(0, 500));
                                const res = await fetch(`https://lingva.ml/api/v1/en/pt/${encoded}`);
                                if (!res.ok) throw new Error('Translation failed');
                                const resData = await res.json();
                                return resData.translation;
                            }));

                            if (translatedParagraphs.some(p => !p)) return null;
                            return translatedParagraphs.join('\n\n');
                        } catch { return null; }
                    };

                    const rawVerse = extract('MEMORY VERSE:', 'OPEN HEAVENS FOR TODAY BIBLE TEXT');
                    const verseParts = rawVerse.split('\n\n');

                    const apiTitle = data.title.split(' \u2013 ')[1] || data.title;
                    const apiVerseTxt = verseParts[1]?.trim() || verseParts[0]?.trim() || '...';
                    const apiVerseRef = verseParts[0]?.trim() || 'Escritura';

                    const apiMessage = extract('OPEN HEAVENS FOR TODAY MESSAGE', 'open heavens today');
                    const apiReflection = extract('Open Heavens Devotional For Today Reflection', 'Open Heavens For Today Reflection Questions');
                    const apiAction = extract('Open Heavens Devotional  Application', 'PRAYER POINTS');
                    const apiPrayer = extract('PRAYER POINTS ON TODAY', '_note');

                    // Translate important fields
                    const [tTitle, tVerse, tContent, tReflection, tAction, tPrayer] = await Promise.all([
                        translateText(apiTitle),
                        translateText(apiVerseTxt),
                        translateText(apiMessage.split('\n\n').slice(0, 3).join('\n\n')),
                        translateText(apiReflection),
                        translateText(apiAction),
                        translateText(apiPrayer)
                    ]);

                    // Only update and cache if translation succeeded for key fields
                    if (tTitle && tContent) {
                        const newDevotional: Devotional = {
                            id: `api-${data.id}`,
                            date: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date()),
                            title: tTitle,
                            verse: { text: tVerse || apiVerseTxt, ref: apiVerseRef },
                            content: tContent,
                            reflection: tReflection || apiReflection,
                            action: tAction || apiAction,
                            prayer: tPrayer || apiPrayer
                        };

                        setTodayDevotional(newDevotional);
                        localStorage.setItem(CACHE_KEY, JSON.stringify(newDevotional));
                    } else {
                        console.warn("Translation failed or returned empty content. Using local fallback.");
                    }
                }
            } catch (error) {
                console.error('Error fetching/translating devotional:', error);
                // Keep local fallback on error
            }
        };

        fetchDevotional();
    }, [currentBrazilDate]);

    // --- Handlers ---
    const handleCategoryClick = (id: string) => {
        if (id === 'tips') {
            setView('tips-list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (id === 'devotionals') {
            setView('devotional-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (id === 'courses') {
            setView('courses-list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (id === 'community') {
            if (!hasCommunityAccess) {
                setShowUpgradeDialog(true);
                return;
            }
            setView('community-list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleGroupClick = (link: string) => {
        setPendingGroupLink(link);
        setIsRuleModalOpen(true);
    };

    const confirmJoinGroup = () => {
        if (pendingGroupLink) {
            window.open(pendingGroupLink, '_blank');
        }
        setIsRuleModalOpen(false);
        setPendingGroupLink(null);
    };

    const handleStudyClick = (study: BibleStudy) => {
        setSelectedStudy(study);
        setSelectedLesson(study.lessons[0]); // Start with first lesson
        setView('course-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextLesson = () => {
        if (!selectedStudy || !selectedLesson) return;

        const currentIndex = selectedStudy.lessons.findIndex(l => l.id === selectedLesson.id);
        if (currentIndex < selectedStudy.lessons.length - 1) {
            setSelectedLesson(selectedStudy.lessons[currentIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Last lesson reached - Mark as complete
            const newCompleted = [...new Set([...completedStudies, selectedStudy.id])];
            setCompletedStudies(newCompleted);
            localStorage.setItem('completed_studies', JSON.stringify(newCompleted));
            setView('courses-list');
        }
    };

    const handleTipClick = (topic: Topic, tip: TipDetail) => {
        setSelectedTopic(topic);
        setSelectedTip(tip);
        setView('tip-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        if (view === 'tip-detail') setView('tips-list');
        else if (view === 'course-detail') setView('courses-list');
        else if (view === 'tips-list' || view === 'devotional-detail' || view === 'courses-list' || view === 'community-list') {
            setView('categories');
            setSelectedTopic(null);
            setSelectedStudy(null);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <PageTransition className="flex flex-col min-h-screen bg-[#0f172a] pb-32 overflow-x-hidden">
            <AnimatePresence mode="wait">

                {/* --- VIEW: CATEGORIES (Sacred Mosaic Style) --- */}
                {view === 'categories' && (
                    <motion.div
                        key="categories"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col"
                    >
                        <Header />

                        <div className="px-6 py-4">
                            {/* Massive Typographic Header */}
                            <motion.div variants={itemFadeUp} className="mb-12 relative">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 blur-[100px] rounded-full -z-10" />
                                <h2 className="text-5xl font-serif font-semibold text-white leading-tight">
                                    Conteúdos <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37] italic">Inspiradores</span>
                                </h2>
                                <div className="w-12 h-1 bg-accent mt-4 rounded-full opacity-50" />
                            </motion.div>

                            {/* Main Spotlight Fragment (Extreme Asymmetry for Devotional) */}
                            <motion.div
                                variants={itemFadeUp}
                                onClick={() => handleCategoryClick('devotionals')}
                                className="relative mb-12 ml-4 mr-0 group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent blur-3xl rounded-[3rem] -z-10 opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity flex gap-2">
                                        <CloudSun className="w-24 h-24 text-amber-400 rotate-12" />
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            Devocional de Hoje
                                        </span>
                                        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">{todayDevotional.date}</span>
                                    </div>

                                    <h3 className="text-2xl font-serif font-semibold text-white mb-2 italic">"{todayDevotional.title}"</h3>
                                    <p className="text-white/60 text-base leading-relaxed mb-6 max-w-[85%] line-clamp-2">
                                        {todayDevotional.content}
                                    </p>
                                    <div className="flex items-center gap-3 text-amber-500 font-semibold text-sm tracking-widest uppercase group-hover:translate-x-2 transition-transform">
                                        Ler Agora <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Staggered Grid (Topological Betrayal) */}
                            <div className="space-y-6">
                                {MAIN_CATEGORIES.filter(c => c.id !== 'devotionals').map((cat, idx) => (
                                    <motion.div
                                        key={cat.id}
                                        variants={itemFadeUp}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={cn(
                                            "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 group cursor-pointer transition-all",
                                            idx % 2 === 0 ? "ml-12 mr-2" : "mr-12 ml-2" // Alternating stagger correctly
                                        )}
                                    >
                                        <div className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b opacity-40 transition-all group-hover:w-full group-hover:opacity-20", cat.color)} />
                                        <div className="relative z-10 flex items-center gap-6">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform", cat.accent)}>
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-serif font-semibold text-white tracking-tight">{cat.title}</h4>
                                                <p className="text-sm text-white/40 font-medium">{cat.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Divine Scroll Quote */}
                            <motion.div variants={itemFadeUp} className="mt-16 text-center px-4 opacity-30">
                                <Quote className="w-8 h-8 mx-auto mb-4 text-accent/50" />
                                <p className="text-sm font-serif italic text-white/80 leading-relaxed">
                                    "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho."
                                </p>
                                <span className="text-[10px] uppercase tracking-widest font-semibold mt-2 block">Salmo 119:105</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* --- VIEW: DEVOTIONAL DETAIL (Meditation Flow) --- */}
                {view === 'devotional-detail' && (
                    <motion.div
                        key="devotional-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col min-h-screen"
                    >
                        {/* Soft Ambient Background */}
                        <div className="fixed inset-0 -z-10 bg-[#0f172a]">
                            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-amber-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
                        </div>

                        {/* Detail Nav */}
                        <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-50">
                            <button onClick={goBack} className="w-12 h-12 rounded-full glass flex items-center justify-center text-white active:scale-75 transition-transform backdrop-blur-3xl">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                                <Coffee className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-bold uppercase text-white/80 tracking-widest">{todayDevotional.date}</span>
                            </div>
                            <div className="w-12" />
                        </div>

                        <div className="px-8 pb-40">
                            {/* Morning Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 text-center"
                            >
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4 block">Meditação Diária</span>
                                <h2 className="text-4xl font-serif font-semibold text-white leading-tight mb-8">
                                    {todayDevotional.title}
                                </h2>
                                <div className="w-8 h-1 bg-amber-500/50 mx-auto rounded-full" />
                            </motion.div>

                            {/* The Scripture (Floating Paper Style) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-16 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 relative"
                            >
                                <BookMarked className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-500" />
                                <blockquote className="text-xl font-serif italic text-white/90 text-center leading-relaxed mb-6">
                                    "{todayDevotional.verse.text}"
                                </blockquote>
                                <div className="text-center">
                                    <span className="text-xs font-bold text-amber-500/60 uppercase tracking-widest">{todayDevotional.verse.ref}</span>
                                </div>
                            </motion.div>

                            {/* Main Content (Typographic focus) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="mt-20 space-y-12"
                            >
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-white/80 text-lg leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-amber-500">
                                        {todayDevotional.content}
                                    </p>
                                </div>

                                {/* Reflection Fragment */}
                                <div className="pl-6 border-l-2 border-amber-500/30 py-2">
                                    <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-3 h-3" /> Para Refletir
                                    </h4>
                                    <p className="text-white/70 italic font-medium">{todayDevotional.reflection}</p>
                                </div>

                                {/* Action Step */}
                                <div className="glass-dark p-6 rounded-3xl border border-amber-500/10">
                                    <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Sparkle className="w-3 h-3" /> Passo Prático
                                    </h4>
                                    <p className="text-white/80">{todayDevotional.action}</p>
                                </div>

                                {/* Prayer Moment */}
                                <div className="pt-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8">
                                        <HandHeart className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Momento de Oração</h4>
                                    <p className="text-white/80 text-xl font-serif italic max-w-[90%] mx-auto leading-relaxed">
                                        "{todayDevotional.prayer}"
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* --- VIEW: TIPS LIST (Vertical Stream) --- */}
                {view === 'tips-list' && (
                    <motion.div
                        key="tips-list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col pt-4"
                    >
                        {/* Unconventional Nav Header */}
                        <div className="px-6 pb-6 flex items-center justify-between sticky top-0 bg-[#0f172a]/80 backdrop-blur-3xl z-50 py-4">
                            <button onClick={goBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-xl font-serif font-semibold text-white italic tracking-tight">Conselhos com Fé</h2>
                            <div className="w-12" />
                        </div>

                        <div className="px-6 space-y-12">
                            {RELATIONSHIP_TOPICS.map((topic, topicIdx) => (
                                <div key={topic.id} id={`topic-${topic.id}`} className="relative">
                                    {/* Floating Fragment Header */}
                                    <div className="sticky top-20 z-10 py-4 bg-transparent mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10", topic.color, topic.accent)}>
                                                <i className={cn(topic.icon, "text-2xl")} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-serif font-semibold text-white leading-none mb-1">{topic.title}</h3>
                                                <span className="text-[10px] text-accent font-semibold uppercase tracking-[0.2em] opacity-60">
                                                    {topic.tips.length < 10 ? `0${topic.tips.length}` : topic.tips.length} Artigos Premium
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Asymmetric Tips Flow */}
                                    <div className="space-y-4 pl-4 border-l border-white/5 ml-6">
                                        {topic.tips.map((tip, tipIdx) => (
                                            <motion.div
                                                key={tip.id}
                                                initial={{ opacity: 0, x: 10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true, margin: "-50px" }}
                                                transition={{ delay: 0.1 }}
                                                onClick={() => handleTipClick(topic, tip)}
                                                className={cn(
                                                    "group relative cursor-pointer active:scale-[0.98] transition-transform",
                                                    tipIdx % 2 === 1 ? "ml-6" : "" // Subtle stagger
                                                )}
                                            >
                                                <div className="glass-dark rounded-[1.5rem] border border-white/5 p-6 flex items-center gap-5 hover:bg-white/[0.05] hover:border-accent/30 transition-all group-hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                                                    <div className="relative shrink-0">
                                                        <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                            <Sparkle className="w-5 h-5 text-accent opacity-30 group-hover:rotate-45 group-hover:opacity-100 transition-all" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white text-base font-semibold truncate group-hover:text-accent transition-colors">{tip.title}</h4>
                                                        <p className="text-white/40 text-xs mt-1 leading-snug">{tip.shortDesc}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-accent/20 transition-colors">
                                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- VIEW: TIP DETAIL (Sacred Detail Style) --- */}
                {view === 'tip-detail' && selectedTip && selectedTopic && (
                    <motion.div
                        key="tip-detail"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col min-h-screen"
                    >
                        {/* Cinematic Header Overlay */}
                        <div className="fixed top-0 left-0 w-full h-80 pointer-events-none -z-10">
                            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-30", selectedTopic.color.split(' ')[0])} />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0f172a] to-transparent" />
                        </div>

                        {/* Detail Nav */}
                        <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-50">
                            <button
                                onClick={goBack}
                                className="w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-white active:scale-75 transition-transform backdrop-blur-3xl"
                            >
                                <ArrowLeft className="w-5 h-5 shadow-2xl" />
                            </button>
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black/20 backdrop-blur-2xl border border-white/5 px-4 py-2 rounded-full"
                            >
                                <span className="text-[10px] font-bold uppercase text-accent tracking-[0.3em]">{selectedTopic.title}</span>
                            </motion.div>
                            <div className="w-12" />
                        </div>

                        <div className="px-6 pb-40 mt-10">
                            {/* Massive Typographic Reveal */}
                            <motion.h2
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="text-5xl font-serif font-semibold text-white mb-8 leading-[1.1] italic"
                            >
                                {selectedTip.title}
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="w-20 h-1.5 bg-accent mb-12 rounded-full"
                            />

                            {/* Fragmented Content Layout */}
                            <div className="space-y-12 mb-16">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/80 text-lg leading-relaxed font-medium first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-accent first-letter:mt-1"
                                >
                                    {selectedTip.fullDesc}
                                </motion.p>

                                {/* Main Points Box (Layered Depth) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Lightbulb className="w-32 h-32 text-accent" />
                                    </div>

                                    <h4 className="text-accent text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                        Pilares de Prática
                                    </h4>

                                    <div className="space-y-6">
                                        {selectedTip.points.map((point, i) => (
                                            <div key={i} className="flex gap-4 items-start group">
                                                <div className="w-6 h-6 rounded-full border border-accent/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent/20 transition-colors">
                                                    <span className="text-[10px] font-semibold text-accent">{i + 1}</span>
                                                </div>
                                                <p className="text-white/80 text-base leading-snug group-hover:text-white transition-colors">
                                                    {point}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Final Verse (High Tension Layout) */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative mt-24"
                            >
                                <div className="absolute -top-12 left-0 text-7xl font-serif text-accent/10 pointer-events-none select-none">"</div>
                                <div className="glass rounded-[3rem] p-10 border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative">
                                    <blockquote className="text-2xl font-serif italic text-white/95 mb-8 leading-tight text-center">
                                        {selectedTip.verse.text}
                                    </blockquote>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent mb-2" />
                                        <span className="text-xs font-bold text-accent uppercase tracking-[0.4em]">
                                            {selectedTip.verse.ref}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 right-0 text-7xl font-serif text-accent/10 pointer-events-none select-none translate-y-4">"</div>
                            </motion.div>

                        </div>
                    </motion.div>
                )}
                {/* --- VIEW: BIBLE STUDIES LIST --- */}
                {view === 'courses-list' && (
                    <motion.div
                        key="courses-list"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col pt-4"
                    >
                        <div className="px-6 pb-6 flex items-center justify-between sticky top-0 bg-[#0f172a]/80 backdrop-blur-3xl z-50 py-4">
                            <button onClick={goBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-xl font-serif font-semibold text-white italic tracking-tight">Cursos Bíblicos</h2>
                            <div className="w-12" />
                        </div>

                        <div className="px-6 space-y-6">
                            {BIBLE_STUDIES.map((study) => (
                                <motion.div
                                    key={study.id}
                                    variants={itemFadeUp}
                                    onClick={() => handleStudyClick(study)}
                                    className="relative group cursor-pointer"
                                >
                                    <div className={cn(
                                        "glass-dark rounded-[2rem] border p-6 overflow-hidden transition-all group-hover:border-emerald-500/30",
                                        completedStudies.includes(study.id) ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-white/5"
                                    )}>
                                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-10 rounded-full", study.color)} />

                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10", study.accent)}>
                                                <i className={cn(study.icon, "text-2xl")} />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{study.level}</span>
                                                <span className="text-emerald-400 text-xs font-semibold">{study.duration}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-serif font-semibold text-white mb-2">{study.title}</h3>
                                        <p className="text-white/40 text-sm leading-relaxed mb-4">{study.description}</p>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full transition-all duration-1000",
                                                    completedStudies.includes(study.id) ? "bg-emerald-500 w-full" : "bg-emerald-500/40 w-[5%]"
                                                )} />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-semibold uppercase",
                                                completedStudies.includes(study.id) ? "text-emerald-400" : "text-white/20"
                                            )}>
                                                {completedStudies.includes(study.id) ? 'Concluído' : 'Começar'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- VIEW: BIBLE STUDY DETAIL --- */}
                {view === 'course-detail' && selectedStudy && selectedLesson && (
                    <motion.div
                        key="course-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col min-h-screen"
                    >
                        <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-3xl">
                            <button onClick={goBack} className="w-12 h-12 rounded-full glass flex items-center justify-center text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] font-bold uppercase text-accent tracking-widest">{selectedStudy.title}</span>
                            <div className="w-12" />
                        </div>

                        <div className="px-8 pb-40">
                            {/* Lesson Navigation (Compact Horizontal Scroll) */}
                            <div className="flex gap-3 overflow-x-auto py-8 no-scrollbar">
                                {selectedStudy.lessons.map((lesson, idx) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setSelectedLesson(lesson)}
                                        className={cn(
                                            "shrink-0 px-6 py-3 rounded-2xl border text-xs font-semibold transition-all",
                                            selectedLesson.id === lesson.id
                                                ? "bg-emerald-500 border-emerald-400 text-black scale-105 shadow-lg shadow-emerald-500/20"
                                                : "bg-white/5 border-white/10 text-white/40"
                                        )}
                                    >
                                        Aula {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <motion.div
                                key={selectedLesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <h2 className="text-3xl font-serif font-semibold text-white mt-8 leading-tight italic">
                                    {selectedLesson.title}
                                </h2>

                                <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-emerald-500/10 relative">
                                    <Quote className="absolute -top-4 left-8 w-8 h-8 text-emerald-500/30" />
                                    <p className="text-xl font-serif italic text-white/90 leading-relaxed mb-4 text-center">
                                        "{selectedLesson.verse.text}"
                                    </p>
                                    <p className="text-center text-xs font-bold text-emerald-400/60 tracking-widest uppercase">
                                        {selectedLesson.verse.ref}
                                    </p>
                                </div>

                                <div className="prose prose-invert">
                                    <p className="text-white/70 text-lg leading-relaxed first-letter:text-5xl first-letter:text-emerald-500 first-letter:mr-2 first-letter:float-left">
                                        {selectedLesson.content}
                                    </p>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-3 h-3" /> Ponto de Reflexão
                                    </h4>
                                    <p className="text-white/80 font-medium italic">
                                        {selectedLesson.reflection}
                                    </p>
                                </div>

                                <button
                                    onClick={handleNextLesson}
                                    className="w-full py-5 rounded-[2rem] bg-emerald-500 text-black font-bold uppercase tracking-widest text-sm shadow-2xl shadow-emerald-500/20 active:scale-95 transition-transform"
                                >
                                    {selectedStudy.lessons.findIndex(l => l.id === selectedLesson.id) === selectedStudy.lessons.length - 1
                                        ? 'Finalizar Curso'
                                        : 'Próxima Lição'}
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* --- VIEW: COMMUNITY LIST --- */}
                {view === 'community-list' && (
                    <motion.div
                        key="community-list"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col pt-4"
                    >
                        <div className="px-6 pb-6 flex items-center justify-between sticky top-0 bg-[#0f172a]/80 backdrop-blur-3xl z-50 py-4">
                            <button onClick={goBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-xl font-serif font-semibold text-white italic tracking-tight">Comunidade</h2>
                            <div className="w-12" />
                        </div>

                        <div className="px-6 pb-20 space-y-12">
                            {/* Main Portal Card */}
                            <motion.div
                                variants={itemFadeUp}
                                onClick={() => handleGroupClick(COMMUNITY_DATA.main.link)}
                                className="relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-2xl rounded-[2.5rem] opacity-30 group-hover:opacity-50 transition-opacity" />
                                <div className="glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Users className="w-32 h-32 text-blue-400 rotate-12" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
                                        <i className="ri-global-line text-2xl" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-semibold text-white mb-2">{COMMUNITY_DATA.main.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed mb-6">{COMMUNITY_DATA.main.description}</p>
                                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-widest">
                                        Acessar Portal <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Categories Grid */}
                            {COMMUNITY_DATA.categories.map((cat) => (
                                <div key={cat.id} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl", cat.color, cat.accent)}>
                                            <i className={cn(cat.icon, "text-xl")} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-serif font-semibold text-white leading-none mb-1">{cat.title}</h4>
                                            <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{cat.description}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {cat.groups.map((group, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ x: 5 }}
                                                onClick={() => handleGroupClick(group.link)}
                                                className="glass-dark rounded-2xl border border-white/5 p-4 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all"
                                            >
                                                <div className="flex items-center gap-4 text-white/80 group-hover:text-white transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-400 transition-colors">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-semibold tracking-tight">{group.name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- RULE MODAL (Important Reminder) --- */}
            <AnimatePresence>
                {isRuleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRuleModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[320px] glass rounded-[2rem] p-6 border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-emerald-500/10 to-transparent" />

                            <div className="relative text-center">
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                    <Bell className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-serif font-semibold text-white mb-2">Compromisso de Respeito</h3>
                                <p className="text-white/60 text-[11px] mb-6 leading-relaxed">
                                    Esta é uma comunidade com propósito. Ao acessar o grupo, você concorda em se apresentar com:
                                </p>

                                <div className="glass-dark rounded-[2rem] p-5 mb-6 text-left space-y-3 border border-white/5">
                                    {[
                                        { icon: "📸", text: "Foto" },
                                        { icon: "💌", text: "Nome" },
                                        { icon: "🎂", text: "Idade" },
                                        { icon: "📍", text: "Cidade + Estado" },
                                        { icon: "💼", text: "Profissão" },
                                        { icon: "👪", text: "Tem filhos?" },
                                        { icon: "🙏", text: "Congregação/Igreja" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs">
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-white/40 text-sm mr-2">{item.icon}</span>
                                            <span className="text-white/80 text-sm font-semibold tracking-tight">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmJoinGroup}
                                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        Entendi e Aceito
                                    </button>
                                    <button
                                        onClick={() => setIsRuleModalOpen(false)}
                                        className="w-full py-4 text-white/40 font-semibold uppercase tracking-widest text-[10px] active:opacity-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <FeatureGateDialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
                title={upgradeData.title || (subscription?.tier === 'bronze' ? "Acesso à Comunidade" : "Conteúdo Ouro")}
                description={upgradeData.description || (subscription?.tier === 'bronze'
                    ? "O acesso aos nossos grupos exclusivos no WhatsApp é um benefício para membros do Plano Prata e Ouro."
                    : "Este conteúdo é exclusivo para membros do Plano Ouro.")
                }
                features={upgradeData.features.length > 0 ? upgradeData.features : (subscription?.tier === 'bronze'
                    ? [
                        "Acesso à Comunidade no WhatsApp",
                        "Curtidas Ilimitadas",
                        "Ver quem curtiu você",
                        "Filtro por cidade / região",
                        "Fotos e Áudios no Chat",
                        "Comunidade cristã no WhatsApp"
                    ]
                    : [
                        "Dicas de relacionamento cristão",
                        "Enviar mensagem sem curtir antes",
                        "Perfil em destaque",
                        "Ver perfis online recentemente",
                        "Filtros avançados (idade e distância)"
                    ])
                }
                icon={upgradeData.icon || <i className="ri-community-line text-4xl" />}
                price={upgradeData.price || 49.90}
                onUpgrade={(planData) => {
                    setSelectedCheckoutPlan({
                        id: planData.id,
                        name: planData.name,
                        price: planData.price
                    });
                    setShowUpgradeDialog(false);
                    setShowCheckoutManager(true);
                }}
            />

            {showCheckoutManager && selectedCheckoutPlan && (
                <CheckoutManager
                    key={`explore-checkout-v1-${selectedCheckoutPlan.id}`}
                    open={showCheckoutManager}
                    onOpenChange={(open) => {
                        setShowCheckoutManager(open);
                        if (!open) {
                            setTimeout(() => {
                                setSelectedCheckoutPlan(null);
                                setShowUpgradeDialog(true);
                            }, 50);
                        }
                    }}
                    planId={selectedCheckoutPlan.id}
                    planPrice={selectedCheckoutPlan.price}
                    planName={selectedCheckoutPlan.name}
                />
            )}
        </PageTransition>
    );
}
