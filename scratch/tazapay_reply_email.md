# Reply to Tazapay Support

**Subject:** Re: Sandbox Environment — 500 Internal Server Error on POST /v3/payin/attempt (Card & Local Bank Transfer)

---

Hi Tazapay Support Team,

Thank you for your prompt response. Here are the details you requested:

### 1. Payment ID (Checkout Session ID) and Status
Here is the status of our recent checkout sessions in the Tazapay Sandbox Dashboard:

*   **Failed/Expired Sessions (Attempted Card / Local Bank Transfer):**
    *   **`chk_d8nqqbct45bn4thjq5r0`** (Amount: USD 1,294.80, status: **Failed/Pending**) — **[Newest Test Case]** Failed during Local Bank Transfer payment method submission. See detailed screenshots showing this step-by-step failure flow below.
    *   **`chk_d8lg864t45bn4thi8l5g`** (Amount: USD 1,618.50, status: **Expired**) — Failed with a 500 error on the card/bank transfer submit attempt.
    *   **`chk_d8lg77ct45bn4thi8h30`** (Amount: USD 1,618.50, status: **Expired**) — Failed with a 500 error on the bank transfer attempt.
*   **Successful Sessions (USDC Transfer Simulation):**
    *   **`chk_d8lgftst45bn4thl8n80`** (Amount: USD 1,618.50, status: **Succeeded**) — Successful only because we selected **USDC Transfer** and used the "Simulation Success" button.
    *   **`chk_d8lfiest45bn4thi83hg`** (Amount: USD 100.00, status: **Succeeded**) — Successful via USDC Transfer simulation.

### 2. Screen Recording & Screenshots (Attached)
I have attached a screen recording **`tazapay-sandbox-issue.mp4`** (and two screenshots) showing the exact step-by-step flow:
1.  **Before Click:** The checkout page loads. Note that the browser console immediately throws a `SyntaxError: Unexpected token '<'` for `dyn_wdp.js`.
2.  **During Click:** Selecting **Local Bank Transfer** (or **Card**) and clicking **Pay Now** (or **Proceed**) immediately triggers `"Something went wrong with this API"` in the UI.
3.  **The Error:** The network log/console shows the `POST /v3/payin/attempt` request returning `500 (Internal Server Error)`.
4.  **USDC Contrast:** In contrast, switching to **USDC Transfer** loads the sandbox simulation buttons ("Simulation Success" / "Simulation Expiry") successfully, and clicking "Simulation Success" completes without errors.

### 3. Risk SDK Error Details
On loading the checkout page, the browser console shows a SyntaxError because the risk script loader is returning an HTML response (likely a 404 or block page) instead of a JavaScript file. 

*   **URL attempting to load:**
    `https://checkout-sandbox.tazapay.com/dyn_wdp.js?loaderVer=5.2.2&compat=false&tp=true&tp_split=false&fp_static=true&fp_dyn=true&flash=true`
*   **Error message in Console:**
    ```
    Uncaught SyntaxError: Unexpected token '<' (at dyn_wdp.js?loaderVer=5.2.2&compat=false&tp=true&tp_split=false&fp_static=true&fp_dyn=true&flash=true:1:1)
    ```
*   **Trace/Context:**
    ```
    PendingScript
    w @ i.js:97
    v @ i.js:96
    B @ i.js:102
    (anonymous) @ i.js:102
    PendingScript
    load_script @ d.js:44
    load_io @ d.js:10
    (anonymous) @ d.js:49
    ```

It seems that because the iovation/TransUnion script (`dyn_wdp.js`) fails to load/parse as JavaScript (due to the HTML response), the browser cannot send the correct device fingerprint/risk telemetry. Subsequently, when clicking "Pay Now" or submitting a card, the `POST https://service-sandbox.tazapay.com/v3/payin/attempt` request fails on your server side with a `500 Internal Server Error`.

Please let us know if you need any additional console logs, network payloads, or screenshots.

Best regards,  
[Your Name]  
ReachStakes
