# SafeCity Intelligence • Incident Reporting System

An industry-grade, AI-powered traffic safety reporting platform designed for smart city ecosystems.

## 🚀 Key Features
- **Hybrid ML Core**: Combines broad-spectrum perception (BLIP) with specialized classification logic for high-accuracy severity detection.
- **Automated Geotagging**: Precise location capture (緯度/経度) using modern Geolocation APIs.
- **Micro-Inference**: Edge AI execution for immediate feedback, reducing server dependency and enhancing privacy.
- **Premium UX**: Glassmorphic design language with fluid transitions and responsive layouts.

## 🧠 Hybrid ML Architecture
The platform utilizes a multi-stage analysis pipeline:
1. **Perception Layer (Pre-trained)**: Uses `transformers.js` (Xenova/blip-image-captioning-base) to perform high-fidelity image-to-text conversion.
2. **Specialized Layer (Your Model)**: A custom rule-based classification engine that evaluates the metadata and visual features to determine incident severity (High/Medium/Low).
3. **Validation Layer**: Rule-based scoring to ensure reporting accuracy before submission.

## 🛠 Tech Stack
- **Frontend**: React + Vite + Framer Motion
- **Inference Engine**: @xenova/transformers
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Premium Glassmorphism)

## 📍 Compliance
- **Privacy**: No image data leaves the device during original analysis.
- **Security**: Geotag and Timestamp are immutable after capture.
- **Standard**: Built with AAA (Accessibility) and industry-level responsiveness in mind.
