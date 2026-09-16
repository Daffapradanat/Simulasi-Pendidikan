const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

content = content.replace(/{\/\* Player moved \*\/}\n                          <\/div>\n                        <\/div>\n                      \)}/, '{/* Player moved */}');

fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
