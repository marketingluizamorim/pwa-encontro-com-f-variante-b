import { build } from 'vite';
try {
    await build();
    console.log('BUILD SUCCESS');
} catch (e) {
    console.log('=== ERROR MESSAGE ===');
    console.log(e.message);
    console.log('=== PLUGIN ERROR ===');
    if (e.plugin) console.log('Plugin:', e.plugin);
    if (e.errors) e.errors.forEach(x => console.log(JSON.stringify(x, null, 2)));
    console.log('=== STACK ===');
    console.log(e.stack?.split('\n').slice(0, 10).join('\n'));
    process.exit(1);
}
