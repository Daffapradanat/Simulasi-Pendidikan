const fs = require('fs');

let code = fs.readFileSync('src/frontend/views/SubjectSelectionView.tsx', 'utf8');

code = code.replace(
`const getSubjectStyles = (name: string) => {`,
`const getSubjectStyles = (subject: Subject) => {
  const name = subject.name;`
);

code = code.replace(
`        {subjects.map(subject => {
          const style = getSubjectStyles(subject.name);`,
`        {subjects.map(subject => {
          const style = getSubjectStyles(subject);
          const icon = subject.icon || style.icon;`
);

code = code.replace(
`              }}>
                <i className={\`ti \${style.icon}\`}></i>
              </div>`,
`              }}>
                <i className={\`ti \${icon}\`}></i>
              </div>`
);

fs.writeFileSync('src/frontend/views/SubjectSelectionView.tsx', code);
console.log('Patched SubjectSelectionView');
