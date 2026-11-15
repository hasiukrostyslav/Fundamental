import fs from 'fs';

fs.rmSync('public', { recursive: true, force: true });
fs.mkdirSync('public/src', { recursive: true });

fs.cpSync('src/index.html', 'public/src/index.html');
fs.cpSync('src/html', 'public/src/html', { recursive: true });
fs.cpSync('src/assets', 'public/src/assets', { recursive: true });
fs.cpSync('dist', 'public/dist', { recursive: true });

console.log('Site is ready in the public folder');
