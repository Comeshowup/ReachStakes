// Test the new escrow deposit → Tazapay checkout flow
const BASE = 'http://localhost:3000/api';

async function test() {
    // 1. Login
    console.log('=== Step 1: Login ===');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'marketing@technova.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    const token = loginData.data?.token || loginData.token;
    if (!token) {
        console.error('No token. Response:', JSON.stringify(loginData));
        process.exit(1);
    }
    console.log('✅ Token obtained');

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Test the NEW escrow deposit endpoint (should create Tazapay checkout)
    console.log('\n=== Step 2: POST /api/escrow/deposit (Tazapay checkout) ===');
    const depositRes = await fetch(`${BASE}/escrow/deposit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ amount: 100, method: 'Wire' })
    });
    console.log('Deposit status:', depositRes.status);
    const depositText = await depositRes.text();
    console.log('Full response:', depositText);

    try {
        const depositData = JSON.parse(depositText);
        if (depositData.data?.url) {
            console.log('\n✅ TAZAPAY CHECKOUT URL:', depositData.data.url);
            console.log('✅ Transaction ID:', depositData.data.transactionId);
            console.log('✅ Amount:', depositData.data.amount);
            console.log('✅ Total Charge:', depositData.data.totalCharge);
            console.log('✅ Platform Fee:', depositData.data.platformFee);
            console.log('✅ Processing Fee:', depositData.data.processingFee);
        } else {
            console.log('\n❌ No checkout URL!');
            console.log('Error:', depositData.message || depositData.error);
        }
    } catch (e) {
        console.log('Not JSON:', e.message);
    }

    // 3. Also test old /payments/checkout still works
    console.log('\n=== Step 3: POST /api/payments/checkout (campaign payment) ===');
    const payRes = await fetch(`${BASE}/payments/checkout`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ campaignId: 1, amount: 50 })
    });
    console.log('Payment status:', payRes.status);
    const payText = await payRes.text();
    try {
        const payData = JSON.parse(payText);
        if (payData.url) {
            console.log('✅ Campaign payment checkout URL received');
        } else {
            console.log('❌ No campaign checkout URL');
        }
    } catch (e) { }
}

test().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
