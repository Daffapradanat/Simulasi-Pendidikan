const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/if \(\!fs\.existsSync\(PUBLIC_GAMES_DIR\)\) \{\n  fs\.mkdirSync\(PUBLIC_GAMES_DIR\, \{ recursive\: true \}\);\n\}/, 'try { if (!fs.existsSync(PUBLIC_GAMES_DIR)) { fs.mkdirSync(PUBLIC_GAMES_DIR, { recursive: true }); } } catch(e) {}');
content = content.replace(/if \(\!fs\.existsSync\(UPLOADS_DIR\)\) \{\n  fs\.mkdirSync\(UPLOADS_DIR\, \{ recursive\: true \}\);\n\}/, 'try { if (!fs.existsSync(UPLOADS_DIR)) { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } } catch(e) {}');
content = content.replace(/if \(\!fs\.existsSync\(BANNERS_DIR\)\) \{\n  fs\.mkdirSync\(BANNERS_DIR\, \{ recursive\: true \}\);\n\}\nif \(\!fs\.existsSync\(AVATAR_DIR\)\) \{\n  fs\.mkdirSync\(AVATAR_DIR\, \{ recursive\: true \}\);\n\}/, 'try { if (!fs.existsSync(BANNERS_DIR)) { fs.mkdirSync(BANNERS_DIR, { recursive: true }); } if (!fs.existsSync(AVATAR_DIR)) { fs.mkdirSync(AVATAR_DIR, { recursive: true }); } } catch(e) {}');
fs.writeFileSync('server.ts', content);
