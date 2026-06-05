import { execSync } from 'child_process';
try {
  console.log(execSync('unzip -v').toString());
} catch(e) {
  console.log('Error:', e.message);
}
