import http from 'http';
http.get('http://0.0.0.0:3000/api/modules', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(JSON.parse(body).pop().games));
});
