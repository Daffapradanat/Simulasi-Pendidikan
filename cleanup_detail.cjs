const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

// Remove remaining states
content = content.replace(/const \[downloadingGame.*\n/g, '');
content = content.replace(/const \[downloadProgress.*\n/g, '');
content = content.replace(/const \[localGameSrc.*\n/g, '');
content = content.replace(/const getMimeType[\s\S]*?return types\[ext\] \|\| 'application\/octet-stream';\n  };\n/g, '');

// The useEffect that had the JSZip has been partially replaced. Let's find it.
content = content.replace(/\/\/ Player logic has been moved to SimulationPlayerView\.tsx/g, '');

fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
