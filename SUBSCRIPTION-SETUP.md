# SitFit Premium Subscription System - Setup Guide

## ✅ Implementation Complete!

The premium subscription system with Razorpay integration has been successfully implemented.

---

## 🎯 Features Implemented

### 1. **Credit System**
- ✅ Free users get 2 credits per month
- ✅ Credits reset automatically every 30 days
- ✅ Premium users get unlimited credits
- ✅ Credit tracking in Firestore
- ✅ Credit deduction on each virtual try-on

### 2. **UI Components**
- ✅ Credit badge in navigation bar (shows remaining credits)
- ✅ Credit badge in mobile header
- ✅ Upgrade modal when credits run out
- ✅ Subscription/Pricing page with 3 tiers

### 3. **Payment Integration**
- ✅ Razorpay test mode integration
- ✅ Monthly plan: ₹299/month
- ✅ Yearly plan: ₹2,999/year (save ₹589)
- ✅ Payment verification
- ✅ Automatic subscription activation

### 4. **Backend Services**
- ✅ Credit management service
- ✅ Razorpay order creation
- ✅ Payment verification
- ✅ Subscription upgrade logic

---

## 🚀 How to Use

### Step 1: Setup Razorpay Account

1. Go to https://dashboard.razorpay.com/signup
2. Create a test account (free)
3. Navigate to Settings → API Keys
4. Copy your **Test Key ID** and **Test Key Secret**
5. Update `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
   ```

### Step 2: Start the Application

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

### Step 3: Test the System

1. **Login to your account**
2. **Check credits** - You'll see "2 credits" badge in the navigation
3. **Go to Virtual Try-On** page
4. **Upload images and generate** - This will use 1 credit
5. **Generate again** - Uses another credit (now 0 credits left)
6. **Try to generate third time** - Upgrade modal appears!

### Step 4: Test Payment (Test Mode)

1. Click **"Upgrade to Premium"** button
2. Choose a plan (Monthly or Yearly)
3. Razorpay checkout opens
4. Use these **test card details**:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits (e.g., 123)
   - **Expiry:** Any future date (e.g., 12/25)
   - **Name:** Any name
5. Click **Pay**
6. Payment succeeds!
7. You're now Premium with **unlimited credits** ∞

---

## 📁 Files Created/Modified

### New Files Created:
```
frontend/src/services/creditService.ts
frontend/src/components/CreditBadge.tsx
frontend/src/components/UpgradeModal.tsx
frontend/src/pages/Subscription.tsx
backend/src/services/razorpayService.ts
backend/src/routes/payment.ts
```

### Modified Files:
```
frontend/src/components/Layout.tsx (added credit badge)
frontend/src/pages/TryOn.tsx (added credit check)
frontend/src/App.tsx (added subscription route)
backend/src/server.ts (added payment routes)
backend/.env (added Razorpay keys)
backend/package.json (added razorpay dependency)
```

---

## 🎨 User Flow

### Free User Journey:
1. User signs up → Gets 2 free credits
2. Uses Virtual Try-On → Credit deducted (1 remaining)
3. Uses again → Credit deducted (0 remaining)
4. Tries to use again → **Upgrade Modal appears**
5. Clicks "Upgrade to Premium"
6. Redirected to Subscription page
7. Chooses plan and pays
8. Becomes Premium user with unlimited credits

### Premium User Journey:
1. Premium user logs in
2. Sees "∞" (infinity symbol) in credit badge
3. Can use Virtual Try-On unlimited times
4. No credit deductions

---

## 💳 Test Cards (Razorpay Test Mode)

### Success Scenarios:
- **Card:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Result:** Payment succeeds

### Failure Scenarios (for testing):
- **Card:** 4000 0000 0000 0002
- **Result:** Card declined

---

## 🔧 Configuration

### Backend Environment Variables:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

### Firestore Data Structure:
```javascript
users/{userId}/credits: {
  credits: 2,                    // Number of credits
  isPremium: false,              // Premium status
  subscriptionType: 'free',      // 'free' or 'premium'
  subscriptionEndDate: null,     // Date when subscription ends
  lastResetDate: Date,           // Last credit reset date
  totalUsed: 0                   // Total credits used
}
```

---

## 🎯 Subscription Plans

### Free Plan:
- **Price:** ₹0
- **Credits:** 2 per month
- **Features:**
  - 2 virtual try-ons per month
  - Basic AI stylist
  - Local try-on database
  - Outfit calendar
  - Weather recommendations

### Premium Monthly:
- **Price:** ₹299/month
- **Credits:** Unlimited
- **Features:**
  - Unlimited virtual try-ons
  - Priority processing
  - Advanced AI features
  - Ad-free experience
  - Premium support
  - Early access to features

### Premium Yearly:
- **Price:** ₹2,999/year
- **Savings:** ₹589 (2 months free)
- **Credits:** Unlimited
- **Features:**
  - Everything in Monthly
  - Priority support
  - Exclusive features
  - Style consultation
  - Personal stylist access

---

## 🐛 Troubleshooting

### Issue: Credit badge not showing
**Solution:** Make sure user is logged in and Firestore is properly configured

### Issue: Payment fails
**Solution:** 
1. Check Razorpay keys in backend/.env
2. Ensure backend server is running
3. Check browser console for errors
4. Verify test card details are correct

### Issue: Credits not deducting
**Solution:** Check Firestore rules allow write access to user's credit data

### Issue: Razorpay checkout not opening
**Solution:** 
1. Check if Razorpay script is loaded (check browser console)
2. Verify RAZORPAY_KEY_ID is correct
3. Check network tab for API errors

---

## 📝 Next Steps (Optional Enhancements)

1. **Add subscription management page**
   - View current plan
   - Cancel subscription
   - View payment history

2. **Add email notifications**
   - Payment confirmation
   - Credit reset notification
   - Subscription expiry warning

3. **Add promo codes/coupons**
   - Discount codes
   - Referral system

4. **Add analytics**
   - Track conversion rates
   - Monitor credit usage
   - Payment success rates

---

## 🎉 Testing Checklist

- [ ] Free user can see 2 credits in badge
- [ ] Credit deducts after virtual try-on
- [ ] Upgrade modal appears when credits = 0
- [ ] Subscription page loads correctly
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds
- [ ] User becomes Premium after payment
- [ ] Premium user sees ∞ credits
- [ ] Premium user can generate unlimited try-ons

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all environment variables are set
4. Ensure Firestore rules allow read/write access

---

**🎊 Congratulations! Your premium subscription system is ready!**
