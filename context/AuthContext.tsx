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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt?: Date;
    onboardingCompleted?: boolean;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    updateUserData: (data: Partial<UserData>) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch additional user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUserData({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            ...userDoc.data(),
                        } as UserData);
                    } else {
                        setUserData({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserData({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });
                }
            } else {
                setUserData(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            await updateProfile(userCredential.user, { displayName: fullName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email,
                displayName: fullName,
                createdAt: new Date(),
                onboardingCompleted: false,
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
                    errorMessage = 'הסיסמה חלשה מדי';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'הרשמה באימייל לא מאופשרת';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    };

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
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

    const updateUserData = async (data: Partial<UserData>) => {
        if (!user) return;

        try {
            await setDoc(doc(db, 'users', user.uid), data, { merge: true });
            setUserData((prev) => (prev ? { ...prev, ...data } : null));
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

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
                completeOnboarding,
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
