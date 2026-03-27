import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Complete user profile data stored in Firestore
interface UserProfileData {
    uid: string;
    email: string | null;
    displayName: string | null;
    fullName: string | null;
    phone: string | null;
    photoURL: string | null;
    businessCategory: string | null;
    customCategory: string | null;
    expenseCategories: string[];
    autoTrackExpenses: boolean;
    createdAt: Date;
    updatedAt: Date;
    onboardingCompleted: boolean;
}

interface AuthContextType {
    user: User | null;
    userData: UserProfileData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    updateUserData: (data: Partial<UserProfileData>) => Promise<void>;
    saveOnboardingStep2: (businessCategory: string, customCategory?: string) => Promise<void>;
    saveOnboardingStep3: (expenseCategories: string[], autoTrackExpenses: boolean) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = async (firebaseUser: User): Promise<UserProfileData | null> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    fullName: data.fullName || firebaseUser.displayName,
                    phone: data.phone || null,
                    photoURL: firebaseUser.photoURL || data.photoURL || null,
                    businessCategory: data.businessCategory || null,
                    customCategory: data.customCategory || null,
                    expenseCategories: data.expenseCategories || [],
                    autoTrackExpenses: data.autoTrackExpenses || false,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    onboardingCompleted: data.onboardingCompleted || false,
                };
            }
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                fullName: firebaseUser.displayName,
                phone: null,
                photoURL: firebaseUser.photoURL,
                businessCategory: null,
                customCategory: null,
                expenseCategories: [],
                autoTrackExpenses: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                onboardingCompleted: false,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const data = await fetchUserData(firebaseUser);
                setUserData(data);
            } else {
                setUserData(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Refresh user data from Firestore
    const refreshUserData = async () => {
        if (!user) return;
        const data = await fetchUserData(user);
        setUserData(data);
    };

    // Sign up new user with email, password, name, and phone
    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        phone: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // Create user with Firebase Auth (password is securely stored by Firebase)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name in Firebase Auth
            await updateProfile(userCredential.user, { displayName: fullName });

            // Create comprehensive user document in Firestore
            const userProfileData = {
                email,
                displayName: fullName,
                fullName,
                phone,
                photoURL: null,
                businessCategory: null,
                customCategory: null,
                expenseCategories: [],
                autoTrackExpenses: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                onboardingCompleted: false,
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), userProfileData);

            // Update local state
            setUserData({
                uid: userCredential.user.uid,
                ...userProfileData,
            });

            return { success: true };
        } catch (error: any) {
            let errorMessage = 'שגיאה ביצירת חשבון';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'כתובת האימייל כבר בשימוש';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'כתובת אימייל לא תקינה';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'הסיסמה חלשה מדי (מינימום 6 תווים)';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'הרשמה באימייל לא מאופשרת';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    };

    // Sign in with email and password (Firebase validates password securely)
    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Firebase Auth securely validates the password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Fetch user data after successful login
            const data = await fetchUserData(userCredential.user);
            setUserData(data);

            return { success: true };
        } catch (error: any) {
            let errorMessage = 'שגיאה בהתחברות';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'כתובת אימייל לא תקינה';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'החשבון הושבת';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'משתמש לא נמצא';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'סיסמה שגויה';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'אימייל או סיסמה שגויים';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'יותר מדי נסיונות, נסה שוב מאוחר יותר';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            setUserData(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            let errorMessage = 'שגיאה בשליחת אימייל לאיפוס סיסמה';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'כתובת אימייל לא תקינה';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'משתמש לא נמצא';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    };

    // Update any user data in Firestore
    const updateUserData = async (data: Partial<UserProfileData>) => {
        if (!user) return;

        try {
            const updateData = {
                ...data,
                updatedAt: new Date(),
            };
            await updateDoc(doc(db, 'users', user.uid), updateData);
            setUserData((prev) => (prev ? { ...prev, ...updateData } : null));
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    // Save onboarding step 2 data (business category)
    const saveOnboardingStep2 = async (businessCategory: string, customCategory?: string) => {
        if (!user) return;

        try {
            const updateData: any = {
                businessCategory,
                updatedAt: new Date(),
            };
            if (customCategory) {
                updateData.customCategory = customCategory;
            }
            await updateDoc(doc(db, 'users', user.uid), updateData);
            setUserData((prev) => (prev ? { ...prev, ...updateData } : null));
        } catch (error) {
            console.error('Error saving onboarding step 2:', error);
        }
    };

    // Save onboarding step 3 data (expense categories)
    const saveOnboardingStep3 = async (expenseCategories: string[], autoTrackExpenses: boolean) => {
        if (!user) return;

        try {
            const updateData = {
                expenseCategories,
                autoTrackExpenses,
                updatedAt: new Date(),
            };
            await updateDoc(doc(db, 'users', user.uid), updateData);
            setUserData((prev) => (prev ? { ...prev, ...updateData } : null));
        } catch (error) {
            console.error('Error saving onboarding step 3:', error);
        }
    };

    // Complete onboarding
    const completeOnboarding = async () => {
        await updateUserData({ onboardingCompleted: true });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                logOut,
                resetPassword,
                updateUserData,
                saveOnboardingStep2,
                saveOnboardingStep3,
                completeOnboarding,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
