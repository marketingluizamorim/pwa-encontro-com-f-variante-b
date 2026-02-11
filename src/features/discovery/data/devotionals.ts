
export interface Devotional {
    id: string;
    date: string;
    title: string;
    verse: {
        text: string;
        ref: string;
    };
    content: string;
    reflection: string;
    action: string;
    prayer: string;
}

export const LOCAL_DEVOTIONALS: Devotional[] = [
    {
        id: 'local-1',
        date: 'Diário',
        title: 'Misericórdias Renovadas',
        verse: {
            text: 'As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; renovam-se cada manhã. Grande é a tua fidelidade.',
            ref: 'Lamentações 3:22-23'
        },
        content: 'O amanhecer não é apenas um evento astronômico, é uma declaração de Deus. Ele está dizendo: "Eu te dou uma nova chance. O peso de ontem não precisa ser carregado hoje". Muitas vezes começamos o dia focados nas dívidas, nos erros e nas preocupações que restaram. Mas a Palavra nos convida a focar na fidelidade Daquele que sustenta o universo. Respirar hoje é a evidência de que a misericórdia de Deus ainda está ativa em sua vida.',
        reflection: 'O que do seu passado você ainda está tentando carregar para este novo dia? Deus já liberou a misericórdia necessária para você começar de novo agora.',
        action: 'Antes de começar sua rotina, respire fundo e declare: "Obrigado Senhor, por Tua misericórdia que se renova agora sobre mim".',
        prayer: 'Pai, eu Te agradeço por este novo dia. Entrego em Tuas mãos todas as minhas falhas de ontem e abraço a vida que Tu me dás hoje. Que eu caminhe consciente do Teu amor incondicional. Amém.'
    },
    {
        id: 'local-2',
        date: 'Diário',
        title: 'Caminhando com Propósito',
        verse: {
            text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.',
            ref: 'Salmo 119:105'
        },
        content: 'A vida cristã não é uma corrida de velocidade, mas uma caminhada de direção. Muitas vezes queremos ver o horizonte completo, mas Deus nos dá luz apenas para o próximo passo. Confiar no Senhor significa aceitar que Ele conhece o caminho completo e que Sua presença é tudo o que precisamos para avançar com segurança, mesmo em meio à incerteza.',
        reflection: 'Você tem buscado saber o destino final ou tem buscado a Companhia Daquele que conhece o caminho?',
        action: 'Escolha uma pequena decisão que você precisa tomar hoje e ore especificamente por direção bíblica para ela.',
        prayer: 'Senhor Jesus, seja a luz dos meus olhos e a direção dos meus passos. Eu não quero caminhar sozinho. Ensina-me a ouvir Tua voz nos detalhes do meu dia. Amém.'
    },
    {
        id: 'local-3',
        date: 'Diário',
        title: 'Renovação da Mente',
        verse: {
            text: 'E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.',
            ref: 'Romanos 12:2'
        },
        content: 'Nossa batalha espiritual começa na mente. O mundo tenta nos moldar com padrões de medo, escassez e egoísmo. Mas Deus nos chama para uma transformação que vem de dentro para fora. Renovar a mente é trocar as mentiras que ouvimos pelas verdades que Deus fala. Quando mudamos nossa forma de pensar, mudamos nossa forma de viver.',
        reflection: 'Que pensamentos negativos ou limitantes têm ocupado sua mente ultimamente?',
        action: 'Identifique um pensamento negativo recorrente e substitua-o por uma promessa bíblica hoje.',
        prayer: 'Senhor, renova minha mente. Ajuda-me a filtrar meus pensamentos através da Tua Palavra e a focar no que é verdadeiro e eterno. Amém.'
    },
    {
        id: 'local-4',
        date: 'Diário',
        title: 'Confiança Total',
        verse: {
            text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.',
            ref: 'Provérbios 3:5'
        },
        content: 'Nossa tendência humana é confiar no que podemos ver, controlar e explicar. Mas a fé nos chama para um nível mais profundo de segurança. Confiar de todo o coração significa soltar o controle, sabendo que Deus é mais sábio, mais forte e mais amoroso do que nós. Onde termina o nosso entendimento, começa a paz de Deus.',
        reflection: 'Em qual área da sua vida você está tendo dificuldade de soltar o controle?',
        action: 'Faça uma oração de entrega específica sobre algo que está te preocupando, dizendo: "Senhor, eu confio isso a Ti".',
        prayer: 'Pai, eu escolho confiar em Ti. Perdoa-me por tentar controlar tudo. Eu descanso na certeza de que Tu és Deus e eu não sou. Cuida do que eu não posso cuidar. Amém.'
    },
    {
        id: 'local-5',
        date: 'Diário',
        title: 'Paz na Tempestade',
        verse: {
            text: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
            ref: 'João 14:27'
        },
        content: 'A paz que o mundo oferece depende das circunstâncias estarem calmas. A paz que Jesus dá subsiste através da tempestade. É uma paz que guarda o coração, não pela ausência de problemas, mas pela presença do Príncipe da Paz. Não permita que o medo dite o ritmo do seu dia; permita que a paz de Cristo arbitre suas emoções.',
        reflection: 'O que está tirando a sua paz hoje? Entregue isso a Jesus agora.',
        action: 'Tire 5 minutos de silêncio hoje apenas para receber a paz de Deus, sem pedir nada, apenas descansando nEle.',
        prayer: 'Senhor Jesus, obrigado pela Tua paz que excede todo entendimento. Guarda meu coração e meus pensamentos em Ti. Eu rejeito o medo e recebo a Tua serenidade. Amém.'
    },
    {
        id: 'local-6',
        date: 'Diário',
        title: 'Força na Fraqueza',
        verse: {
            text: 'A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.',
            ref: '2 Coríntios 12:9'
        },
        content: 'Muitas vezes escondemos nossas fraquezas, pensando que elas nos desqualificam. Mas no Reino de Deus, nossa dependência é o convite para o poder dEle agir. Quando chegamos ao fim de nossas forças, encontramos o início da graça de Deus. Não tenha medo de admitir que precisa de ajuda; é na humildade que Deus nos exalta e fortalece.',
        reflection: 'Você tem tentado ser forte sozinho(a)?',
        action: 'Admita uma área de fraqueza para Deus hoje e peça que a graça dEle seja suficiente nela.',
        prayer: 'Deus, eu reconheço minha dependência de Ti. Eu não sou autossuficiente. Que o Teu poder se manifeste onde eu sou fraco. Eu me glorio na Tua graça. Amém.'
    },
    {
        id: 'local-7',
        date: 'Diário',
        title: 'Amor Inseparável',
        verse: {
            text: 'Porque estou certo de que, nem a morte, nem a vida... nem qualquer outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus nosso Senhor.',
            ref: 'Romanos 8:38-39'
        },
        content: 'A segurança do cristão não está em sua própria performance, mas no amor inabalável de Deus. Nada que você faça pode fazer Deus te amar mais, e nada que você faça pode fazer Ele te amar menos. Seu amor é uma aliança eterna, selada em Cristo. Viva hoje não para ganhar o amor de Deus, mas a partir da certeza de que você já é amado(a).',
        reflection: 'Você vive tentando "merecer" o amor de Deus ou vive como um filho(a) amado(a)?',
        action: 'Olhe-se no espelho e diga: "Eu sou amado(a) por Deus com um amor eterno e inseparável".',
        prayer: 'Pai, obrigado pelo Teu amor que nunca falha. Que essa certeza cure minhas inseguranças e me dê coragem para enfrentar qualquer desafio hoje. Eu sou Teu. Amém.'
    },
    {
        id: 'local-8',
        date: 'Diário',
        title: 'Alegria Constante',
        verse: {
            text: 'Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.',
            ref: 'Filipenses 4:4'
        },
        content: 'A alegria cristã não é baseada no que acontece conosco, mas em Quem está conosco. É uma decisão de focar na bondade de Deus mesmo quando a vida parece difícil. Não é ignorar a dor, mas escolher a esperança. A alegria do Senhor é a nossa força, e ela transborda quando reconhecemos as pequenas graças diárias.',
        reflection: 'O que você pode agradecer a Deus hoje, apesar dos problemas?',
        action: 'Anote três coisas simples pelas quais você é grato(a) hoje.',
        prayer: 'Senhor, enche meu coração com a Tua alegria. Que meu sorriso seja um reflexo da Tua presença em minha vida. Amém.'
    },
    {
        id: 'local-9',
        date: 'Diário',
        title: 'Sabedoria do Alto',
        verse: {
            text: 'E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente...',
            ref: 'Tiago 1:5'
        },
        content: 'Sabedoria é ver a vida através da perspectiva de Deus. O mundo nos dá informação, mas Deus nos dá discernimento. Quando não souber o que fazer, pare e peça. Deus não nos critica por nossas dúvidas; Ele nos convida a buscar a luz dEle para iluminar nossas decisões. A sabedoria divina traz paz e clareza.',
        reflection: 'Qual decisão está pesando no seu coração hoje? Já pediu sabedoria a Deus?',
        action: 'Ore especificamente por uma situação que exige discernimento, confiando que Deus responderá.',
        prayer: 'Pai, eu peço sabedoria. Abre meus olhos para ver o caminho que Tu tens para mim. Que eu não siga meus próprios impulsos, mas a Tua orientação. Amém.'
    },
    {
        id: 'local-10',
        date: 'Diário',
        title: 'O Poder da Palavra',
        verse: {
            text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.',
            ref: 'Salmo 119:105'
        },
        content: 'A Bíblia é o manual do nosso Criador para nossa alma. Em um mundo de opiniões confusas, a Palavra de Deus permanece firme. Ela nos corrige, nos consola e nos guia. Ler a Bíblia diariamente não é uma obrigação religiosa, é alimentar o espírito com a Verdade que nos liberta.',
        reflection: 'Quanto tempo você tem dedicado a ouvir a voz de Deus através das Escrituras?',
        action: 'Leia um capítulo de um Evangelho hoje e peça que Deus fale algo específico para seu coração.',
        prayer: 'Senhor, obrigado pela Tua Palavra. Que ela seja a luz que guia meus passos e o alimento que sustenta minha alma. Amém.'
    },
    {
        id: 'local-11',
        date: 'Diário',
        title: 'Identidade de Filho',
        verse: {
            text: 'Vejam que grande amor o Pai nos concedeu: sermos chamados filhos de Deus, o que de fato somos!',
            ref: '1 João 3:1'
        },
        content: 'Você não é definido pelos seus erros, nem pelo seu sucesso. Sua identidade mais profunda é ser amado(a) por Deus. Quando compreendemos que somos filhos(as) de um Rei, deixamos de buscar validação no mundo. Você tem um Pai que cuida de você, que te protege e que tem um futuro planejado especialmente para sua vida.',
        reflection: 'Você se sente realmente um(a) filho(a) de Deus ou ainda vive como um órfão espiritual?',
        action: 'Repita hoje: "Deus é meu Pai, eu sou Seu filho(a) amado(a)".',
        prayer: 'Pai querido, obrigado por me adotar em Tua família. Ajuda-me a caminhar com a dignidade e a paz de quem sabe quem é em Ti. Amém.'
    },
    {
        id: 'local-12',
        date: 'Diário',
        title: 'O Descanso da Alma',
        verse: {
            text: 'Venham a mim todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.',
            ref: 'Mateus 11:28'
        },
        content: 'Vivemos em um mundo que exige velocidade e performance constante. Mas Jesus nos convida ao descanso. Nem todo cansaço é físico; muitos são da alma. Entregar fardos a Jesus é o segredo para uma rotina leve. Ele não prometeu ausência de trabalho, mas a companhia dEle para carregar o jugo.',
        reflection: 'Qual peso você tem tentado carregar sozinho(a) hoje?',
        action: 'Pare por um instante e imagine-se entregando cada preocupação nas mãos de Jesus.',
        prayer: 'Jesus, eu venho a Ti. Estou cansado(a). Troco meu fardo pesado pelo Teu jugo leve. Dá descanso à minha alma hoje. Amém.'
    }
];
