const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

let startIndex = content.indexOf('{activeGameId !== null && (');
if (startIndex !== -1 && content.indexOf('id="webgl-simulation-player"', startIndex) !== -1) {
  let endIndex = content.indexOf(')}', content.indexOf('Game Belum Tersedia'));
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + '{/* Player moved */}\n' + content.substring(endIndex + 3);
    fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
    console.log("Successfully removed block");
  }
}
