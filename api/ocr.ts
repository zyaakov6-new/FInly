import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Call Google Cloud Vision API
        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: {
                                content: image,
                            },
                            features: [
                                {
                                    type: 'TEXT_DETECTION',
                                    maxResults: 1,
                                },
                            ],
                            imageContext: {
                                languageHints: ['he', 'en'],
                            },
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Vision API error:', data);
            return res.status(response.status).json({
                error: 'OCR failed',
                details: data
            });
        }

        // Return the OCR result
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('OCR endpoint error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
