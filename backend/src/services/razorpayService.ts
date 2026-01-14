import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

export const createOrder = async (amount: number, userId: string) => {
  try {
    // Create a short receipt ID (max 40 chars)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = userId.slice(0, 20); // First 20 chars of userId
    const receipt = `rcpt_${userIdShort}_${timestamp}`.slice(0, 40);
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      notes: {
        userId
      }
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
};

export const verifyPayment = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  try {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};
