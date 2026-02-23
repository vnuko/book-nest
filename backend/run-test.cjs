const { spawn } = require('child_process');
const http = require('http');

// Start server
const server = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
});

server.stdout.on('data', (data) => {
  console.log('SERVER OUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('SERVER ERR:', data.toString());
});

// Wait and test
setTimeout(() => {
  console.log('\n=== Testing endpoints ===\n');
  
  // Test health
  http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Health:', data);
      
      // Start indexing
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/indexing/start',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => data2 += chunk);
        res2.on('end', () => {
          console.log('Indexing:', data2);
          process.exit(0);
        });
      });
      req.write(JSON.stringify({ sourcePath: './source' }));
      req.end();
    });
  }).on('error', (e) => {
    console.log('Error:', e.message);
    process.exit(1);
  });
}, 6000);
