import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';

const storage = getStorage();

/**
 * Upload receipt image to Firebase Storage
 * @param localUri - Local file URI (e.g., from camera/gallery)
 * @param transactionId - Unique transaction ID to use as filename
 * @returns Cloud URL of uploaded image
 */
export const uploadReceiptToCloud = async (
    localUri: string,
    transactionId: string
): Promise<string> => {
    try {
        console.log('📤 Uploading receipt to cloud:', transactionId);

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: 'base64',
        });

        // Convert base64 to blob
        const response = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await response.blob();

        // Create storage reference
        const storageRef = ref(storage, `receipts/${transactionId}.jpg`);

        // Upload file
        await uploadBytes(storageRef, blob);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        console.log('✓ Receipt uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('❌ Error uploading receipt:', error);
        console.log('⚠️ Using local URI as fallback');
        // Return local URI as fallback - receipt still works locally
        return localUri;
    }
};

/**
 * Get receipt URL (cloud or local)
 * @param uri - Receipt URI (could be cloud URL or local path)
 * @returns Valid URI for displaying image
 */
export const getReceiptUrl = (uri: string | undefined): string | undefined => {
    if (!uri) return undefined;

    // If already a cloud URL, return as-is
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
        return uri;
    }

    // Return local URI
    return uri;
};
