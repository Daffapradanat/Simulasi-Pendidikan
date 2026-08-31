const fs = require('fs');
let code = fs.readFileSync('src/frontend/views/LoginView.tsx', 'utf8');

const parts = code.split(/  return \(\s*<div className="login-page">/g);
// We want to keep everything up to the first return block, and then append the correct return block once.

if (parts.length > 2) {
  // We have multiple return blocks
  const correctReturnBlock = `  return (
    <div className="login-page">` + parts[1]; // Wait, parts[1] might be the broken one or the right one
}
