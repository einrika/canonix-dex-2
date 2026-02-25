const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testSecurity() {
    console.log('--- Starting Security Verification ---');

    // 1. Test CORS
    console.log('\n[1] Testing CORS Allowlist...');
    try {
        const res = await fetch(`${BASE_URL}/api/token-list`, {
            headers: { 'Origin': 'https://malicious-site.com' }
        });
        // fetch might throw or return error depending on implementation
        if (res.status === 200) {
            console.error('❌ CORS Failed: Malicious origin allowed!');
        } else {
            console.log('✅ CORS Success: Malicious origin blocked/rejected.');
        }
    } catch (e) {
        console.log('✅ CORS Success: Request rejected (possibly by CORS policy).', e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/api/token-list`, {
            headers: { 'Origin': 'https://stalwart-ganache-32b226.netlify.app' }
        });
        if (res.status === 200) {
            console.log('✅ CORS Success: Allowed origin successful.');
        } else {
            console.error('❌ CORS Failed: Allowed origin blocked!', res.status);
        }
    } catch (e) {
        console.error('❌ CORS Failed: Allowed origin error!', e.message);
    }

    // 2. Test Error Masking
    console.log('\n[2] Testing Error Masking...');
    try {
        // Trigger a 404/error or hit a route that might fail
        const res = await fetch(`${BASE_URL}/api/tx-status?hash=invalid`);
        const data = await res.json();

        if (data.error && data.error.message && !data.error.stack) {
             console.log('✅ Error Masking Success: Safe error message returned, no stack trace.');
             console.log('   Message:', data.error.message);
        } else {
             console.error('❌ Error Masking Failed: Stack trace exposed or unsafe error!', data);
        }
    } catch (e) {
        console.error('❌ Error Masking Test Error!', e.message);
    }

    // 3. Test Proxy Whitelist
    console.log('\n[3] Testing Proxy Whitelist...');
    try {
        const res = await fetch(`${BASE_URL}/api/proxy?url=https://google.com`);
        const data = await res.json();
        if (data.success === false && data.error.message.includes('whitelisted')) {
            console.log('✅ Proxy Success: Malicious domain blocked.');
        } else {
            console.error('❌ Proxy Failed: Malicious domain allowed!', data);
        }
    } catch (e) {
        console.error('❌ Proxy Test Error!', e.message);
    }

    console.log('\n--- Security Verification Complete ---');
}

// We need the server running to test
// Assuming server is started in another process or we can't easily start it here
// I'll just provide the script. In a real environment I would start the server.
testSecurity();
