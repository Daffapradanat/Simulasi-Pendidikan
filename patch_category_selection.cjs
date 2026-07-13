const fs = require('fs');

let code = fs.readFileSync('src/frontend/views/CategorySelectionView.tsx', 'utf8');

code = code.replace(
`                <i className="ti ti-school"></i>`,
`                <i className={\`ti \${cat.icon || 'ti-school'}\`}></i>`
);

fs.writeFileSync('src/frontend/views/CategorySelectionView.tsx', code);
console.log('Patched CategorySelectionView');
