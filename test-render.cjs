const fs = require('fs');
const code = fs.readFileSync('src/components/Leaderboard.tsx', 'utf8');
const babel = require('@babel/core');
try {
  babel.transformSync(code, { presets: ['@babel/preset-react', '@babel/preset-typescript'] });
  console.log("Syntax is perfectly valid");
} catch (e) {
  console.error("Syntax Error:", e.message);
}
