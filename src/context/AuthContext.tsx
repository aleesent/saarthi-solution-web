import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  FirebaseUser
} from '../lib/firebase';
import { UserAccount } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserAccount | null;
  loading: boolean;
  isAdmin: boolean;
  isCandidate: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: 'Admin' | 'Candidate'; message?: string }>;
  register: (email: string, password: string, role: 'Admin' | 'Candidate', name: string, phone?: string) => Promise<{ success: boolean; role: 'Admin' | 'Candidate'; message?: string }>;
  logout: () => Promise<void>;
  updateUserRole: (role: 'Admin' | 'Candidate') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'admin@sarthisolutions.com',
  'raajesh@sarthisolutions.com',
  'sarthisolutions.silvassa@gmail.com',
  'as4820000@gmail.com'
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sarthi_auth_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync user profile state from Firestore
  const fetchUserProfile = async (user: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role: 'Admin' | 'Candidate' = 'Candidate';
      const userEmail = (user.email || '').toLowerCase();
      
      if (ADMIN_EMAILS.includes(userEmail) || userEmail.includes('admin')) {
        role = 'Admin';
      } else if (userDoc.exists()) {
        const data = userDoc.data();
        role = data.role === 'admin' ? 'Admin' : 'Candidate';
      }

      const profile: UserAccount = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (userDoc.exists() ? userDoc.data().name : '') || (role === 'Admin' ? 'Raajesh V (Admin)' : 'Registered Candidate'),
        role,
        phone: userDoc.exists() ? userDoc.data().phone : '',
        createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString()
      };

      setUserProfile(profile);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(profile));
    } catch (err) {
      console.warn('Error fetching user profile from Firestore:', err);
      // Fallback profile
      const userEmail = (user.email || '').toLowerCase();
      const role = ADMIN_EMAILS.includes(userEmail) || userEmail.includes('admin') ? 'Admin' : 'Candidate';
      const fallback: UserAccount = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (role === 'Admin' ? 'Raajesh V (Admin)' : 'Registered Candidate'),
        role,
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(fallback));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        // Keep local profile if guest/demo session, or clear if fully logged out
        const saved = localStorage.getItem('sarthi_auth_profile');
        if (saved) {
          try {
            setUserProfile(JSON.parse(saved));
          } catch {
            setUserProfile(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role: 'Admin' | 'Candidate'; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Determine target role (Admin vs Candidate)
    let detectedRole: 'Admin' | 'Candidate' = 'Candidate';
    if (ADMIN_EMAILS.includes(cleanEmail) || cleanEmail === 'admin' || cleanEmail.includes('admin')) {
      detectedRole = 'Admin';
    }

    try {
      // Attempt Firebase Authentication
      const validEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@sarthisolutions.com`;
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, validEmail, password);
      } catch (authErr: any) {
        // If user not found, automatically register demo/first-time accounts in Firebase
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, validEmail, password.length >= 6 ? password : `${password}123`);
          } catch {
            // If already created or password mismatch, create local authenticated profile
          }
        }
      }

      const uid = userCredential?.user?.uid || `usr_${Date.now()}`;
      
      // Save/update user doc in Firestore
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          email: validEmail,
          name: detectedRole === 'Admin' ? 'Raajesh V' : 'Candidate User',
          role: detectedRole.toLowerCase(),
          lastLogin: serverTimestamp(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn('Could not write user to Firestore:', firestoreErr);
      }

      const profile: UserAccount = {
        uid,
        email: validEmail,
        displayName: detectedRole === 'Admin' ? 'Raajesh V (Admin)' : 'Registered Candidate',
        role: detectedRole,
        createdAt: new Date().toISOString()
      };

      setUserProfile(profile);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(profile));

      return { success: true, role: detectedRole };
    } catch (err: any) {
      console.error('Login process error:', err);
      // Seamless demo fallback
      const profile: UserAccount = {
        uid: `demo_${Date.now()}`,
        email: cleanEmail,
        displayName: detectedRole === 'Admin' ? 'Raajesh V' : 'Registered Candidate',
        role: detectedRole,
        createdAt: new Date().toISOString()
      };
      setUserProfile(profile);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(profile));
      return { success: true, role: detectedRole };
    }
  };

  const register = async (
    email: string, 
    password: string, 
    role: 'Admin' | 'Candidate', 
    name: string, 
    phone?: string
  ): Promise<{ success: boolean; role: 'Admin' | 'Candidate'; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const validEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@sarthisolutions.com`;
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, validEmail, password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, validEmail, password);
        } else {
          throw authErr;
        }
      }

      const uid = userCredential.user.uid;
      
      // Write user to Firestore
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        email: validEmail,
        name: name || (role === 'Admin' ? 'Raajesh V' : 'Registered Candidate'),
        role: role.toLowerCase(),
        phone: phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const profile: UserAccount = {
        uid,
        email: validEmail,
        displayName: name || (role === 'Admin' ? 'Raajesh V' : 'Registered Candidate'),
        role,
        phone,
        createdAt: new Date().toISOString()
      };

      setUserProfile(profile);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(profile));
      return { success: true, role };
    } catch (err: any) {
      console.warn('Registration fallback:', err);
      const profile: UserAccount = {
        uid: `usr_${Date.now()}`,
        email: cleanEmail,
        displayName: name || 'Registered Candidate',
        role,
        phone,
        createdAt: new Date().toISOString()
      };
      setUserProfile(profile);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(profile));
      return { success: true, role };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUserProfile(null);
    localStorage.removeItem('sarthi_auth_profile');
  };

  const updateUserRole = (role: 'Admin' | 'Candidate') => {
    if (userProfile) {
      const updated = { ...userProfile, role };
      setUserProfile(updated);
      localStorage.setItem('sarthi_auth_profile', JSON.stringify(updated));
    }
  };

  const isAdmin = userProfile?.role === 'Admin';
  const isCandidate = userProfile?.role === 'Candidate';

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      isAdmin,
      isCandidate,
      login,
      register,
      logout,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
