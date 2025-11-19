const axios = require('axios');

// Test CORS with different configurations
async function testCORS() {
  const testUrls = [
    'https://backend.harpaljob.com/api/cors-test',
    'https://backend.harpaljob.com/api/auth/login'
  ];

  const testOrigins = [
    'https://harpaljob-jobs-near-you.vercel.app',
    'https://frontend.harpaljob.com',
    'http://localhost:5173',
    'http://localhost:8080'
  ];

  console.log('🧪 Testing CORS Configuration...\n');

  for (const url of testUrls) {
    console.log(`📍 Testing URL: ${url}`);
    
    for (const origin of testOrigins) {
      try {
        console.log(`  🔍 Testing origin: ${origin}`);
        
        const response = await axios.get(url, {
          headers: {
            'Origin': origin,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
          timeout: 10000
        });
        
        console.log(`  ✅ SUCCESS - Status: ${response.status}`);
        console.log(`     Response: ${JSON.stringify(response.data, null, 2)}`);
        
      } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        if (error.response) {
          console.log(`     Status: ${error.response.status}`);
          console.log(`     Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
        }
      }
      console.log('');
    }
  }
}

// Test the login endpoint specifically
async function testLogin() {
  console.log('🔐 Testing Login Endpoint...\n');
  
  try {
    const response = await axios.post('https://backend.harpaljob.com/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Origin': 'https://harpaljob-jobs-near-you.vercel.app',
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      timeout: 10000
    });
    
    console.log('✅ Login endpoint accessible');
    console.log(`Status: ${response.status}`);
    
  } catch (error) {
    console.log('❌ Login endpoint failed');
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run tests
async function runTests() {
  await testCORS();
  await testLogin();
}

runTests().catch(console.error); 