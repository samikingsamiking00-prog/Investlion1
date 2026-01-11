
import React, { useState } from 'react';
import { INVESTMENT_PLANS, REFERRAL_BONUS_AMOUNT } from '../constants';
import { InvestmentPlan, ActivePlan, UserProfile } from '../types';
import { auth, db } from '../firebase';
import { ref, get, set, push, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, Target, CreditCard, ChevronRight, X } from 'lucide-react';

const Plans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!selectedPlan || !auth.currentUser) return;
    setLoading(true);

    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const userSnap = await get(userRef);
      const userData: UserProfile = userSnap.val();

      if (userData.balance < selectedPlan.investAmount) {
        alert('Insufficient balance. Please recharge your wallet.');
        navigate('/deposit');
        return;
      }

      const now = Date.now();
      const activePlan: ActivePlan = {
        id: '', // Will be updated
        uid: auth.currentUser.uid,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        dailyIncome: selectedPlan.dailyIncome,
        purchaseDate: now,
        lastClaimDate: now,
        expiryDate: now + (selectedPlan.duration * 24 * 60 * 60 * 1000),
        status: 'running'
      };

      const newPlanRef = push(ref(db, `activePlans/${auth.currentUser.uid}`));
      activePlan.id = newPlanRef.key || '';

      // Update Database
      const updates: any = {};
      updates[`users/${auth.currentUser.uid}/balance`] = userData.balance - selectedPlan.investAmount;
      updates[`activePlans/${auth.currentUser.uid}/${activePlan.id}`] = activePlan;

      // Referral Bonus Logic
      if (userData.referredBy) {
        const inviterUidSnap = await get(ref(db, `invites/${userData.referredBy}`));
        if (inviterUidSnap.exists()) {
          const inviterUid = inviterUidSnap.val();
          const inviterSnap = await get(ref(db, `users/${inviterUid}`));
          if (inviterSnap.exists()) {
            const inviterData: UserProfile = inviterSnap.val();
            updates[`users/${inviterUid}/balance`] = (inviterData.balance || 0) + REFERRAL_BONUS_AMOUNT;
            
            // Record bonus
            const bonusRef = push(ref(db, 'referralBonuses'));
            updates[`referralBonuses/${bonusRef.key}`] = {
              inviterUid,
              inviteeUid: auth.currentUser.uid,
              amount: REFERRAL_BONUS_AMOUNT,
              timestamp: now
            };
          }
        }
      }

      await update(ref(db), updates);
      alert('Plan purchased successfully!');
      setSelectedPlan(null);
      navigate('/my-products');
    } catch (err) {
      console.error(err);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold">Investment Plans</h2>
        <p className="text-sm opacity-80 mt-1">Select a plan to start earning daily income</p>
      </div>

      <div className="space-y-4">
        {INVESTMENT_PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col space-y-4 hover:border-red-200 transition-all cursor-pointer"
            onClick={() => setSelectedPlan(plan)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-lion-red">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-lg font-bold">ACTIVE NOW</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lion-red font-bold text-xl leading-none">Rs {plan.investAmount}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Investment</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Daily</p>
                <p className="text-sm font-bold text-gray-700">Rs {plan.dailyIncome}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Days</p>
                <p className="text-sm font-bold text-gray-700">{plan.duration}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                <p className="text-sm font-bold text-lion-red">Rs {plan.totalIncome}</p>
              </div>
            </div>

            <button className="w-full bg-lion-red hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all">
              <span>View Details</span>
              <ChevronRight size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-[40px] p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedPlan.name} Detail</h2>
              <button onClick={() => setSelectedPlan(null)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Invest Amount</span>
                <span className="font-bold text-gray-800">Rs {selectedPlan.investAmount}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Daily Income</span>
                <span className="font-bold text-green-600">Rs {selectedPlan.dailyIncome}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Duration</span>
                <span className="font-bold text-gray-800">{selectedPlan.duration} Days</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Total Income</span>
                <span className="font-bold text-lion-red">Rs {selectedPlan.totalIncome}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/deposit')}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl active:scale-95 transition-all"
              >
                Recharge
              </button>
              <button 
                onClick={handlePurchase}
                disabled={loading}
                className="flex-[2] bg-lion-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Buy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
