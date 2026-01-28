import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getUserId } from '../utils/cloudSync';

interface UserProfile {
    fullName: string;
    email: string;
    phone: string;
    businessCategory: string;
    customCategory?: string;
    expenseCategories: string[];
    autoTrackExpenses: boolean;
    profilePicture?: string;
}

interface UserProfileContextType {
    userProfile: UserProfile | null;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
    loadUserProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
    fullName: '',
    email: '',
    phone: '',
    businessCategory: '',
    expenseCategories: [],
    autoTrackExpenses: true,
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const loadUserProfile = async () => {
        try {
            // Try to load from AsyncStorage first (local cache)
            const localProfile = await AsyncStorage.getItem('userProfile');
            if (localProfile) {
                setUserProfile(JSON.parse(localProfile));
            }

            // Then try to load from Firestore (cloud)
            const userId = await getUserId();
            const userDoc = await getDoc(doc(db, 'userProfiles', userId));

            if (userDoc.exists()) {
                const cloudProfile = userDoc.data() as UserProfile;
                setUserProfile(cloudProfile);
                // Update local cache
                await AsyncStorage.setItem('userProfile', JSON.stringify(cloudProfile));
            } else if (!localProfile) {
                // No profile exists yet, use default
                setUserProfile(DEFAULT_PROFILE);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to local storage if cloud fails
            const localProfile = await AsyncStorage.getItem('userProfile');
            if (localProfile) {
                setUserProfile(JSON.parse(localProfile));
            } else {
                setUserProfile(DEFAULT_PROFILE);
            }
        }
    };

    const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
        try {
            // Filter out undefined values (Firestore doesn't accept undefined)
            const cleanedUpdate = Object.fromEntries(
                Object.entries(profileUpdate).filter(([_, value]) => value !== undefined)
            );

            const updatedProfile = { ...userProfile, ...cleanedUpdate } as UserProfile;
            setUserProfile(updatedProfile);

            // Save to local storage
            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            // Clean the full profile for Firestore (remove undefined values)
            const cleanedProfile = Object.fromEntries(
                Object.entries(updatedProfile).filter(([_, value]) => value !== undefined)
            );

            // Save to Firestore
            const userId = await getUserId();
            await setDoc(doc(db, 'userProfiles', userId), cleanedProfile, { merge: true });

            console.log('✓ User profile updated successfully');
        } catch (error) {
            console.error('Error updating user profile:', error);
            // Still update local state even if cloud save fails
            const updatedProfile = { ...userProfile, ...profileUpdate } as UserProfile;
            setUserProfile(updatedProfile);
            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    return (
        <UserProfileContext.Provider value={{ userProfile, updateUserProfile, loadUserProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};
