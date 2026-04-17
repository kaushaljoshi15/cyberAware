const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY="?([^"\n\r]+)"?/);
if (!keyMatch) {
  console.log("No GEMINI_API_KEY found in .env");
  process.exit(1);
}
const key = keyMatch[1].trim();

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello" }] }]
      })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
