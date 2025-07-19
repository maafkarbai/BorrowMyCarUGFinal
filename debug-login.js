// Debug script to test login without remember me
import axios from 'axios';

const API_BASE = 'http://localhost:50001/api';

async function testLogin() {
  try {
    console.log('🧪 Testing login without remember me...');
    
    // Using test user from seedData.js
    const loginData = {
      email: 'ahmed@test.com',   // From seedData.js
      password: 'password123',   // From seedData.js
      rememberMe: false
    };
    
    console.log('📤 Sending login request:', {
      email: loginData.email,
      rememberMe: loginData.rememberMe
    });
    
    const response = await axios.post(`${API_BASE}/auth/login`, loginData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
    console.log('🍪 Response cookies:', response.headers['set-cookie']);
    
    // Check what we got back
    const { data } = response;
    const hasToken = !!(data.token || data.data?.token);
    const hasUser = !!(data.user || data.data?.user);
    
    console.log('🔍 Analysis:');
    console.log('  - Has token:', hasToken);
    console.log('  - Has user:', hasUser);
    console.log('  - Success flag:', data.success);
    
    if (hasToken && hasUser) {
      console.log('✅ Login response format is correct');
    } else {
      console.log('❌ Login response format is INCORRECT');
      console.log('  - Expected: { token, user } or { data: { token, user } }');
      console.log('  - Got keys:', Object.keys(data));
    }
    
  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('  - Status:', error.response.status);
      console.log('  - Error data:', error.response.data);
    } else {
      console.log('  - Network error:', error.message);
    }
  }
}

// Run the test
testLogin();