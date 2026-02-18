export function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export function formatLastActive(lastActiveAt?: string, showOnline?: boolean, showLastActive?: boolean) {
    if (showOnline === false) return null;
    if (!lastActiveAt) return null;

    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    // Considere "Online" se ativo nos últimos 5 minutos
    if (diffInMinutes < 5) return 'Online';
    if (showLastActive === false) return 'Visto recentemente';

    if (diffInMinutes < 60) return `Visto há ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return 'Visto hoje';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Visto ontem';
    if (diffInDays < 7) return 'Visto esta semana';

    return 'Visto a algum tempo';
}
