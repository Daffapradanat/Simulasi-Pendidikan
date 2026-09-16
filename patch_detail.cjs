const fs = require('fs');
let content = fs.readFileSync('src/frontend/views/DetailView.tsx', 'utf8');

// Remove JSZip import
content = content.replace("import JSZip from 'jszip';\n", "");

// Replace the states and JSZip logic
content = content.replace(
  /const \[downloadingGame[\s\S]*?}, \[activeGameId, module\.games\]\);/,
  `// Player logic has been moved to SimulationPlayerView.tsx`
);

// Remove the rendering of webgl-simulation-player block
content = content.replace(
  /{activeGameId !== null && \([\s\S]*?<div id="webgl-simulation-player"[\s\S]*?\) : null\n                            \) : \(\n                              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>\n                                <i className="ti ti-device-gamepad-2" style={{ fontSize: '36px', marginBottom: '8px', display: 'block', color: '#475569' }}><\/i>\n                                <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#f8fafc' }}>Game Belum Tersedia<\/p>\n                              <\/div>\n                            \)}\n                          <\/div>\n                        <\/div>\n                      \)}/,
  `{/* Player moved to full screen */}`
);

fs.writeFileSync('src/frontend/views/DetailView.tsx', content);
