import React, { useEffect, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { getUserCredits, UserCredits } from '../services/creditService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const CreditBadge: React.FC = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [user]);

  if (loading || !credits) {
    return null;
  }

  return (
    <Link
      to="/subscription"
      className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <SparklesIcon className="h-4 w-4" />
      <span className="text-sm font-semibold">
        {credits.isPremium ? '∞' : credits.credits}
      </span>
      {!credits.isPremium && (
        <span className="text-xs opacity-90">credits</span>
      )}
    </Link>
  );
};

export default CreditBadge;
