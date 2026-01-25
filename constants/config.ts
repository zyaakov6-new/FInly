import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const CONFIG = {
    OCR_SPACE_API_KEY: extra.ocrSpaceApiKey || '',
    GOOGLE_CLOUD_VISION_API_KEY: extra.googleVisionApiKey || '',
    GEMINI_API_KEY: extra.geminiApiKey || '',
    GOOGLE_CLOUD_VISION_API_URL: 'https://vision.googleapis.com/v1/images:annotate'
};

// Validate that keys are loaded
if (!CONFIG.GOOGLE_CLOUD_VISION_API_KEY) {
    console.warn('⚠️ Google Cloud Vision API key not found in environment variables');
}
