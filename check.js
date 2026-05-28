const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
for (let i = 0; i < scriptMatches.length; i++) {
  try {
    const scriptContent = scriptMatches[i][1];
    // Write to a temporary file
    fs.writeFileSync(`temp_script_${i}.js`, scriptContent);
    const { execSync } = require('child_process');
    execSync(`node -c temp_script_${i}.js`, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`Script ${i} syntax OK`);
  } catch (e) {
    console.error(`Script ${i} syntax ERROR:`, e.stderr || e.message);
  }
}
