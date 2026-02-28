import { db, storage } from './firebase';
// Fix: Use wildcard import for firestore to resolve missing named export errors
import * as firestoreModule from 'firebase/firestore';
// Fix: Use wildcard import for storage to resolve missing named export errors
import * as storageModule from 'firebase/storage';
import { LessonPlan } from '../types';

// Fix: Extract functions via any casting to resolve "no exported member" errors
const { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy } = firestoreModule as any;
const { ref, uploadString, getDownloadURL } = storageModule as any;

// Helper to upload a single image if it is Base64
const uploadImageIfNeeded = async (userId: string, lessonId: string, imageId: string, data: string): Promise<string> => {
  if (!storage) return data; // Fallback if storage not ready
  
  // If already a URL, skip
  if (data.startsWith('http')) return data;

  try {
    const path = `users/${userId}/lessons/${lessonId}/${imageId}.png`;
    const storageRef = ref(storage, path);
    
    // Clean string just in case
    const rawBase64 = data.replace(/^data:image\/\w+;base64,/, '');
    
    await uploadString(storageRef, rawBase64, 'base64', { contentType: 'image/png' });
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    console.error("Image upload failed for", imageId, e);
    return data; // Return original data on failure
  }
};

/**
 * Local Storage Fallback for restricted/sandbox environments
 */
const saveToLocal = (userId: string, lesson: LessonPlan) => {
  try {
    const key = `mapleprep_lessons_${userId}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const index = saved.findIndex((l: any) => l.id === lesson.id);
    if (index !== -1) {
      saved[index] = lesson;
    } else {
      saved.unshift(lesson);
    }
    localStorage.setItem(key, JSON.stringify(saved));
  } catch (e) {
    console.warn("Local storage save failed:", e);
  }
};

const getFromLocal = (userId: string): LessonPlan[] => {
  try {
    const key = `mapleprep_lessons_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};

const deleteFromLocal = (userId: string, lessonId: string) => {
  try {
    const key = `mapleprep_lessons_${userId}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = saved.filter((l: any) => l.id !== lessonId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Local storage delete failed:", e);
  }
};

export const saveUserLesson = async (userId: string, lesson: LessonPlan) => {
  // Always save locally first as a safety net
  saveToLocal(userId, lesson);

  if (!db) {
    console.info("Firebase not connected. Saved to Local Storage.");
    return;
  }
  
  try {
    const lessonToSave = JSON.parse(JSON.stringify(lesson)) as LessonPlan;
    
    if (storage) {
        const imageUploads = lessonToSave.slides.map(async (slide, idx) => {
            if (slide.base64Image && !slide.base64Image.startsWith('http')) {
                slide.base64Image = await uploadImageIfNeeded(userId, lesson.id, `slide_${idx}_main_${Date.now()}`, slide.base64Image);
            }
            if (slide.practicalExample?.base64Image && !slide.practicalExample.base64Image.startsWith('http')) {
                slide.practicalExample.base64Image = await uploadImageIfNeeded(userId, lesson.id, `slide_${idx}_ex_${Date.now()}`, slide.practicalExample.base64Image);
            }
        });
        await Promise.all(imageUploads);
    }

    const lessonRef = doc(db, 'users', userId, 'lessons', lesson.id);
    await setDoc(lessonRef, lessonToSave);
  } catch (e) {
    console.error("Firestore save failed, relied on LocalStorage backup:", e);
  }
};

export const getUserLessons = async (userId: string): Promise<LessonPlan[]> => {
  // Merge local and remote
  const local = getFromLocal(userId);
  
  if (!db) return local;
  
  try {
    const lessonsRef = collection(db, 'users', userId, 'lessons');
    const q = query(lessonsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const remote = snapshot.docs.map((doc: any) => doc.data() as LessonPlan);
    
    // De-duplicate (Remote takes priority)
    const remoteIds = new Set(remote.map(l => l.id));
    return [...remote, ...local.filter(l => !remoteIds.has(l.id))];
  } catch (e) {
    console.error("Firestore fetch failed, returning LocalStorage results:", e);
    return local;
  }
};

export const deleteUserLesson = async (userId: string, lessonId: string) => {
  deleteFromLocal(userId, lessonId);
  
  if (!db) return;
  
  try {
    await deleteDoc(doc(db, 'users', userId, 'lessons', lessonId));
  } catch (e) {
    console.error("Error deleting remote lesson:", e);
  }
};

export const saveWeeklyPlan = async (userId: string, plan: any) => {
  try {
    localStorage.setItem(`mapleprep_weekly_plan_${userId}`, JSON.stringify(plan));
  } catch (e) {}

  if (!db) return;
  try {
    const planRef = doc(db, 'users', userId, 'settings', 'weeklyPlan');
    await setDoc(planRef, { data: plan, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("Error saving weekly plan:", e);
  }
};

export const getWeeklyPlan = async (userId: string): Promise<any | null> => {
  try {
    const local = localStorage.getItem(`mapleprep_weekly_plan_${userId}`);
    if (local) return JSON.parse(local);
  } catch (e) {}

  if (!db) return null;
  try {
    const planRef = doc(db, 'users', userId, 'settings', 'weeklyPlan');
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      return snap.data().data;
    }
  } catch (e) {
    console.error("Error fetching weekly plan:", e);
  }
  return null;
};

export const saveUserSettings = async (userId: string, key: string, data: any) => {
  try {
    localStorage.setItem(`mapleprep_${key}_${userId}`, JSON.stringify(data));
  } catch (e) {}

  if (!db) return;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', key);
    await setDoc(settingsRef, { data, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

export const getUserSettings = async (userId: string, key: string): Promise<any | null> => {
  try {
    const local = localStorage.getItem(`mapleprep_${key}_${userId}`);
    if (local) return JSON.parse(local);
  } catch (e) {}

  if (!db) return null;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', key);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data().data;
    }
  } catch (e) {
    console.error(`Error fetching ${key}:`, e);
  }
  return null;
};