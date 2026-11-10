const crypto = require('node:crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment gateway is not configured. Please contact the administrator.' }) };
  }

  try {
    // Fixed server-side price: ₹199. Never trust a price supplied by the browser.
    const amount = 19900;
    if (amount < 100) return { statusCode: 400, body: JSON.stringify({ error: 'Minimum amount is 100 paise' }) };

    const receipt = `blet_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { product: 'BLET Complete CBT Test Series', access_days: '180' } })
    });

    const data = await response.json();
    if (!response.ok) {
      const authFailure = response.status === 401;
      return { statusCode: authFailure ? 401 : 500, body: JSON.stringify({ error: data.error?.description || 'Unable to create Razorpay order' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ order_id: data.id, amount: data.amount, currency: data.currency, key_id: keyId })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Order creation failed. Please try again.' }) };
  }
};
