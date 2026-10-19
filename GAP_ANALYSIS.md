
# Missing Architecture & Strategy Gaps Analysis

This document identifies specific gaps in the current system architecture relative to common pitfalls in smart city deployments, and outlines our mitigation strategies.

## 1. Lack of Hybrid Edge–Server Architectures
**Gap Assessment**: **Addressed.**
*   **Current State**: Our system implements a true hybrid model.
    *   **Edge (Mobile App)**: The newly designed React Native (Expo) mobile application uses simulated `Transformers.js` (BLIP) for immediate image captioning and preliminary validation directly on the user's phone, locking down API floods.
    *   **Server (Backend)**: Uses specialized ResNet-50 ensembles on FastAPI for authoritative severity, violation, and damage classification.
*   **Mitigation**: We avoid the "fully centralized" trap by offloading perception tasks (captioning) to the mobile client, reducing server load and providing instant feedback.

## 2. Absence of Multi-Stage Validation Pipelines
**Gap Assessment**: **Partially Addressed (Needs Reinforcement).**
*   **Current State**: We have a "Hybrid Decision Architecture" that combines visual probabilities with naive keyword heuristics.
*   **Missing**: A formal "Rule-Based Verification" stage that cross-references metadata (e.g., "Is this location a known road?", "Is the speed realistic?").
*   **Action Plan**: Implement a **Rule Engine** layer in `backend/app/services/validation.py` before ML inference to filter obvious anomalies (e.g., GPS coordinates in the ocean).

## 3. Limited Focus on Citizen-Driven Evidence Models
**Gap Assessment**: **Addressed.**
*   **Current State**: The entire platform is built as a "Citizen-Driven" tool via a dedicated luxury Mobile App.
    *   **Features**: One-tap driver-optimized UI, Gamified reporting (User Profiles & Trust Scores), Real-time WebSocket accident alerts, and privacy-first capturing.
*   **Differentiation**: Unlike infrastructure-heavy sensor networks (CCTV), we rely on distributed human intelligence via citizen smartphones, making the system hyper-scalable without installing new city hardware.

## 4. Insufficient Integration of Operational Workflows
**Gap Assessment**: **Gap Exists.**
*   **Current State**: The system effectively *detects* and *classifies* incidents but lacks a robust "Dispatcher Dashboard" for operational response.
*   **Missing**: 
    - Automated alerts to specific authority roles (Police vs. EMS).
    - Status tracking for dispatch units (e.g., "Ambulance Dispatched").
*   **Action Plan**: Build the **Dispatcher Control Room** module in the Frontend to allow authorities to update incident status (`Verified` -> `Dispatched` -> `Resolved`).

## 5. Privacy Concerns in Centralized AI Systems
**Gap Assessment**: **Gap Exists.**
*   **Current State**: We transmit raw images to the server for analysis.
*   **Missing**: Automated PII masking (faces/license plates) *before* long-term storage or public map display.
*   **Action Plan**: Integrate a lightweight anonymization step (e.g., using a small YOLO model or blurring API) to sanitize images before they are persisted to the public database.

## 6. Unbounded Geographical Search Resolution
**Gap Assessment**: **Addressed.**
*   **Current State**: Previously, utilizing open-source geocoders (Photon/Nominatim) for routing queries would occasionally resolve generic or colloquial Indian names (like "Mit ADT" or "Destination") to locations in foreign countries (e.g., California, Myanmar), resulting in massive intercontinental routing lines being rendered on the MapLibre engine.
*   **Mitigation**: Geocoding API fetch requests have been strictly constrained to the Indian Subcontinent using bounding boxes (`bbox=68.1,6.7,97.4,35.5`) and strict ISO country codes (`countrycodes=in`). This ensures computational resources aren't wasted on mathematically unfeasible intercontinental edge-routing.
