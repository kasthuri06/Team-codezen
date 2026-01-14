import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserCredits {
  credits: number;
  isPremium: boolean;
  subscriptionType: 'free' | 'premium';
  subscriptionEndDate?: Date;
  lastResetDate: Date;
  totalUsed: number;
}

const MONTHLY_FREE_CREDITS = 2;

export const getUserCredits = async (userId: string): Promise<UserCredits> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Initialize new user with free credits
      const initialCredits: UserCredits = {
        credits: MONTHLY_FREE_CREDITS,
        isPremium: false,
        subscriptionType: 'free',
        lastResetDate: new Date(),
        totalUsed: 0
      };
      await setDoc(userRef, { credits: initialCredits }, { merge: true });
      return initialCredits;
    }
    
    const userData = userDoc.data();
    const creditsData = userData.credits as UserCredits;
    
    // Check if credits need to be reset (monthly)
    const lastReset = creditsData.lastResetDate instanceof Date 
      ? creditsData.lastResetDate 
      : new Date(creditsData.lastResetDate);
    const now = new Date();
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 30 && !creditsData.isPremium) {
      // Reset monthly credits
      await updateDoc(userRef, {
        'credits.credits': MONTHLY_FREE_CREDITS,
        'credits.lastResetDate': now
      });
      creditsData.credits = MONTHLY_FREE_CREDITS;
      creditsData.lastResetDate = now;
    }
    
    return creditsData;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
};

export const deductCredit = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const credits = await getUserCredits(userId);
    
    // Premium users have unlimited credits
    if (credits.isPremium) {
      await updateDoc(userRef, {
        'credits.totalUsed': increment(1)
      });
      return true;
    }
    
    // Check if user has credits
    if (credits.credits <= 0) {
      return false;
    }
    
    // Deduct credit
    await updateDoc(userRef, {
      'credits.credits': increment(-1),
      'credits.totalUsed': increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error deducting credit:', error);
    throw error;
  }
};

export const upgradeToPremium = async (
  userId: string, 
  subscriptionType: 'monthly' | 'yearly'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    const endDate = new Date();
    
    if (subscriptionType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    await updateDoc(userRef, {
      'credits.isPremium': true,
      'credits.subscriptionType': 'premium',
      'credits.subscriptionEndDate': endDate,
      'credits.credits': 999999, // Unlimited
      'credits.lastResetDate': now
    });
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    throw error;
  }
};

export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const credits = await getUserCredits(userId);
    
    if (!credits.isPremium) {
      return false;
    }
    
    // Check if subscription has expired
    if (credits.subscriptionEndDate) {
      const endDate = credits.subscriptionEndDate instanceof Date
        ? credits.subscriptionEndDate
        : new Date(credits.subscriptionEndDate);
      const now = new Date();
      
      if (now > endDate) {
        // Subscription expired, downgrade to free
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          'credits.isPremium': false,
          'credits.subscriptionType': 'free',
          'credits.credits': MONTHLY_FREE_CREDITS,
          'credits.subscriptionEndDate': null
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
