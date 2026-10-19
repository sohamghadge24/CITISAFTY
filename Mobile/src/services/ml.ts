export class EdgeMLService {
    private isReady = false;

    async init() {
        if (this.isReady) return;

        // Simulate loading the ONNX/Transformers.js BLIP model into memory
        return new Promise(resolve => {
            setTimeout(() => {
                this.isReady = true;
                resolve(true);
            }, 1500);
        });
    }

    /**
     * Edge-based Image Captioning (Simulated for React Native)
     * In production with actual @xenova/transformers in React Native, 
     * this would run the WASM-based ONNX model directly on the mobile edge.
     */
    async generateCaption(imageUri: string) {
        if (!this.isReady) await this.init();

        // Simulate inference time
        await new Promise(resolve => setTimeout(resolve, 800));

        // For demo purposes, we randomly assign a caption based on a hash of the URI length
        // or just return a static hybrid caption that the backend will use.
        const captions = [
            "two cars piled up in heavy traffic",
            "white car swerving across median",
            "heavy traffic congestion under a bridge",
            "clear road with no vehicles present"
        ];

        const index = imageUri.length % captions.length;
        const generatedCaption = captions[index];

        const triggers = {
            high: ['accident', 'fire', 'crash', 'police', 'ambulance', 'smoke', 'blocked', 'flipped', 'injury', 'piled up'],
            medium: ['traffic', 'heavy', 'crowd', 'puddle', 'debris', 'stall', 'breakdown', 'congestion', 'swerving'],
            low: ['clear', 'empty', 'parked', 'minor', 'construction', 'sign']
        };

        let predictedSeverity = 'Low';
        if (triggers.high.some(k => generatedCaption.includes(k))) {
            predictedSeverity = 'High';
        } else if (triggers.medium.some(k => generatedCaption.includes(k))) {
            predictedSeverity = 'Medium';
        }

        return {
            caption: generatedCaption,
            edgeSeverity: predictedSeverity,
            confidence: 0.85
        };
    }
}

export const edgeMLService = new EdgeMLService();
