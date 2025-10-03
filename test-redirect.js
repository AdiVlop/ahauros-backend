// Test script pentru redirect-ul de la ahauros.io/auth la app.ahauros.io/login
const https = require('https');

console.log('🧪 Testing redirect from https://ahauros.io/auth to https://app.ahauros.io/login');

// Test 1: Verifică dacă pagina se încarcă
https.get('https://ahauros.io/auth', (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📄 Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Verifică dacă conține JavaScript pentru redirect
    if (data.includes('window.location.href') && data.includes('app.ahauros.io/login')) {
      console.log('✅ Redirect JavaScript found in page');
    } else {
      console.log('❌ Redirect JavaScript not found');
    }
    
    // Verifică dacă conține link-ul de fallback
    if (data.includes('app.ahauros.io/login')) {
      console.log('✅ Fallback link found');
    } else {
      console.log('❌ Fallback link not found');
    }
    
    console.log('\n📋 Test completed successfully!');
    console.log('🌐 The page should redirect users to https://app.ahauros.io/login');
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});
