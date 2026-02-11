import { db } from './firebase';
import { collection, addDoc, onSnapshot, doc, getDocs, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { PlanId } from '../types';

/**
 * Starts a Stripe Checkout session via the "Run Payments with Stripe" Firebase Extension.
 * Includes a 10-second timeout to prevent infinite hanging if extension is not installed.
 */
export const createCheckoutSession = async (uid: string, planId: PlanId, interval: 'month' | 'year' = 'month') => {
  if (!db) throw new Error("Firebase not initialized");

  const PRICE_IDS = {
    'starter': {
        month: 'price_starter_monthly_id', 
        year: 'price_starter_yearly_id'
    },
    'pro': {
        month: 'price_pro_monthly_id',
        year: 'price_pro_yearly_id'
    },
    'school': {
        month: 'price_school_monthly_id',
        year: 'price_school_yearly_id'
    }
  };

  const priceId = (PRICE_IDS as any)[planId][interval];

  const sessionsRef = collection(db, 'customers', uid, 'checkout_sessions');
  const docRef = await addDoc(sessionsRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    mode: 'subscription',
    allow_promotion_codes: true,
  });

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Stripe session timed out. Proceeding to demo mode."));
    }, 10000);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      const data = snap.data();
      if (data?.error) {
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error(data.error.message));
      }
      if (data?.url) {
        clearTimeout(timeout);
        unsubscribe();
        window.location.assign(data.url);
        resolve();
      }
    });
  });
};

/**
 * Creates a Stripe Customer Portal session for managing subscriptions/billing.
 * Includes a 10-second timeout.
 */
export const createPortalSession = async (uid: string) => {
  if (!db) throw new Error("Firebase not initialized");

  const sessionsRef = collection(db, 'customers', uid, 'portal_sessions');
  const docRef = await addDoc(sessionsRef, {
    return_url: window.location.origin,
  });

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Portal session timed out."));
    }, 10000);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      const data = snap.data();
      if (data?.error) {
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error(data.error.message));
      }
      if (data?.url) {
        clearTimeout(timeout);
        unsubscribe();
        window.location.assign(data.url);
        resolve();
      }
    });
  });
};

/**
 * Gets the active subscription for a user.
 */
export const getActiveSubscription = async (uid: string) => {
  if (!db) return null;

  const subsRef = collection(db, 'customers', uid, 'subscriptions');
  const q = query(subsRef, where('status', 'in', ['active', 'trialing']));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};