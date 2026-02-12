-- Verificar o gênero do usuário alvo
SELECT 
    user_id,
    display_name,
    gender,
    email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.user_id = '1803e7e5-ba10-4698-827b-d8cc85735fcc';
