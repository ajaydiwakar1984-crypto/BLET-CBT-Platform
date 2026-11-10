const crypto = require('node:crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment gateway is not configured' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = payload;
    if (!orderId || !paymentId || !signature) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Missing payment verification fields' }) };
    }

    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const suppliedBuffer = Buffer.from(String(signature), 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Payment signature verification failed' }) };
    }

    // Confirm the payment belongs to this order and the fixed ₹199 product.
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` }
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      return { statusCode: paymentResponse.status === 401 ? 401 : 500, body: JSON.stringify({ success: false, error: 'Unable to confirm payment with Razorpay' }) };
    }
    if (payment.order_id !== orderId || payment.amount !== 19900 || payment.currency !== 'INR' || !['authorized', 'captured'].includes(payment.status)) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Payment details do not match this product' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ success: true, payment_id: paymentId, order_id: orderId, amount: payment.amount, currency: payment.currency, payment_status: payment.status, message: 'Payment signature verified. Server-side membership activation requires a database and student account.' })
    };
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid payment verification request' }) };
  }
};
