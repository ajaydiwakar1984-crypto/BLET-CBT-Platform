BLET CBT WEBSITE + RAZORPAY STANDARD CHECKOUT

Project stack detected:
- Static HTML/CSS/JavaScript frontend
- Netlify hosting
- Netlify Functions (Node.js) for server-side order creation and signature verification
- Razorpay Standard Checkout

PRODUCT PRICE:
- Fixed server-side price: INR 199 (19900 paise)
- Checkout order includes a note for 180-day access

FILES:
- index.html: checkout button and Razorpay modal integration
- netlify/functions/create-order.js: creates a Razorpay order server-side
- netlify/functions/verify-payment.js: verifies HMAC-SHA256 signature and checks payment/order/amount
- netlify.toml: Netlify publish, functions and /api route configuration
- .env.example: environment variable names only; no real secrets
- .gitignore: excludes .env and local dependencies

DEPLOY STEPS:
1. Extract this ZIP.
2. In Netlify, open the existing site glittering-cat-849c33.
3. Go to Site configuration (or Project configuration) > Environment variables.
4. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Use freshly generated TEST credentials first.
5. Set the variables for the deploy context you will test (for example Production).
6. Deploy the complete extracted folder contents (not just index.html) to the existing Netlify site, or connect the folder to Git and deploy.
7. Confirm the deployed site has netlify.toml, netlify/functions/, and data/ alongside index.html.
8. Test the ₹199 checkout using Razorpay test mode and test payment credentials.
9. Only after successful testing, add LIVE credentials in Netlify and complete Razorpay activation/KYC.

SECURITY:
- Do not put RAZORPAY_KEY_SECRET in HTML, JavaScript, Git, or a public ZIP.
- The secret typed into a chat should be treated as exposed. Regenerate/rotate the TEST key secret in Razorpay before use, then put the new value only in Netlify environment variables.
- The backend enforces the fixed ₹199 price; it does not trust an amount sent by the browser.

IMPORTANT LIMITATION:
This integration creates orders and verifies payment signatures server-side. It does NOT yet implement student accounts, a database, durable membership records, automatic 180-day entitlement activation/expiry, central result storage, or admin payment management. Do not advertise paid access as automatically provisioned until those are added. Signature verification is not a substitute for a database-backed entitlement workflow. The current CBT can still be accessed directly; payment does not lock/unlock the 50 sets yet.

LOCAL DEVELOPMENT:
- Install Netlify CLI if needed: npm install -g netlify-cli
- Create a local .env file based on .env.example (keep it private and never upload it).
- Run: netlify dev
- Visit the local URL printed by Netlify CLI.
