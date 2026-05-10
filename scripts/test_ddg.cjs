const https = require('https');
const q = encodeURIComponent('Paneer Butter Masala food');
https.get('https://html.duckduckgo.com/html/?q=' + q, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<img[^>]+src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^"]+)"/);
    if (match) console.log(decodeURIComponent(match[1]));
    else console.log('not found');
  });
});
