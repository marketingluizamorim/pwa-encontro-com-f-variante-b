import { QuizAnswers } from "@/types/funnel";

// ─── Real bot UUIDs from the database ───────────────────────────────────────
// Female bots (shown to male users)
export const FEMALE_FUNNEL_BOTS = [
    // 18-25 range (9 bots)
    { id: '8f517b2a-e1f8-4c2c-bdd2-a5af0f3cbe56', name: 'Juliana', ageRange: '18-25' },
    { id: '97b2d8a6-6775-46a9-8345-7f66f2398605', name: 'Bruna', ageRange: '18-25' },
    { id: 'd5229a6d-5194-4a70-a69d-503528bc2ede', name: 'Larissa', ageRange: '18-25' },
    { id: '57a194d3-7753-429b-914e-40662166f6bf', name: 'Camila', ageRange: '18-25' },
    { id: '7ec107c6-7285-4059-b869-8dc2d982ef05', name: 'Vanessa', ageRange: '18-25' },
    { id: 'e041c226-0ef1-4b48-b132-a14cbb70d4ba', name: 'Beatriz', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0001-0001-000000000001', name: 'Isabela', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0001-0001-000000000002', name: 'Gabriela', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0001-0001-000000000003', name: 'Natália', ageRange: '18-25' },
    // 26-35 range (9 bots)
    { id: '64149ade-351e-4814-9a0d-c84839c7a7ca', name: 'Amanda', ageRange: '26-35' },
    { id: '078bfc3e-241c-4c8b-877a-3693b1123814', name: 'Rebeca', ageRange: '26-35' },
    { id: 'f21f9930-2084-4d16-946a-62e81e6b14b3', name: 'Fernanda', ageRange: '26-35' },
    { id: 'b497822e-07c8-437e-9e83-bac513e7ab99', name: 'Priscila', ageRange: '26-35' },
    { id: 'b4985418-abe7-4fc6-b1f6-8c64955f8310', name: 'Luana', ageRange: '26-35' },
    { id: '345ba593-7ac8-4bc5-901f-a52503b5cbd1', name: 'Daniela', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0002-0002-000000000001', name: 'Mariana', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0002-0002-000000000002', name: 'Caroline', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0002-0002-000000000003', name: 'Jéssica', ageRange: '26-35' },
    // 36-55 range (9 bots)
    { id: '26006097-3918-43d9-af0f-bba823538f36', name: 'Carolina', ageRange: '36-55' },
    { id: '46c9673c-f9d3-4b6d-bd5c-dfaa5f4b5454', name: 'Talita', ageRange: '36-55' },
    { id: 'd6914334-aa71-4bd0-add2-018a2d92efd3', name: 'Letícia', ageRange: '36-55' },
    { id: '75a62c48-613d-43a7-9856-eca9cae94a8d', name: 'Patrícia', ageRange: '36-55' },
    { id: '1617df4d-4fab-464a-b063-1ee496b24dfe', name: 'Soraia', ageRange: '36-55' },
    { id: '2458c24c-ce86-47d5-b616-e5e1892e20d1', name: 'Regina', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0003-0003-000000000001', name: 'Andréa', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0003-0003-000000000002', name: 'Simone', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0003-0003-000000000003', name: 'Cláudia', ageRange: '36-55' },
    // 56+ range (8 bots — full coverage for users 56+)
    { id: 'cce83ef9-c355-46d7-af1c-4ceaf4d3cdc8', name: 'Maria', ageRange: '56+' },
    { id: 'e42aba99-b319-4be5-a47b-792a16639e39', name: 'Sandra', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560001', name: 'Beatriz', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560002', name: 'Rosana', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560003', name: 'Eliane', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560004', name: 'Vera', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560005', name: 'Tereza', ageRange: '56+' },
    { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234560006', name: 'Lurdes', ageRange: '56+' },
];


// Male bots (shown to female users)
export const MALE_FUNNEL_BOTS = [
    // 18-25 range (9 bots)
    { id: 'b837f035-10e8-4e7d-81ae-418920c0a781', name: 'Gabriel', ageRange: '18-25' },
    { id: '189d38e0-ddc4-42ce-aeba-7b54b94d25c3', name: 'Lucas', ageRange: '18-25' },
    { id: 'f623beab-2a2c-4f88-b74e-5e38e556dd6f', name: 'André', ageRange: '18-25' },
    { id: '05a650f6-a420-4816-bc6a-fa7cf5367ac0', name: 'João', ageRange: '18-25' },
    { id: '14a74979-2b05-4c30-9730-ec7a0e8a4d9c', name: 'Vitor', ageRange: '18-25' },
    { id: 'ef9c737c-71c7-427b-97dd-35a21d45117c', name: 'Diego', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0004-0004-000000000001', name: 'Henrique', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0004-0004-000000000002', name: 'Thiago', ageRange: '18-25' },
    { id: 'c2d3e4f5-0000-0004-0004-000000000003', name: 'Rodrigo', ageRange: '18-25' },
    // 26-35 range (9 bots)
    { id: '8274a79f-073d-4417-b0b0-6b609cd8aa81', name: 'Pedro', ageRange: '26-35' },
    { id: '899e3661-5c53-4626-b3d0-e3244c6e42c5', name: 'Mateus', ageRange: '26-35' },
    { id: 'a4fb49e9-63b1-4b8e-9595-511c42ba7d67', name: 'Rafael', ageRange: '26-35' },
    { id: '89f16352-6277-4689-bd3c-bd73efbf3aa3', name: 'Felipe', ageRange: '26-35' },
    { id: '162f9e97-2bf4-4d77-ae2d-b0d73bb99902', name: 'Carlos', ageRange: '26-35' },
    { id: '93d35964-4586-4ae4-a692-0286de2a2fbd', name: 'Bruno', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0005-0005-000000000001', name: 'Leandro', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0005-0005-000000000002', name: 'Gustavo', ageRange: '26-35' },
    { id: 'c2d3e4f5-0000-0005-0005-000000000003', name: 'Renato', ageRange: '26-35' },
    // 36-55 range (9 bots)
    { id: 'cab812c5-fa56-453f-be4e-0611bbc3547f', name: 'Hugo', ageRange: '36-55' },
    { id: '6c2b02cd-a2da-46b0-8be8-6e7935f78137', name: 'Daniel', ageRange: '36-55' },
    { id: '16df381d-9af3-41d2-b544-37b872bf8df9', name: 'Robson', ageRange: '36-55' },
    { id: '1d46109a-34b4-45de-9ecf-2d8b17ee3be8', name: 'Marcos', ageRange: '36-55' },
    { id: '833fd769-7dc0-4ce7-b24f-b5b1559df8c2', name: 'Fernando', ageRange: '36-55' },
    { id: 'bd69597b-ec63-45ef-831c-a52bc2a77360', name: 'Eduardo', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0006-0006-000000000001', name: 'Wellington', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0006-0006-000000000002', name: 'Gilberto', ageRange: '36-55' },
    { id: 'c2d3e4f5-0000-0006-0006-000000000003', name: 'Nelson', ageRange: '36-55' },
    // 56+ range (9 bots)
    { id: '04f6a6d4-11b8-4202-8989-8debf1f49511', name: 'Thiago', ageRange: '56+' },
    { id: '966176ab-715d-4efc-8bd8-21ada2ff75cd', name: 'Benedito', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000001', name: 'Antônio', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000002', name: 'José', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000003', name: 'Luiz', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000004', name: 'Carlos', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000005', name: 'Roberto', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000006', name: 'Paulo', ageRange: '56+' },
    { id: 'c2d3e4f5-0000-0007-0007-000000000007', name: 'Sebastião', ageRange: '56+' },
];

export const FEMALE_FUNNEL_BOT_IDS = FEMALE_FUNNEL_BOTS.map(b => b.id);
export const MALE_FUNNEL_BOT_IDS = MALE_FUNNEL_BOTS.map(b => b.id);
export const ALL_FUNNEL_BOT_IDS = [...FEMALE_FUNNEL_BOT_IDS, ...MALE_FUNNEL_BOT_IDS];

/**
 * Returns bot IDs that should auto-like a user of a given age.
 *
 * REALISTIC strategy (mimics how real people behave):
 *  - 18-25 → bots 18-30  (young generation)
 *  - 26-35 → bots 22-45  (±10 years)
 *  - 36-55 → bots 30-65  (broader mid-life)
 *  - 56+   → bots 50+    (same mature generation — no 37-yr-olds liking a 69-yr-old)
 *
 * Cap: 6 bots per user for good variety.
 */
export function getBotsForAgeRange(
    userAge: number,
    botList: Array<{ id: string; name: string; ageRange: string }>
): string[] {
    let eligibleRanges: string[];

    if (userAge <= 25) {
        // 18-25 user → likes from 18-25 bots (same generation, ±5 years)
        eligibleRanges = ['18-25'];
    } else if (userAge <= 35) {
        // 26-35 user → likes from 18-25 and 26-35 (±10 years)
        eligibleRanges = ['18-25', '26-35'];
    } else if (userAge <= 55) {
        // 36-55 user → likes from 26-35 and 36-55 (mid-life range)
        eligibleRanges = ['26-35', '36-55'];
    } else {
        // 56+ user → likes ONLY from 36-55 and 56+ (mature, realistic)
        // 50+ minimum: 36-55 bots include ages 36-55, but we prefer 56+
        eligibleRanges = ['36-55', '56+'];
    }

    const primary = userAge <= 25 ? '18-25'
        : userAge <= 35 ? '26-35'
            : userAge <= 55 ? '36-55'
                : '56+';

    // Primary bots first, then adjacent to fill up to 6
    const primaryBots = botList.filter(b => b.ageRange === primary).map(b => b.id);
    const adjacentBots = botList
        .filter(b => eligibleRanges.includes(b.ageRange) && b.ageRange !== primary)
        .map(b => b.id);

    const result = [...primaryBots];
    for (const id of adjacentBots) {
        if (result.length >= 6) break;
        result.push(id);
    }
    return result;
}


// ─── Fixed photo assignment per bot UUID ─────────────────────────────────────
// Each bot gets ONE specific photo that never changes, regardless of who is
// viewing or what age range they prefer. This guarantees consistency across
// Discover, Likes, Matches, Chat index, and Chat room.
export const BOT_PHOTO_MAP: Record<string, string> = {
    // ─ Female 18-25 ─
    '8f517b2a-e1f8-4c2c-bdd2-a5af0f3cbe56': '/assets/matches/match-female-18-25-display.jpg', // Juliana, 18
    '97b2d8a6-6775-46a9-8345-7f66f2398605': '/assets/matches/match-female-18-25-1.jpg',       // Bruna, 22
    'd5229a6d-5194-4a70-a69d-503528bc2ede': '/assets/matches/match-female-18-25-2.jpg',       // Larissa, 20
    '57a194d3-7753-429b-914e-40662166f6bf': '/assets/matches/match-female-18-25-3.jpg',       // Camila, 21
    '7ec107c6-7285-4059-b869-8dc2d982ef05': '/assets/matches/match-female-18-25-4.jpg',       // Vanessa, 23
    'e041c226-0ef1-4b48-b132-a14cbb70d4ba': '/assets/matches/match-female-18-25-5.jpg',       // Beatriz, 19
    // ─ Female 26-35 ─
    '64149ade-351e-4814-9a0d-c84839c7a7ca': '/assets/matches/match-female-26-35-display.jpg', // Amanda, 30
    '078bfc3e-241c-4c8b-877a-3693b1123814': '/assets/matches/match-female-26-35-1.jpg',       // Rebeca, 28
    'f21f9930-2084-4d16-946a-62e81e6b14b3': '/assets/matches/match-female-26-35-2.jpg',       // Fernanda, 26
    'b497822e-07c8-437e-9e83-bac513e7ab99': '/assets/matches/match-female-26-35-3.jpg',       // Priscila, 29
    'b4985418-abe7-4fc6-b1f6-8c64955f8310': '/assets/matches/match-female-26-35-4.jpg',       // Luana, 33
    '345ba593-7ac8-4bc5-901f-a52503b5cbd1': '/assets/matches/match-female-26-35-5.jpg',       // Daniela, 27
    // ─ Female 36-55 ─
    '26006097-3918-43d9-af0f-bba823538f36': '/assets/matches/match-female-36-55-display.jpg', // Carolina, 37
    '46c9673c-f9d3-4b6d-bd5c-dfaa5f4b5454': '/assets/matches/match-female-36-55-1.jpg',       // Talita, 41
    'd6914334-aa71-4bd0-add2-018a2d92efd3': '/assets/matches/match-female-36-55-2.jpg',       // Letícia, 46
    '75a62c48-613d-43a7-9856-eca9cae94a8d': '/assets/matches/match-female-36-55-3.jpg',       // Patrícia, 44
    '1617df4d-4fab-464a-b063-1ee496b24dfe': '/assets/matches/match-female-36-55-4.jpg',       // Soraia, 39
    '2458c24c-ce86-47d5-b616-e5e1892e20d1': '/assets/matches/match-female-36-55-5.jpg',       // Regina, 55
    // ─ Female 56+ ─
    'cce83ef9-c355-46d7-af1c-4ceaf4d3cdc8': '/assets/matches/match-female-56-plus-display.jpg', // Maria, 58
    'e42aba99-b319-4be5-a47b-792a16639e39': '/assets/matches/match-female-56-plus-1.jpg',        // Sandra, 62
    'b1a2c3d4-e5f6-7890-abcd-ef1234560001': '/assets/matches/match-female-56-plus-3.jpg',        // Beatriz, 60
    'b1a2c3d4-e5f6-7890-abcd-ef1234560002': '/assets/matches/match-female-56-plus-4.jpg',        // Rosana, 57
    'b1a2c3d4-e5f6-7890-abcd-ef1234560003': '/assets/matches/match-female-56-plus-5.jpg',        // Eliane, 63
    'b1a2c3d4-e5f6-7890-abcd-ef1234560004': '/assets/matches/match-female-56-plus-6.jpg',        // Vera, 59
    'b1a2c3d4-e5f6-7890-abcd-ef1234560005': '/assets/matches/match-female-56-plus-7.jpg',        // Tereza, 65
    'b1a2c3d4-e5f6-7890-abcd-ef1234560006': '/assets/matches/match-female-56-plus-8.jpg',        // Lurdes, 61
    'b1a2c3d4-e5f6-7890-abcd-ef1234560007': '/assets/matches/match-female-56-plus-2.jpg',        // Nair, 64

    // ─ Female 18-25 extra ─
    'c2d3e4f5-0000-0001-0001-000000000001': '/assets/matches/match-female-18-25-6.jpg',        // Isabela, 22
    'c2d3e4f5-0000-0001-0001-000000000002': '/assets/matches/match-female-18-25-7.jpg',        // Gabriela, 23
    'c2d3e4f5-0000-0001-0001-000000000003': '/assets/matches/match-female-18-25-8.jpg',        // Natália, 23
    // ─ Female 26-35 extra ─
    'c2d3e4f5-0000-0002-0002-000000000001': '/assets/matches/match-female-26-35-6.jpg',        // Mariana, 30
    'c2d3e4f5-0000-0002-0002-000000000002': '/assets/matches/match-female-26-35-7.jpg',        // Caroline, 32
    'c2d3e4f5-0000-0002-0002-000000000003': '/assets/matches/match-female-26-35-8.jpg',        // Jéssica, 35
    // ─ Female 36-55 extra ─
    'c2d3e4f5-0000-0003-0003-000000000001': '/assets/matches/match-female-36-55-6.jpg',        // Andréa, 42
    'c2d3e4f5-0000-0003-0003-000000000002': '/assets/matches/match-female-36-55-7.jpg',        // Simone, 46
    'c2d3e4f5-0000-0003-0003-000000000003': '/assets/matches/match-female-36-55-8.jpg',        // Cláudia, 50
    // ─ Male 18-25 ─
    'b837f035-10e8-4e7d-81ae-418920c0a781': '/assets/matches/match-male-18-25-display.jpg',   // Gabriel, 23
    '189d38e0-ddc4-42ce-aeba-7b54b94d25c3': '/assets/matches/match-male-18-25-1.jpg',         // Lucas, 21
    'f623beab-2a2c-4f88-b74e-5e38e556dd6f': '/assets/matches/match-male-18-25-2.jpg',         // André, 19
    '05a650f6-a420-4816-bc6a-fa7cf5367ac0': '/assets/matches/match-male-18-25-3.jpg',         // João, 22
    '14a74979-2b05-4c30-9730-ec7a0e8a4d9c': '/assets/matches/match-male-18-25-4.jpg',         // Vitor, 20
    'ef9c737c-71c7-427b-97dd-35a21d45117c': '/assets/matches/match-male-18-25-5.jpg',         // Diego, 24
    'c2d3e4f5-0000-0004-0004-000000000001': '/assets/matches/match-male-18-25-6.jpg',          // Henrique, 23
    'c2d3e4f5-0000-0004-0004-000000000002': '/assets/matches/match-male-18-25-7.jpg',          // Thiago, 25
    'c2d3e4f5-0000-0004-0004-000000000003': '/assets/matches/match-male-18-25-8.jpg',          // Rodrigo, 22
    // ─ Male 26-35 ─
    '8274a79f-073d-4417-b0b0-6b609cd8aa81': '/assets/matches/match-male-26-35-display.jpg',   // Pedro, 27
    '899e3661-5c53-4626-b3d0-e3244c6e42c5': '/assets/matches/match-male-26-35-1.jpg',         // Mateus, 31
    'a4fb49e9-63b1-4b8e-9595-511c42ba7d67': '/assets/matches/match-male-26-35-2.jpg',         // Rafael, 33
    '89f16352-6277-4689-bd3c-bd73efbf3aa3': '/assets/matches/match-male-26-35-3.jpg',         // Felipe, 28
    '162f9e97-2bf4-4d77-ae2d-b0d73bb99902': '/assets/matches/match-male-26-35-4.jpg',         // Carlos, 32
    '93d35964-4586-4ae4-a692-0286de2a2fbd': '/assets/matches/match-male-26-35-5.jpg',         // Bruno, 30
    'c2d3e4f5-0000-0005-0005-000000000001': '/assets/matches/match-male-26-35-6.jpg',          // Leandro, 29
    'c2d3e4f5-0000-0005-0005-000000000002': '/assets/matches/match-male-26-35-7.jpg',          // Gustavo, 33
    'c2d3e4f5-0000-0005-0005-000000000003': '/assets/matches/match-male-26-35-8.jpg',          // Renato, 36
    // ─ Male 36-55 ─
    'cab812c5-fa56-453f-be4e-0611bbc3547f': '/assets/matches/match-male-36-55-display.jpg',   // Hugo, 39
    '6c2b02cd-a2da-46b0-8be8-6e7935f78137': '/assets/matches/match-male-36-55-1.jpg',         // Daniel, 44
    '16df381d-9af3-41d2-b544-37b872bf8df9': '/assets/matches/match-male-36-55-3.jpg',         // Robson, 46
    '1d46109a-34b4-45de-9ecf-2d8b17ee3be8': '/assets/matches/match-male-36-55-4.jpg',         // Marcos, 51
    '833fd769-7dc0-4ce7-b24f-b5b1559df8c2': '/assets/matches/match-male-36-55-2.jpg',         // Fernando, 42
    'bd69597b-ec63-45ef-831c-a52bc2a77360': '/assets/matches/match-male-36-55-5.jpg',         // Eduardo, 48
    'c2d3e4f5-0000-0006-0006-000000000001': '/assets/matches/match-male-36-55-6.jpg',          // Wellington, 45
    'c2d3e4f5-0000-0006-0006-000000000002': '/assets/matches/match-male-36-55-7.jpg',          // Gilberto, 49
    'c2d3e4f5-0000-0006-0006-000000000003': '/assets/matches/match-male-36-55-8.jpg',          // Nelson, 53
    // ─ Male 56+ ─
    '04f6a6d4-11b8-4202-8989-8debf1f49511': '/assets/matches/match-male-56-plus-display.jpg', // Thiago, 57
    '966176ab-715d-4efc-8bd8-21ada2ff75cd': '/assets/matches/match-male-56-plus-1.jpg',       // Benedito, 61
    'c2d3e4f5-0000-0007-0007-000000000001': '/assets/matches/match-male-56-plus-2.jpg',        // Antônio, 60
    'c2d3e4f5-0000-0007-0007-000000000002': '/assets/matches/match-male-56-plus-3.jpg',        // José, 63
    'c2d3e4f5-0000-0007-0007-000000000003': '/assets/matches/match-male-56-plus-4.jpg',        // Luiz, 66
    'c2d3e4f5-0000-0007-0007-000000000004': '/assets/matches/match-male-56-plus-5.jpg',        // Carlos, 69
    'c2d3e4f5-0000-0007-0007-000000000005': '/assets/matches/match-male-56-plus-6.jpg',        // Roberto, 62
    'c2d3e4f5-0000-0007-0007-000000000006': '/assets/matches/match-male-56-plus-7.jpg',        // Paulo, 65
    'c2d3e4f5-0000-0007-0007-000000000007': '/assets/matches/match-male-56-plus-8.jpg',        // Sebastião, 68
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
        christian_interests: ['Ministério', 'Intercessão', 'Comunhão'],
        state: 'São Paulo',
        city: 'São Paulo'
    },
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
        name: 'Carolina',
        bio: 'Acredito que Deus tem um plano lindo guardado para mim. Adoro viagens, música gospel e momentos em família. 🌿',
        occupation: 'Designer',
        religion: 'Católica',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Já tenho e quero more',
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
        pets: 'Tenho cachorro(s)',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Comunhão', 'Liderança', 'Serviço', 'Família'],
        state: 'Ceará',
        city: 'Fortaleza'
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
        name: 'Felipe',
        bio: 'Dedicado ao trabalho e ao reino. Busco uma parceira para dividir a vida e crescer espiritualmente juntos.',
        occupation: 'Arquiteto',
        religion: 'Protestante',
        church_frequency: 'Às vezes',
        looking_for: 'Relacionamento sério',
        about_children: 'Desejo ter filhos',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Moderado',
        pets: 'Não tenho pets',
        languages: ['Português', 'Inglês'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Teologia', 'Missões', 'Célula', 'Música'],
        state: 'Pernambuco',
        city: 'Recife'
    },
    {
        name: 'Mateus',
        bio: 'Alegre e temente a Deus. Valorizo a lealdade e a sinceridade em todas as áreas da vida.',
        occupation: 'Professor de Educação Física',
        religion: 'Evangélica',
        church_frequency: 'Sim, sou ativo(a)',
        looking_for: 'Relacionamento sério',
        about_children: 'Ainda não decidi',
        education: 'Ensino Superior Completo',
        drink: 'Não bebo',
        smoke: 'Não fumo',
        physical_activity: 'Frequente',
        pets: 'Tenho cachorro(s)',
        languages: ['Português'],
        values_importance: 'Sim, é essencial',
        christian_interests: ['Louvor', 'Devocional', 'Acampamento', 'Social'],
        state: 'Paraná',
        city: 'Curitiba'
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
 * Enriches a bot profile with static metadata for display consistency.
 *
 * PHOTO STRATEGY:
 * Each bot UUID maps to ONE fixed photo via BOT_PHOTO_MAP above.
 * This guarantees the same face appears in Discover, Likes, Chat list,
 * Chat room, and expanded profile views — because the photo is determined
 * solely by the bot's identity, never by who is viewing.
 *
 * The `userAgeRange` param is kept for API compatibility but is no longer
 * used for photo selection.
 */
export const enrichBotProfile = (profile: any, _userAgeRange?: string) => {
    if (!profile) return profile;
    const isKnownBot = profile.is_bot || ALL_FUNNEL_BOT_IDS.includes(profile.user_id);
    if (!isKnownBot) return profile;


    // 1. Calculate the bot's real display age from birth_date
    let ageValue = 28;
    if (profile.birth_date) {
        const birthDate = new Date(profile.birth_date);
        const today = new Date();
        ageValue = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageValue--;
    }

    // 2. Resolve gender with safe fallback
    const botGender = profile.gender === 'male' || profile.gender === 'female'
        ? profile.gender as 'male' | 'female'
        : 'female';
    const extrasList = botGender === 'female' ? FEMALE_EXTRA : MALE_EXTRA;

    // 3. Match static extra data by display_name
    let index = extrasList.findIndex(e => e.name === profile.display_name);
    if (index === -1) index = 0;
    const extra = extrasList[index] || extrasList[0] || {};

    // 4. Look up the fixed photo for this bot UUID
    //    Fallback: first photo of the bot's own age-range folder
    const fixedPhoto = BOT_PHOTO_MAP[profile.user_id] || (() => {
        const range = ageValue <= 25 ? '18-25' : ageValue <= 35 ? '26-35' : ageValue <= 55 ? '36-55' : '56-plus';
        return `/assets/matches/match-${botGender}-${range}-display.jpg`;
    })();




    // 5. Assemble the final enriched profile
    return {
        ...profile,
        ...extra,
        birth_date: profile.birth_date,  // preserved explicitly — required for age filter in Curtidas
        age: ageValue,
        photos: [fixedPhoto],
        avatar_url: fixedPhoto,
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

// getProfilesData removed (deprecated) — use enrichBotProfile instead.

