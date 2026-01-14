import React, { useState, useEffect } from 'react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits, UserCredits } from '../services/creditService';
import LoadingSpinner from '../components/LoadingSpinner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;
      
      try {
        const userCredits = await getUserCredits(user.uid);
        setCredits(userCredits);
      } catch (error) {
        console.error('Failed to load credits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
    loadRazorpayScript();
  }, [user]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const reloadCredits = async () => {
    if (!user) return;
    
    try {
      const userCredits = await getUserCredits(user.uid);
      setCredits(userCredits);
    } catch (error) {
      console.error('Failed to reload credits:', error);
    }
  };

  const handlePayment = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    
    setProcessing(true);
    
    try {
      // Create order on backend
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          plan,
          amount: plan === 'monthly' ? 299 : 2999
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to create order');
      }
      
      // Open Razorpay checkout
      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: 'INR',
        name: 'SitFit Premium',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        order_id: data.data.orderId,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyResponse = await fetch('http://localhost:5000/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.uid,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan
            })
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            alert('Payment successful! You are now a Premium member!');
            await reloadCredits(); // Reload credits
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#9333ea'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      credits: '2 credits',
      features: [
        '2 virtual try-ons per month',
        'Basic AI stylist',
        'Local try-on database',
        'Outfit calendar',
        'Weather recommendations'
      ],
      buttonText: 'Current Plan',
      buttonDisabled: true,
      isCurrent: !credits?.isPremium
    },
    {
      name: 'Premium Monthly',
      price: '₹299',
      period: '/month',
      credits: 'Unlimited',
      features: [
        'Unlimited virtual try-ons',
        'Priority processing',
        'Advanced AI features',
        'Ad-free experience',
        'Premium support',
        'Early access to features'
      ],
      buttonText: 'Upgrade Now',
      buttonDisabled: false,
      plan: 'monthly' as const,
      popular: true
    },
    {
      name: 'Premium Yearly',
      price: '₹2,999',
      period: '/year',
      credits: 'Unlimited',
      savings: 'Save ₹589',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Exclusive features',
        'Style consultation',
        'Personal stylist access'
      ],
      buttonText: 'Upgrade Now',
      buttonDisabled: false,
      plan: 'yearly' as const
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300">
            Unlock unlimited virtual try-ons and premium features
          </p>
          
          {credits && (
            <div className="mt-6 inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
              <p className="text-white">
                Current Credits: <span className="font-bold text-purple-300">
                  {credits.isPremium ? '∞ Unlimited' : `${credits.credits} remaining`}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.popular ? 'ring-4 ring-purple-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                {plan.savings && (
                  <p className="text-green-600 font-semibold mt-2">{plan.savings}</p>
                )}
                <p className="text-purple-600 font-semibold mt-2">{plan.credits}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.plan && handlePayment(plan.plan)}
                disabled={plan.buttonDisabled || processing || plan.isCurrent}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.isCurrent
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? 'Processing...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">How do credits work?</h3>
              <p>Free users get 2 credits per month. Each virtual try-on uses 1 credit. Premium users get unlimited credits.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p>Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p>We accept all major credit/debit cards, UPI, and net banking through Razorpay.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
