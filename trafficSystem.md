# SafeCity Intelligence • Traffic Safety Ecosystem

## 1. Project Overview
**SafeCity Intelligence** is an industry-grade, AI-powered traffic safety and incident reporting platform designed for next-generation smart cities. It leverages a **Hybrid Decision Architecture** that combines Edge AI (client-side) for immediate perception with a robust Server-side engine for authoritative severity classification and emergency response triggering.

The system empowers citizens to report accidents and hazards in real-time while providing authorities with a centralized, data-driven dashboard for traffic management and resource allocation.

## 2. Core Features

### 🚨 AI-Powered Incident Reporting
*   **Smart Capture**: Integrated camera interface with scan-line visualization.
*   **Edge Perception**: Uses `transformers.js` (BLIP model) directly in the browser to generate detailed descriptions of the scene without server latency.
*   **Automated Metadata**:
    *   **Geotagging**: High-precision latitude/longitude injection.
    *   **Timestamping**: Immutable, cryptographically aligned time records.
*   **Privacy-First**: Preliminary analysis happens on the user's device.

### 🧠 Hybrid ML Engine
*   **Layer 1: Edge Inference (Frontend)**
    *   Lightweight image-to-text conversion (BLIP) for user feedback.
    *   Immediate validation of image quality.
*   **Layer 2: Specialized Deep Learning (Backend)**
    *   **Architecture**: Ensemble of custom-trained ResNet-50 models.
    *   **Models**:
        1.  **Accident Severity**: Classifies incidents as High, Medium, or Low.
        2.  **Traffic Violation**: Detects helmet violations and overloading.
        3.  **Car Scratch**: Identifies vehicle damage for insurance/claims.
    *   **Logic**: Multi-stage analysis combining visual classification with metadata heuristics.
    *   **Outcome**: Comprehensive incident report with severity, violation type, and damage assessment.
*   **Comparison Engine**: Dedicated visual interface to compare the lightweight Edge AI outputs with rigorous Server AI verification.

### 🗺️ Live Operations Dashboard
*   **Real-Time Map**: Interactive vector maps (MapLibre/Leaflet) visualizing active incidents.
*   **Unified Traffic Alerts**: Consolidates real-time incident data from TomTom APIs and the backend platform for holistic area intelligence.
*   **Route Intelligence**: Visualization of traffic flow, congestion, and optimal paths using open-source routing (e.g., OSRM/GraphHopper).

### 🛡️ Admin & Response System
*   **Role-Based Access**: Secure portals for traffic police and emergency responders.
*   **Dispatcher Mode**: Workflow for validating reports and dispatching ambulances/towing (Planned: Status tracking).
*   **Analytics**: Historical data views for long-term safety planning.
*   **Privacy Guard**: Automated blurring of faces/plates before public display (Planned).

## 3. Technical Architecture

### Mobile (Citizen Interface)
*   **Framework**: React Native (Expo)
*   **Navigation**: Expo Router (File-based)
*   **State Management**: Redux Toolkit
*   **Design System**: Premium Luxury Glassmorphism (Dark Theme, BlurViews, Soft Glows)
*   **Typography**: `@expo-google-fonts` (Outfit & Inter)
*   **Maps**: `react-native-maps` (Dark Mode enabled)

### Web (Admin Dashboard)
*   **Framework**: React 19 + Vite (SWC)
*   **State Management**: Zustand
*   **Design System**: Custom CSS with Premium Glassmorphism.

### Backend (Smart City Brain)
*   **API Framework**: FastAPI (Python) - Async, high-performance.
*   **ML Pipeline**: PyTorch + ThreadPoolExecutor for non-blocking inference.
*   **Database**:
    *   **Production**: Supabase (PostgreSQL + PostGIS extensions).
    *   **Development**: Local SQLite with spatial capabilities.

### Infrastructure & Deployment
*   **Containerization**: Docker support for backend services.
*   **Geospatial**: PostGIS for advanced spatial queries (radius search, route intersection).

## 4. Technology Stack Summary

| Domain | Technology | Use Case |
| :--- | :--- | :--- |
| **Mobile App** | React Native (Expo) | Citizen Interface, Camera, GPS |
| **Web App** | React, Vite | Admin Dashboard & Visualization |
| **Mobile UI** | Expo Blur, Linear Gradients | Premium Luxury Glassmorphism |
| **Edge AI** | Simulated ONNX/Transformers.js | Client-side Image Captioning |
| **Backend** | Python, FastAPI | REST API & Orchestration |
| **Server AI** | PyTorch, ResNet-50 | Severity Classification |
| **Database** | PostgreSQL, Supabase | Relational & Geospatial Data |
| **Maps** | MapLibre GL | Vector Map Rendering |

## 5. Development Roadmap & Status

### Phase 1: Foundation (✅ Completed)
- [x] Project scaffolding (Frontend/Backend).
- [x] Basic UI System (Glassmorphism).
- [x] Interactive Map integration.

### Phase 2: Perception & Reporting (✅ Completed)
- [x] Camera & Geolocation modules.
- [x] Frontend BLIP integration (Image-to-Text).
- [x] Backend ResNet-50 pipeline.
- [x] Hybrid Severity Logic implementation.

### Phase 3: Platform Integration (✅ Completed)
- [x] Full connection of Report Submission API.
- [x] Admin Dashboard data population & navigation.
- [x] Real-time updates via WebSockets (ws://).
- [x] Route simulation, AI Routing, and display.
- [x] Luxury UI / UX Redesign on Mobile App.

### Phase 4: Production Polish (🚧 In Progress)
- [x] Performance optimization (Lazy loading models, Dynamic Host IP).
- [ ] PWA & Full Native App Compilation.
- [ ] Comprehensive Unit & Integration Tests.

## 6. System Gaps & Mitigations
Based on industry analysis, we have identified and are addressing the following:
1.  **Hybrid Architecture**: Addressed via Frontend Edge AI (BLIP) + Backend Deep Learning.
2.  **Multi-Stage Validation**: Partially addressed; enhancing with Rule-Based Verification (Metadata checks).
3.  **Citizen-Centricity**: Core design philosophy; leveraging distributed human sensors.
4.  **Operational Workflow**: Building a dedicated Dispatcher Dashboard for status tracking.
5.  **Privacy**: Implementing automated PII masking for public-facing data.
