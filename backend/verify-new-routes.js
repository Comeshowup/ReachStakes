
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
        if (data.status === 'success') {
            return { token: data.data.token, user: data.data.user };
        }
        return null;
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
        return { token: data.data.token, user: data.data.user };
    } catch (e) {
        console.error("Login failed", e);
    }
}

async function createCampaign(token, title) {
    const res = await fetch(`${BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: title || 'Test Campaign ' + Date.now(),
            description: 'A test campaign',
            platformRequired: 'Instagram',
            campaignType: 'UGC',
            budgetMin: 100,
            budgetMax: 500,
            deadline: '2025-12-31'
        })
    });
    const data = await res.json();
    return data.data ? data.data : null;
}

async function applyToCampaign(token, campaignId) {
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
    return await res.json();
}

async function getBrandCampaigns(token, brandId) {
    console.log(`Fetching campaigns for brand ${brandId}...`);
    const res = await fetch(`${BASE_URL}/campaigns/brand/${brandId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    console.log("Get Brand Campaigns Response:", JSON.stringify(data, null, 2));
    return data;
}

async function getCreatorCampaigns(token, creatorId) {
    console.log(`Fetching campaigns for creator ${creatorId}...`);
    const res = await fetch(`${BASE_URL}/campaigns/creator/${creatorId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    console.log("Get Creator Campaigns Response:", JSON.stringify(data, null, 2));
    return data;
}

async function run() {
    // 1. Brand
    const brandAuth = await registerUser('BrandRouteTest', 'brand_route@test.com', 'password123', 'brand');
    const brandToken = brandAuth.token;
    const brandId = brandAuth.user.id;
    console.log(`Brand ID: ${brandId}`);

    // 2. Creator
    const creatorAuth = await registerUser('CreatorRouteTest', 'creator_route@test.com', 'password123', 'creator');
    const creatorToken = creatorAuth.token;
    const creatorId = creatorAuth.user.id;
    console.log(`Creator ID: ${creatorId}`);

    if (brandToken && creatorToken) {
        // 3. Create Campaign
        const campaign = await createCampaign(brandToken, "Brand Route Test Campaign");
        console.log(`Created Campaign ID: ${campaign.id}`);

        // 4. Test GET Brand Campaigns
        const brandCampaigns = await getBrandCampaigns(brandToken, brandId);
        if (brandCampaigns.status === 'success' && brandCampaigns.data.some(c => c.id === campaign.id)) {
            console.log("PASS: Found created campaign in brand list.");
        } else {
            console.log("FAIL: Did not find created campaign in brand list.");
        }

        // 5. Apply
        await applyToCampaign(creatorToken, campaign.id);

        // 6. Test GET Creator Campaigns
        const creatorCampaigns = await getCreatorCampaigns(creatorToken, creatorId);
        if (creatorCampaigns.status === 'success' && creatorCampaigns.data.some(c => c.campaignId === campaign.id)) {
            console.log("PASS: Found joined campaign in creator list.");
        } else {
            console.log("FAIL: Did not find joined campaign in creator list.");
        }

    }
}

run();
