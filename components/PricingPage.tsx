
import React, { useState } from 'react';
import { Check, Crown, ArrowRight, School, Image as ImageIcon, Heart, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { PlanId } from '../types';
import { auth } from '../services/firebase';
import { createCheckoutSession } from '../services/paymentService';

interface PricingPageProps {
  onGetStarted: (planId: PlanId) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<PlanId | null>(null);

  const handlePlanSelect = async (planId: PlanId) => {
    if (auth?.currentUser) {
        setLoadingPlanId(planId);
        try {
            const interval = billingCycle === 'monthly' ? 'month' : 'year';
            await createCheckoutSession(auth.currentUser.uid, planId, interval);
        } catch (error) {
            console.error("Stripe Checkout Error:", error);
            // We no longer fallback silently, the service will alert the error
        } finally {
            setLoadingPlanId(null);
        }
    } else {
        localStorage.setItem("selectedPlan", planId);
        onGetStarted(planId);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 39,
      imageLimit: 50,
      description: 'The complete toolkit for individual teachers.',
      features: [
        'Unlimited Lesson Generation',
        'Full Access to Dashboard Tools',
        '50 AI Generated Images / mo',
        'Smart Board & Planner'
      ],
      color: 'bg-white',
      textColor: 'text-slate-900',
      borderColor: 'border-slate-200',
      buttonVariant: 'outline'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 59,
      imageLimit: 200,
      description: 'For power users who need more visuals.',
      features: [
        'Everything in Starter',
        '200 AI Generated Images / mo',
        'Priority Support',
        'Unlimited History',
        'Early Access to New Features'
      ],
      color: 'bg-slate-900',
      textColor: 'text-white',
      borderColor: 'border-slate-900',
      highlight: true,
      buttonVariant: 'primary'
    },
    {
      id: 'school',
      name: 'School',
      price: 139,
      imageLimit: 1000,
      description: 'Unlock unlimited potential for your classroom.',
      features: [
        'Everything in Pro',
        'Unlimited Images (1000 cap)',
        'Admin Dashboard',
        'Shared School Resources',
        'Onboarding Training'
      ],
      color: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      textColor: 'text-slate-900',
      borderColor: 'border-yellow-200',
      buttonVariant: 'primary'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-red-100 shadow-sm">
           <Sparkles className="w-4 h-4 fill-current" /> Special Launch Offer
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Choose Your Plan</h2>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">All plans include a <strong>1-day free trial</strong>. No commitment, cancel anytime.</p>
        
        <div className="inline-flex bg-slate-200 p-1.5 rounded-2xl shadow-inner">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Yearly <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-[2.5rem] p-10 flex flex-col relative ${plan.color} ${plan.borderColor} border-2 ${plan.highlight ? 'shadow-2xl scale-105 z-10' : 'shadow-xl'}`}
          >
            {plan.highlight && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white">
                 <Crown className="w-3 h-3 fill-current" /> Recommended
               </div>
            )}
            {plan.id === 'school' && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white">
                 <School className="w-3 h-3 fill-current" /> Best for Admin
               </div>
            )}

            <div className="mb-10">
              <h3 className={`text-3xl font-black mb-2 ${plan.textColor}`}>{plan.name}</h3>
              <p className={`text-sm opacity-70 ${plan.textColor} mb-8 leading-relaxed`}>{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl font-black ${plan.textColor}`}>
                   ${billingCycle === 'monthly' ? plan.price : (plan.price * 10)}
                </span>
                <span className={`text-sm font-bold opacity-60 ${plan.textColor} uppercase tracking-widest`}>
                   /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            <div className={`flex-1 space-y-5 mb-10 ${plan.textColor}`}>
               <div className={`flex items-center gap-4 font-black text-sm p-4 rounded-2xl ${plan.highlight ? 'bg-white/10' : 'bg-slate-50'}`}>
                  <div className={`p-2 rounded-lg ${plan.highlight ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 text-slate-700'}`}>
                      <ImageIcon className="w-5 h-5" />
                  </div>
                  <span>{plan.imageLimit} AI Visuals <span className="text-xs opacity-60 font-bold">/ month</span></span>
               </div>
               {plan.features.map((feature, i) => (
                 <div key={i} className="flex items-start gap-4 text-sm font-medium">
                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-green-400' : 'text-green-600'}`} />
                    <span className="opacity-90">{feature}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => handlePlanSelect(plan.id as PlanId)}
              disabled={loadingPlanId === plan.id}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                  plan.highlight 
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 shadow-xl shadow-yellow-900/20' 
                    : plan.id === 'school' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {loadingPlanId === plan.id ? <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</> : <>Start 1-Day Trial <ArrowRight className="w-5 h-5" /></>}
            </button>
            <div className="text-center mt-6">
                <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-center gap-2 ${plan.textColor}`}>
                   <ShieldCheck className="w-3 h-3" /> Secure Payment via Stripe
                </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-400 text-xs font-medium leading-relaxed">
          <strong>Fair Use Policy:</strong> All subscription plans are subject to our fair use guidelines. The School plan includes up to 1000 AI image generations per month. 
          The 1-day free trial allows full access to all features to ensure MaplePrep is the right fit for your classroom.
        </p>
      </div>
    </div>
  );
};
