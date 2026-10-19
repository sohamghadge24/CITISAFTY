# SafeCity Intelligence - Quick Start Guide

This guide will help you get the **Community-Driven Intelligent Traffic Safety System** up and running on your local machine.

---

## 🏗 System Requirements
- **Node.js**: v18+ 
- **Python**: v3.10+
- **Database**: Supabase Account (or local PostgreSQL with PostGIS)

---

## 📂 Project Structure
```text
traffic_project_app/
├── backend/            # FastAPI + PyTorch + Supabase
│   ├── app/models/     # Custom ResNet models
│   └── ml_pipeline/    # Training scripts
├── Mobile/             # React Native (Expo) Citizen App
└── src/                # React (Vite) Admin Web Dashboard
```

---

## 🧠 Step 0: Train Custom AI Models (Optional)
The system comes with a training pipeline for specialized tasks.
1. **Activate Backend Environment**:
   ```bash
   cd backend && source venv/bin/activate
   ```
2. **Train Models**:
   ```bash
   # 1. Accident Severity
   python ml_pipeline/train.py --dataset_type accident --data_dir "../dataset/Accident" --epochs 20
   
   # 2. Traffic Violations
   python ml_pipeline/train.py --dataset_type violation --data_dir "../dataset/Traffic_Violation" --epochs 20
   
   # 3. Car Scratch Detection
   python ml_pipeline/train.py --dataset_type scratch --data_dir "../dataset/ scratch_car" --epochs 20
   ```
   *Models will be saved as `best_model_*.pth` in `backend/ml_pipeline/`.*

---

## ⚡ Step 1: Backend Setup (Smart City Brain)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   # venv\Scripts\activate  # Windows
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/` folder (Optional for Local Mode):
   ```env
   # Leave empty for Local SQLite Mode
   # SUPABASE_URL=your_supabase_project_url
   # SUPABASE_KEY=your_supabase_anon_key
   DATA_ENCRYPTION_KEY=your_secret_key_here
   ```

5. **Start the API Server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will be live at: `http://localhost:8000`*

---

## 🎨 Step 2: Frontend Setup (Visualization Layer)

1. **Navigate to the web admin directory:**
   ```bash
   cd frontend  # Or root depending on Web App positioning
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The web dashboard will be live at: `http://localhost:5173`*

---

## 📱 Step 3: Mobile App Setup (Citizen Interface)

1. **Navigate to the Mobile directory:**
   ```bash
   cd Mobile
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo Server:**
   ```bash
   npx expo start
   ```
   *You can scan the QR code using the Expo Go app on your phone to run the mobile application live mapping locally!*

---

## 🧠 Core Features to Test
1. **Camera/Upload**: Capture an incident or upload an image.
2. **Hybrid ML**: Watch the Edge AI (Frontend) and Hybrid Decision Engine (Backend) classify the incident.
3. **Emergency Routing**: Reports marked as "Critical" or "High" will automatically trigger Emergency Response protocols and update the map status.
4. **Privacy**: Check the console to see encryption status for PII data.

---

## 🛠 Support & Troubleshooting
- **ML Issues**: Ensure you have enough disk space for the pre-trained `BLIP` and `ResNet` models (approx 1GB).
- **Map Issues**: Ensure your database has the PostGIS extension enabled in Supabase.
