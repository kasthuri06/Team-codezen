import { getFirestore } from '../config/firebase';
import { User, TryOnResult, StylistHistory } from '../types';

/**
 * Service for interacting with Firestore database
 * Handles all database operations for users, try-on results, and stylist history
 */
class FirestoreService {
  private get db() {
    return getFirestore();
  }

  // Collections
  private usersCollection = 'users';
  private tryonResultsCollection = 'tryon_results';
  private stylistHistoryCollection = 'stylist_history';

  /**
   * Create or update user profile
   * @param user User data
   */
  async createUser(user: User): Promise<void> {
    try {
      await this.db.collection(this.usersCollection).doc(user.uid).set({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      
      console.log(`✅ User profile created/updated: ${user.email}`);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Get user profile by UID
   * @param uid User ID
   * @returns User data or null
   */
  async getUser(uid: string): Promise<User | null> {
    try {
      const doc = await this.db.collection(this.usersCollection).doc(uid).get();
      
      if (!doc.exists) {
        return null;
      }

      return doc.data() as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Save try-on result
   * @param result Try-on result data
   * @returns Document ID
   */
  async saveTryOnResult(result: Omit<TryOnResult, 'id'>): Promise<string> {
    try {
      const docRef = await this.db.collection(this.tryonResultsCollection).add({
        ...result,
        createdAt: new Date()
      });

      console.log(`✅ Try-on result saved: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error saving try-on result:', error);
      throw new Error('Failed to save try-on result');
    }
  }

  /**
   * Get user's try-on history
   * @param userId User ID
   * @param limit Number of results to return
   * @returns Array of try-on results
   */
  async getUserTryOnHistory(userId: string, limit: number = 10): Promise<TryOnResult[]> {
    try {
      const snapshot = await this.db
        .collection(this.tryonResultsCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const results: TryOnResult[] = [];
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as TryOnResult);
      });

      return results;
    } catch (error) {
      console.error('Error getting try-on history:', error);
      throw new Error('Failed to get try-on history');
    }
  }

  /**
   * Save stylist conversation
   * @param history Stylist history data
   * @returns Document ID
   */
  async saveStylistHistory(history: Omit<StylistHistory, 'id'>): Promise<string> {
    try {
      const docRef = await this.db.collection(this.stylistHistoryCollection).add({
        ...history,
        createdAt: new Date()
      });

      console.log(`✅ Stylist history saved: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error saving stylist history:', error);
      throw new Error('Failed to save stylist history');
    }
  }

  /**
   * Get user's stylist conversation history
   * @param userId User ID
   * @param limit Number of conversations to return
   * @returns Array of stylist history
   */
  async getUserStylistHistory(userId: string, limit: number = 20): Promise<StylistHistory[]> {
    try {
      const snapshot = await this.db
        .collection(this.stylistHistoryCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const history: StylistHistory[] = [];
      snapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data()
        } as StylistHistory);
      });

      return history;
    } catch (error) {
      console.error('Error getting stylist history:', error);
      throw new Error('Failed to get stylist history');
    }
  }

  /**
   * Update try-on result status
   * @param resultId Result document ID
   * @param status New status
   * @param generatedImageUrl Optional generated image URL
   */
  async updateTryOnResult(
    resultId: string, 
    status: 'processing' | 'completed' | 'failed',
    generatedImageUrl?: string
  ): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (generatedImageUrl) {
        updateData.generatedImageUrl = generatedImageUrl;
      }

      await this.db.collection(this.tryonResultsCollection).doc(resultId).update(updateData);
      
      console.log(`✅ Try-on result updated: ${resultId} -> ${status}`);
    } catch (error) {
      console.error('Error updating try-on result:', error);
      throw new Error('Failed to update try-on result');
    }
  }
}

export default new FirestoreService();