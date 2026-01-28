import { QuizAnswers } from "@/types/funnel";

// Female avatars by age range (shown to male users)
import femaleAge18_25_1 from '@/assets/match-female-18-25-1.jpg';
import femaleAge18_25_2 from '@/assets/match-female-18-25-2.jpg';
import femaleAge18_25_3 from '@/assets/match-female-18-25-3.jpg';
import femaleAge26_35_1 from '@/assets/match-female-26-35-1.jpg';
import femaleAge26_35_2 from '@/assets/match-female-26-35-2.jpg';
import femaleAge26_35_3 from '@/assets/match-female-26-35-3.jpg';
import femaleAge36_55_1 from '@/assets/match-female-36-55-1.jpg';
import femaleAge36_55_2 from '@/assets/match-female-36-55-2.jpg';
import femaleAge36_55_3 from '@/assets/match-female-36-55-3.jpg';
import femaleAge56Plus1 from '@/assets/match-female-56-plus-1.jpg';
import femaleAge56Plus2 from '@/assets/match-female-56-plus-2.jpg';
import femaleAge56Plus3 from '@/assets/match-female-56-plus-3.jpg';

// Female display photos (unblurred) - one per age range
import femaleDisplay18_25 from '@/assets/match-female-18-25-display.jpg';
import femaleDisplay26_35 from '@/assets/match-female-26-35-display.jpg';
import femaleDisplay36_55 from '@/assets/match-female-36-55-display.jpg';
import femaleDisplay56Plus from '@/assets/match-female-56-plus-display.jpg';

// Male avatars by age range (shown to female users)
import maleAge18_25_1 from '@/assets/match-male-18-25-1.jpg';
import maleAge18_25_2 from '@/assets/match-male-18-25-2.jpg';
import maleAge18_25_3 from '@/assets/match-male-18-25-3.jpg';
import maleAge26_35_1 from '@/assets/match-male-26-35-1.jpg';
import maleAge26_35_2 from '@/assets/match-male-26-35-2.jpg';
import maleAge26_35_3 from '@/assets/match-male-26-35-3.jpg';
import maleAge36_55_1 from '@/assets/match-male-36-55-1.jpg';
import maleAge36_55_2 from '@/assets/match-male-36-55-2.jpg';
import maleAge36_55_3 from '@/assets/match-male-36-55-3.jpg';
import maleAge56Plus1 from '@/assets/match-male-56-plus-1.jpg';
import maleAge56Plus2 from '@/assets/match-male-56-plus-2.jpg';
import maleAge56Plus3 from '@/assets/match-male-56-plus-3.jpg';

// Male display photos (unblurred) - one per age range
import maleDisplay18_25 from '@/assets/match-male-18-25-display.jpg';
import maleDisplay26_35 from '@/assets/match-male-26-35-display.jpg';
import maleDisplay36_55 from '@/assets/match-male-36-55-display.jpg';
import maleDisplay56Plus from '@/assets/match-male-56-plus-display.jpg';

const getFemalePhotosByAge = (age: string | undefined): string[] => {
    switch (age) {
        case '18-25': return [femaleDisplay18_25, femaleAge18_25_1, femaleAge18_25_2, femaleAge18_25_3, femaleAge26_35_1, femaleAge26_35_2];
        case '26-35': return [femaleDisplay26_35, femaleAge26_35_1, femaleAge26_35_2, femaleAge26_35_3, femaleAge18_25_1, femaleAge36_55_1];
        case '36-55': return [femaleDisplay36_55, femaleAge36_55_1, femaleAge36_55_2, femaleAge36_55_3, femaleAge26_35_1, femaleAge56Plus1];
        case '56+': return [femaleDisplay56Plus, femaleAge56Plus1, femaleAge56Plus2, femaleAge56Plus3, femaleAge36_55_1, femaleAge36_55_2];
        default: return [femaleDisplay26_35, femaleAge26_35_1, femaleAge26_35_2, femaleAge26_35_3, femaleAge18_25_1, femaleAge36_55_1];
    }
};

const getMalePhotosByAge = (age: string | undefined): string[] => {
    switch (age) {
        case '18-25': return [maleDisplay18_25, maleAge18_25_1, maleAge18_25_2, maleAge18_25_3, maleAge26_35_1, maleAge26_35_2];
        case '26-35': return [maleDisplay26_35, maleAge26_35_1, maleAge26_35_2, maleAge26_35_3, maleAge18_25_1, maleAge36_55_1];
        case '36-55': return [maleDisplay36_55, maleAge36_55_1, maleAge36_55_2, maleAge36_55_3, maleAge26_35_1, maleAge56Plus1];
        case '56+': return [maleDisplay56Plus, maleAge56Plus1, maleAge56Plus2, maleAge56Plus3, maleAge36_55_1, maleAge36_55_2];
        default: return [maleDisplay26_35, maleAge26_35_1, maleAge26_35_2, maleAge26_35_3, maleAge18_25_1, maleAge36_55_1];
    }
};

const generateMatchingInterests = (quizAnswers: QuizAnswers, _profileIndex: number): string[] => {
    const interests: string[] = [];
    if (quizAnswers.religion) interests.push(quizAnswers.religion);
    if (quizAnswers.lookingFor) interests.push(quizAnswers.lookingFor);
    if (interests.length < 3) {
        const fallback = quizAnswers.religion === 'Evangélica'
            ? ['Louvor', 'Célula', 'Bíblia']
            : ['Família', 'Oração', 'Fé', 'Jesus'];
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
        case '18-25': return [19, 22, 24, 21, 23, 20];
        case '26-35': return [28, 32, 27, 30, 29, 33];
        case '36-55': return [38, 45, 42, 48, 40, 52];
        case '56+': return [58, 62, 60, 65, 59, 63];
        default: return [28, 32, 27, 30, 29, 33];
    }
};

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
        { name: 'Larissa', age: ages[5], distance: '5.6 km', photo: femalePhotos[5] }
    ];

    const maleProfiles = [
        { name: 'Lucas', age: ages[0], distance: '4.7 km', photo: malePhotos[0] },
        { name: 'Gabriel', age: ages[1], distance: '2.2 km', photo: malePhotos[1] },
        { name: 'Pedro', age: ages[2], distance: '6.4 km', photo: malePhotos[2] },
        { name: 'Mateus', age: ages[3], distance: '7.9 km', photo: malePhotos[3] },
        { name: 'Rafael', age: ages[4], distance: '3.1 km', photo: malePhotos[4] },
        { name: 'Thiago', age: ages[5], distance: '5.6 km', photo: malePhotos[5] }
    ];

    const baseProfiles = gender === 'male' ? femaleProfiles : maleProfiles;
    return baseProfiles.map((profile, index) => ({
        ...profile,
        state: stateAbbr,
        city: quizAnswers.city || 'São Paulo',
        interests: generateMatchingInterests(quizAnswers, index),
        unlocked: index === 0
    }));
};
