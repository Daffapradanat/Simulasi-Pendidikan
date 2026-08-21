const fs = require('fs');
const path = require('path');

function replaceAlerts(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAlerts(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('alert(') && !fullPath.includes('Toast.tsx')) {
        let importPath = '';
        const depth = fullPath.split('/').length - 2; // src is 1, src/admin is 2
        
        let relPath = '';
        for (let i = 0; i < depth; i++) {
          relPath += '../';
        }
        if (depth === 0) relPath = './';
        importPath = `import { toast } from '${relPath}components/Toast';\n`;
        
        content = importPath + content;
        
        // Simple heuristic: if it says "berhasil" or "Semua modul", it's a success, else error
        content = content.replace(/alert\((['"`])(.*?)berhasil(.*?)['"`]\)/gi, 'toast.success($1$2berhasil$3$1)');
        content = content.replace(/alert\((['"`])(.*?)(mengosongkan|berhasil|Maksimal|Error|Gagal|Terjadi|Password|Format|Ukuran)(.*?)['"`]\)/gi, (match, quote, p1, p2, p3) => {
          if (p2.toLowerCase().includes('berhasil') || p1.toLowerCase().includes('berhasil') || p3.toLowerCase().includes('berhasil')) {
            return `toast.success(${quote}${p1}${p2}${p3}${quote})`;
          } else {
            return `toast.error(${quote}${p1}${p2}${p3}${quote})`;
          }
        });
        // Catch-alls for template strings or other patterns
        content = content.replace(/alert\(/g, 'toast.error(');
        
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceAlerts('./src');
