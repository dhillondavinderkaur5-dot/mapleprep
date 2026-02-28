
import { db } from './firebase';
import * as firestoreModule from 'firebase/firestore';
const { collection, addDoc, onSnapshot, getDocs, query, where, doc, setDoc, getDoc } = firestoreModule as any;

import { PlanId } from '../types';

import { auth } from './firebase';

// Replace these with your actual Stripe Price IDs from the Stripe Dashboard
const STRIPE_PRICES = {
  'starter': { 
    month: 'price_1T0TYa2LaX3Rx1a5SCCTFU0G', 
    year: 'price_1T0Unj2LaX3Rx1a5cQJRnIPV'
  },
  'pro': { 
    month: 'price_1T0Tcq2LaX3Rx1a5panJtC99', 
    year: 'price_1T0Umr2LaX3Rx1a57RChPus2'
  },
  'school': { 
    month: 'price_1T0Thx2LaX3Rx1a5pMZ2zo1U', 
    year: 'price_1T0Uly2LaX3Rx1a5Sm7KgzWl'
  }
};

export const createCheckoutSession = async (uid: string, planId: PlanId, interval: 'month' | 'year' = 'month') => {
  const priceId = (STRIPE_PRICES as any)[planId]?.[interval];
  
  if (!priceId || priceId.includes('_id')) {
    console.error(`[Stripe] No Price ID configured for ${planId} ${interval}`);
    throw new Error("This plan is not yet configured with a Stripe Price ID.");
  }

  console.log("%c[Stripe] 🚀 Creating Server-Side Checkout Session", "color: #3b82f6; font-weight: bold", { uid, priceId });

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: uid,
        email: auth?.currentUser?.email,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Server responded with status ${response.status}.`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        // If not JSON, use the first 100 chars of the response text
        errorMessage = errorText.substring(0, 100) || errorMessage;
      }
      alert(`Payment Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.url) {
      window.location.assign(data.url);
      return true;
    } else {
      throw new Error("No checkout URL received from server.");
    }
  } catch (error: any) {
    console.error("Checkout Error:", error);
    if (!error.message.includes("Payment Error")) {
      alert(`Connection Error: ${error.message}. Please check your internet and try again.`);
    }
    throw error;
  }
};

export const getActiveSubscription = async (uid: string) => {
  if (!db) return null;
  try {
    const subsRef = collection(db, 'customers', uid, 'subscriptions');
    const q = query(subsRef, where('status', 'in', ['active', 'trialing']));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (e) {
    return null;
  }
};
