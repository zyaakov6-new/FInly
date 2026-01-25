export default {
    expo: {
        name: "Finly",
        slug: "finly",
        version: "1.0.0",
        orientation: "portrait",
        userInterfaceStyle: "dark",
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true
        },
        android: {
            package: "com.zyaakov6.finly",
            adaptiveIcon: {
                backgroundColor: "#0A0E27"
            }
        },
        web: {},
        extra: {
            supportsRTL: true,
            // API Keys from environment variables
            ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY,
            googleVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY,
        }
    }
};
