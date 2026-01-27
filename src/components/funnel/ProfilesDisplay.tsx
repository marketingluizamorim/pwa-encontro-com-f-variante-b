import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useFunnelStore, QuizAnswers } from '@/hooks/useFunnelStore';

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
interface ProfilesDisplayProps {
  gender: 'male' | 'female' | null;
  onViewPlans: () => void;
  onBack?: () => void;
}

// Get female photos based on age range from quiz
// Returns: [display photo (unblurred), blurred 1, blurred 2, blurred 3, extra 4, extra 5]
const getFemalePhotosByAge = (age: string | undefined): string[] => {
  switch (age) {
    case '18-25':
      return [femaleDisplay18_25, femaleAge18_25_1, femaleAge18_25_2, femaleAge18_25_3, femaleAge26_35_1, femaleAge26_35_2];
    case '26-35':
      return [femaleDisplay26_35, femaleAge26_35_1, femaleAge26_35_2, femaleAge26_35_3, femaleAge18_25_1, femaleAge36_55_1];
    case '36-55':
      return [femaleDisplay36_55, femaleAge36_55_1, femaleAge36_55_2, femaleAge36_55_3, femaleAge26_35_1, femaleAge56Plus1];
    case '56+':
      return [femaleDisplay56Plus, femaleAge56Plus1, femaleAge56Plus2, femaleAge56Plus3, femaleAge36_55_1, femaleAge36_55_2];
    default:
      return [femaleDisplay26_35, femaleAge26_35_1, femaleAge26_35_2, femaleAge26_35_3, femaleAge18_25_1, femaleAge36_55_1];
  }
};

// Get male photos based on age range from quiz
// Returns: [display photo (unblurred), blurred 1, blurred 2, blurred 3, extra 4, extra 5]
const getMalePhotosByAge = (age: string | undefined): string[] => {
  switch (age) {
    case '18-25':
      return [maleDisplay18_25, maleAge18_25_1, maleAge18_25_2, maleAge18_25_3, maleAge26_35_1, maleAge26_35_2];
    case '26-35':
      return [maleDisplay26_35, maleAge26_35_1, maleAge26_35_2, maleAge26_35_3, maleAge18_25_1, maleAge36_55_1];
    case '36-55':
      return [maleDisplay36_55, maleAge36_55_1, maleAge36_55_2, maleAge36_55_3, maleAge26_35_1, maleAge56Plus1];
    case '56+':
      return [maleDisplay56Plus, maleAge56Plus1, maleAge56Plus2, maleAge56Plus3, maleAge36_55_1, maleAge36_55_2];
    default:
      return [maleDisplay26_35, maleAge26_35_1, maleAge26_35_2, maleAge26_35_3, maleAge18_25_1, maleAge36_55_1];
  }
};

// Generate dynamic interests based on user's quiz answers
const generateMatchingInterests = (quizAnswers: QuizAnswers, profileIndex: number): string[] => {
  const interests: string[] = [];

  // Add religion-based interest
  if (quizAnswers.religion) {
    const religionInterests: Record<string, string[]> = {
      'Evangélica': ['Louvor', 'Comunidade', 'Jovens'],
      'Católica': ['Missa', 'Comunidade', 'Oração'],
      'Protestante': ['Estudo Bíblico', 'Missões', 'Comunidade'],
      'Adventista': ['Sábado', 'Saúde', 'Comunidade']
    };
    const options = religionInterests[quizAnswers.religion] || ['Comunidade'];
    interests.push(options[profileIndex % options.length]);
  }

  // Add goal-based interest
  if (quizAnswers.lookingFor) {
    const goalInterests: Record<string, string[]> = {
      'Casamento': ['Família', 'Compromisso', 'Valores'],
      'Namoro sério': ['Relacionamento', 'Companheirismo', 'Valores'],
      'Conhecer pessoas': ['Amizades', 'Comunidade', 'Eventos'],
      'Amizade': ['Amizades', 'Comunidade', 'Grupos']
    };
    const options = goalInterests[quizAnswers.lookingFor] || ['Valores'];
    interests.push(options[profileIndex % options.length]);
  }

  // Ensure we have at least 2 interests
  if (interests.length < 2) {
    const fallbackInterests = ['Música', 'Leitura', 'Oração', 'Família'];
    while (interests.length < 2) {
      const fallback = fallbackInterests[interests.length];
      if (!interests.includes(fallback)) {
        interests.push(fallback);
      }
    }
  }
  return interests.slice(0, 2);
};

// Get state abbreviation
const getStateAbbreviation = (state: string | undefined): string => {
  if (!state) return 'SP';
  const abbreviations: Record<string, string> = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO'
  };
  return abbreviations[state] || 'SP';
};

// Generate ages within the selected age range from quiz
const getAgesForRange = (ageRange: string | undefined): number[] => {
  switch (ageRange) {
    case '18-25':
      return [19, 22, 24, 21, 23, 20];
    case '26-35':
      return [28, 32, 27, 30, 29, 33];
    case '36-55':
      return [38, 45, 42, 48, 40, 52];
    case '56+':
      return [58, 62, 60, 65, 59, 63];
    default:
      return [28, 32, 27, 30, 29, 33];
  }
};

// Mock profile data with real photos based on user's age selection - now 6 profiles
const getProfiles = (gender: 'male' | 'female' | null, quizAnswers: QuizAnswers) => {
  const stateAbbr = getStateAbbreviation(quizAnswers.state);
  const ages = getAgesForRange(quizAnswers.age);
  const femalePhotos = getFemalePhotosByAge(quizAnswers.age);
  const malePhotos = getMalePhotosByAge(quizAnswers.age);

  // Female profiles (shown when user is male) - 6 profiles
  const femaleProfiles = [{
    name: 'Bruna',
    age: ages[0],
    distance: '4.7 km',
    photo: femalePhotos[0]
  }, {
    name: 'Amanda',
    age: ages[1],
    distance: '2.2 km',
    photo: femalePhotos[1]
  }, {
    name: 'Carolina',
    age: ages[2],
    distance: '6.4 km',
    photo: femalePhotos[2]
  }, {
    name: 'Juliana',
    age: ages[3],
    distance: '7.9 km',
    photo: femalePhotos[3]
  }, {
    name: 'Fernanda',
    age: ages[4],
    distance: '3.1 km',
    photo: femalePhotos[4]
  }, {
    name: 'Larissa',
    age: ages[5],
    distance: '5.6 km',
    photo: femalePhotos[5]
  }];

  // Male profiles (shown when user is female) - 6 profiles
  const maleProfiles = [{
    name: 'Lucas',
    age: ages[0],
    distance: '4.7 km',
    photo: malePhotos[0]
  }, {
    name: 'Gabriel',
    age: ages[1],
    distance: '2.2 km',
    photo: malePhotos[1]
  }, {
    name: 'Pedro',
    age: ages[2],
    distance: '6.4 km',
    photo: malePhotos[2]
  }, {
    name: 'Mateus',
    age: ages[3],
    distance: '7.9 km',
    photo: malePhotos[3]
  }, {
    name: 'Rafael',
    age: ages[4],
    distance: '3.1 km',
    photo: malePhotos[4]
  }, {
    name: 'Thiago',
    age: ages[5],
    distance: '5.6 km',
    photo: malePhotos[5]
  }];

  // Show opposite gender profiles
  const baseProfiles = gender === 'male' ? femaleProfiles : maleProfiles;
  return baseProfiles.map((profile, index) => ({
    ...profile,
    state: stateAbbr,
    interests: generateMatchingInterests(quizAnswers, index),
    unlocked: index === 0 // Only first profile is unlocked
  }));
};
export function ProfilesDisplay({
  gender,
  onViewPlans,
  onBack
}: ProfilesDisplayProps) {
  const {
    quizAnswers
  } = useFunnelStore();
  const profiles = getProfiles(gender, quizAnswers);
  return <div className="min-h-screen gradient-welcome relative overflow-hidden pb-48">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute w-64 h-64 rounded-full bg-white/5 blur-3xl" style={{
        top: '10%',
        left: '10%'
      }} animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }} />
        <motion.div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl" style={{
        bottom: '10%',
        right: '5%'
      }} animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.2, 0.4]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1
      }} />
      </div>

      {/* Header */}
      <div className="pt-8 pb-4 px-4 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-flex items-center gap-2 bg-foreground/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-3"
        >
          <span className="text-lg">👀</span>
          <span className="text-primary-foreground font-bold text-sm">
            Essas pessoas querem te conhecer
          </span>
        </motion.div>
        
        <motion.h1 initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-2xl font-display font-bold text-primary-foreground mb-2">
          Encontramos <span className="text-amber-light">{profiles.length} conexões</span>
        </motion.h1>
        <motion.p initial={{
        opacity: 0,
        y: -5
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="text-primary-foreground/80 text-base">
          Essas pessoas da sua cidade compartilham<br />valores parecidos com os seus
        </motion.p>
      </div>

      <div className="px-4">
        {/* Profiles grid - 2x3 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {profiles.map((profile, index) => <motion.div key={`${profile.name}-${index}`} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.08
        }} className="relative rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
              {/* Profile image */}
              <img src={profile.photo} alt={profile.name} className={`w-full h-full object-cover ${!profile.unlocked ? 'blur-md' : ''}`} />

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />

              {/* Distance badge - only on unlocked profiles */}
              {profile.unlocked && <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    <i className="ri-map-pin-line mr-1" />
                    {profile.distance}
                  </Badge>
                </div>}

              {/* Locked overlay */}
              {!profile.unlocked && <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="bg-foreground/30 backdrop-blur-sm rounded-xl p-4 text-center">
                    <i className="ri-lock-fill text-2xl text-primary-foreground mb-1 block" />
                    <p className="text-xs text-primary-foreground font-semibold">
                      Perfil Privado
                    </p>
                    <p className="text-[10px] text-primary-foreground/80">
                      Desbloqueie para ver
                    </p>
                  </div>
                </div>}

              {/* Profile info at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {profile.unlocked ? <>
                    <h3 className="font-bold text-primary-foreground text-lg">
                      {profile.name}, {profile.age}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-primary-foreground/90 mb-2">
                      <i className="ri-map-pin-line" />
                      <span>{profile.state}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {profile.interests.map(interest => <span key={interest} className="bg-foreground/30 backdrop-blur-sm text-primary-foreground text-[10px] px-2 py-1 rounded-full pointer-events-none select-none">
                          {interest}
                        </span>)}
                    </div>
                  </> : <>
                    <h3 className="font-semibold text-primary-foreground text-sm">
                      {profile.name}, {profile.age}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-primary-foreground/80">
                      <i className="ri-map-pin-line" />
                      <span>{profile.state} • {profile.distance}</span>
                    </div>
                  </>}
              </div>
            </motion.div>)}
        </div>

        {/* Locked profiles banner */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="flex justify-center">
          <div className="bg-white/30 backdrop-blur-lg rounded-lg px-8 py-3 text-center w-full max-w-sm">
            <p className="text-xs">
              <span className="font-bold" style={{
              color: '#1f2937'
            }}>+5 perfis bloqueados.</span>{' '}
              <span className="text-white">Clique no botão para <span className="text-amber-light font-semibold">desbloquear</span> e começar a conversar</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-24 pb-16 sm:pb-20 px-4 z-50 shadow-2xl">
        <div className="max-w-md mx-auto">
          <p className="text-center text-white text-xs sm:text-sm mb-2">
            <span className="inline-flex items-center gap-1" style={{
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.8)"
          }}>
              <i className="ri-user-heart-line"></i>
              Milhares de pessoas esperando por você
            </span>
          </p>
          <button onClick={onViewPlans} className="w-full max-w-lg mx-auto bg-gradient-to-r from-teal-500 to-amber-400 text-white py-3.5 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg font-bold shadow-2xl hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2">
            Ver Quem Quer Te Conhecer
            <i className="ri-arrow-right-line text-lg sm:text-xl"></i>
          </button>
        </div>
      </div>
    </div>;
}