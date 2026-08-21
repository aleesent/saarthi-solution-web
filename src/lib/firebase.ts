import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (handling custom database ID from config if present)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

/**
 * Upload a file to Firebase Storage
 * @param path Storage destination path, e.g. "resumes/user_123_resume.pdf"
 * @param file File or Blob to upload
 * @param customMetadata Optional metadata
 */
export async function uploadFileToStorage(
  path: string, 
  file: File | Blob, 
  customMetadata?: Record<string, string>
): Promise<{ downloadUrl: string; fullPath: string; fileName: string; fileSize: number; fileType: string }> {
  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: customMetadata || {}
    };
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return {
      downloadUrl,
      fullPath: snapshot.ref.fullPath,
      fileName: (file as File).name || path.split('/').pop() || 'document',
      fileSize: file.size,
      fileType: file.type || 'application/pdf'
    };
  } catch (error) {
    console.warn('Firebase Storage upload failed or offline fallback triggered:', error);
    // If client is in an environment without direct bucket access, create a safe data URL / object URL representation
    if (file instanceof File || file instanceof Blob) {
      const fallbackUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return {
        downloadUrl: fallbackUrl,
        fullPath: path,
        fileName: (file as File).name || 'document',
        fileSize: file.size,
        fileType: file.type || 'application/pdf'
      };
    }
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFileFromStorage(path: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn('Could not delete storage file:', error);
    return false;
  }
}

export {
  app,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};
export type { FirebaseUser };
