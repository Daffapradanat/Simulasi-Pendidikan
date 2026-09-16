const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update handleLaunchGame
content = content.replace(
  /const handleLaunchGame =[\s\S]*?setActiveGameId\(id\);\n  };/,
  `const handleLaunchGame = (id: number, title: string) => {
    setActiveGameId(id);
    setViewMode('player');
  };`
);

// Insert player view rendering
const playerBlock = `
                {viewMode === 'player' && activeGameId !== null && (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, background: '#000' }}>
                    <SimulationPlayerView 
                      game={currentModule?.games?.find(g => g.id === activeGameId) as any}
                      onBack={() => {
                        setViewMode('main');
                      }}
                    />
                  </motion.div>
                )}
`;

content = content.replace('              </AnimatePresence>', playerBlock + '\n              </AnimatePresence>');

fs.writeFileSync('src/App.tsx', content);
