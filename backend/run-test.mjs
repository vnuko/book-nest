import { spawn } from 'child_process';
import http from 'http';

console.log('Starting server...');

const server = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  cwd: process.cwd(),
  env: { ...process.env }
});

server.stdout.on('data', (data) => {
  console.log('SERVER:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.log('SERVER ERR:', data.toString().trim());
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  await new Promise(r => setTimeout(r, 6000));
  
  console.log('\n=== Testing Health ===');
  try {
    const health = await makeRequest('GET', '/health');
    console.log('Health:', health);
  } catch (e) {
    console.error('Health failed:', e.message);
    process.exit(1);
  }

  console.log('\n=== Starting Indexing ===');
  try {
    const result = await makeRequest('POST', '/api/indexing/start', { sourcePath: './source' });
    console.log('Indexing Result:', result);
  } catch (e) {
    console.error('Indexing failed:', e.message);
  }

  server.kill();
  process.exit(0);
}

main();
