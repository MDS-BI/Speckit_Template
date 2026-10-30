import fs from " fs\;
const s=fs.readFileSync(\src/app.js\,\utf8\);
const m=s.match(/accent[^\\n\\r]{0,140}/gi);
if(m){ console.log(m.slice(-5).join(\\\n===\\n\)); } else { console.log(\none\); }
