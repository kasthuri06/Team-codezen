import express from 'express';
import { createOrder, verifyPayment } from '../services/razorpayService';
import { getFirestore } from '../config/firebase';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { userId, plan, amount } = req.body;

    if (!userId || !plan || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const order = await createOrder(amount, userId);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Verify payment and upgrade user
router.post('/verify', async (req, res) => {
  try {
    const { userId, orderId, paymentId, signature, plan } = req.body;

    if (!userId || !orderId || !paymentId || !signature || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify payment signature
    const isValid = verifyPayment(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get Firestore instance (after Firebase is initialized)
    const db = getFirestore();
    
    // Update user subscription in Firestore
    const userRef = db.collection('users').doc(userId);
    const now = new Date();
    const endDate = new Date();

    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await userRef.set({
      credits: {
        isPremium: true,
        subscriptionType: 'premium',
        subscriptionEndDate: endDate,
        credits: 999999,
        lastResetDate: now,
        totalUsed: 0
      },
      paymentHistory: {
        [paymentId]: {
          orderId,
          paymentId,
          plan,
          amount: plan === 'monthly' ? 299 : 2999,
          date: now,
          status: 'success'
        }
      }
    }, { merge: true });

    res.json({
      success: true,
      message: 'Payment verified and subscription activated'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

export default router;
