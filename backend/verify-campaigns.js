
const BASE_URL = 'http://localhost:3000/api';

async function registerUser(name, email, password, role) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (data.status === 'error' && data.message === 'User already exists') {
            return loginUser(email, password);
        }
        return data.data.token;
    } catch (e) {
        console.error("Register failed", e);
    }
}

async function loginUser(email, password) {
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        return data.data.token;
    } catch (e) {
        console.error("Login failed", e);
    }
}

async function createCampaign(token) {
    console.log("Creating campaign...");
    const res = await fetch(`${BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: 'Test Campaign ' + Date.now(),
            description: 'A test campaign',
            platformRequired: 'Instagram',
            campaignType: 'UGC',
            budgetMin: 100,
            budgetMax: 500,
            deadline: '2025-12-31'
        })
    });
    const data = await res.json();
    console.log("Create Campaign Response:", JSON.stringify(data, null, 2));
    return data.data ? data.data.id : null;
}

async function applyToCampaign(token, campaignId) {
    console.log(`Applying to campaign ${campaignId}...`);
    const res = await fetch(`${BASE_URL}/campaigns/${campaignId}/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            pitch: 'I love this brand!',
            agreedPrice: 200
        })
    });
    const data = await res.json();
    console.log("Apply Campaign Response:", JSON.stringify(data, null, 2));
}

async function run() {
    // 1. Brand
    const brandToken = await registerUser('BrandUser', 'brand@test.com', 'password123', 'brand');
    console.log("Brand Token:", brandToken ? "Got it" : "Failed");

    // 2. Creator
    const creatorToken = await registerUser('CreatorUser', 'creator@test.com', 'password123', 'creator');
    console.log("Creator Token:", creatorToken ? "Got it" : "Failed");

    if (brandToken && creatorToken) {
        // 3. Create Campaign
        const campaignId = await createCampaign(brandToken);

        if (campaignId) {
            console.log("Create Campaign: PASS");

            // 4. Apply (Valid)
            await applyToCampaign(creatorToken, campaignId);
            console.log("Apply (Creator): PASS (Assuming success response above)");

            // 5. Apply (Invalid - Brand trying to apply)
            console.log("Testing Invalid Application (Brand)...");
            try {
                const res = await fetch(`${BASE_URL}/campaigns/${campaignId}/apply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${brandToken}`
                    },
                    body: JSON.stringify({ pitch: 'Bad' })
                });
                const data = await res.json();
                if (res.status === 403) {
                    console.log("Apply (Brand): PASS (Correctly blocked)");
                } else {
                    console.log("Apply (Brand): FAIL (Status " + res.status + ")");
                }
            } catch (e) {
                console.log("Apply (Brand): FAIL (Exception)");
            }

        } else {
            console.log("Create Campaign: FAIL");
        }
    }
}

run();
