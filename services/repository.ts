
import { db, storage } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
// Fix: Use wildcard import for storage to resolve missing named export errors
import * as storageModule from 'firebase/storage';
import { LessonPlan } from '../types';

// Fix: Extract storage functions via any casting to resolve "no exported member" errors
const { ref, uploadString, getDownloadURL } = storageModule as any;

// Helper to upload a single image if it is Base64
const uploadImageIfNeeded = async (userId: string, lessonId: string, imageId: string, data: string): Promise<string> => {
  if (!storage) return data; // Fallback if storage not ready
  
  // If already a URL, skip
  if (data.startsWith('http')) return data;

  try {
    const path = `users/${userId}/lessons/${lessonId}/${imageId}.png`;
    const storageRef = ref(storage, path);
    // Base64 string from Gemini usually comes without the data:image/png;base64, prefix in the logic
    // But we should ensure we handle it correctly. 
    // The Gemini service returns raw base64. 
    // uploadString with 'base64' format expects just the raw string.
    
    // Clean string just in case
    const rawBase64 = data.replace(/^data:image\/\w+;base64,/, '');
    
    await uploadString(storageRef, rawBase64, 'base64', { contentType: 'image/png' });
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    console.error("Image upload failed for", imageId, e);
    return data; // Return original data on failure so we don't lose the image, though save might fail
  }
};

export const saveUserLesson = async (userId: string, lesson: LessonPlan) => {
  if (!db) throw new Error("Database not initialized");
  
  try {
    // Deep copy to avoid mutating the state in UI while uploading
    const lessonToSave = JSON.parse(JSON.stringify(lesson)) as LessonPlan;
    
    // Process Slides for Images
    if (storage) {
        console.log("Saving lesson... processing images...");
        const imageUploads = lessonToSave.slides.map(async (slide, idx) => {
            // 1. Main Slide Image
            if (slide.base64Image && !slide.base64Image.startsWith('http')) {
                slide.base64Image = await uploadImageIfNeeded(userId, lesson.id, `slide_${idx}_main_${Date.now()}`, slide.base64Image);
            }
            
            // 2. Practical Example Image
            if (slide.practicalExample?.base64Image && !slide.practicalExample.base64Image.startsWith('http')) {
                slide.practicalExample.base64Image = await uploadImageIfNeeded(userId, lesson.id, `slide_${idx}_ex_${Date.now()}`, slide.practicalExample.base64Image);
            }
        });

        await Promise.all(imageUploads);
    }

    const lessonRef = doc(db, 'users', userId, 'lessons', lesson.id);
    await setDoc(lessonRef, lessonToSave);
    console.log("Lesson saved to cloud successfully:", lesson.topic);
  } catch (e) {
    console.error("Error saving lesson:", e);
    throw e;
  }
};

export const getUserLessons = async (userId: string): Promise<LessonPlan[]> => {
  if (!db) return [];
  
  try {
    const lessonsRef = collection(db, 'users', userId, 'lessons');
    const q = query(lessonsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data() as LessonPlan);
  } catch (e) {
    console.error("Error fetching lessons:", e);
    return [];
  }
};

export const deleteUserLesson = async (userId: string, lessonId: string) => {
  if (!db) throw new Error("Database not initialized");
  
  try {
    await deleteDoc(doc(db, 'users', userId, 'lessons', lessonId));
    // Note: We are not deleting images from Storage here to keep it simple, 
    // but in a production app you would delete the associated folder in Storage.
  } catch (e) {
    console.error("Error deleting lesson:", e);
    throw e;
  }
};