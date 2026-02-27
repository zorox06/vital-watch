# VitalWatch — Remote Patient Monitoring IoT Agent

A **real-time, ML-powered remote patient monitoring system** built with React, TypeScript, and Supabase. Doctors create monitoring rooms and patients join with a 6-digit code to stream vitals in real-time across devices.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["🖥️ Client Layer — React + TypeScript"]
        direction TB
        subgraph PAGES["Pages"]
            IDX["Index Page<br/>(Role Selection)"]
            LOGIN["Login Page<br/>(Doctor / Patient Auth)"]
            DOC["Doctor Dashboard"]
            PAT["Patient Portal"]
        end

        subgraph COMPONENTS["Dashboard Components"]
            VC["VitalCard"]
            VT["VitalsTimeline"]
            RS["RiskScore"]
            MLP["MLInsightsPanel"]
            AD["AnomalyDetection"]
            PR["PatternRecognition"]
            PA["PredictiveAlerts"]
            TS["ThresholdSettings"]
            EM["EmergencyModal"]
            PS["PatientSelector"]
            SOS["SOSButton"]
            BN["BottomNav"]
        end

        subgraph HOOKS["Custom Hooks"]
            UR["useRoom"]
            UVS["useVitalsStream"]
            UML["useMLAnalysis"]
        end

        subgraph LIB["Core Libraries"]
            AUTH["auth.ts<br/>(Session Mgmt)"]
            RM["roomManager.ts<br/>(Room CRUD)"]
            MLE["mlEngine.ts<br/>(Client-side ML)"]
            MD["mockData.ts<br/>(Vital Simulation)"]
        end
    end

    subgraph BACKEND["☁️ Backend — Supabase"]
        direction TB
        SB_AUTH["Supabase Auth<br/>(JWT Sessions)"]
        SB_DB["PostgreSQL<br/>(Rooms, Profiles,<br/>Vitals History)"]
        SB_RT["Supabase Realtime<br/>(WebSocket Broadcast)"]
    end

    subgraph ML_SERVER["🧠 ML Server — Python / Flask"]
        direction TB
        FLASK["Flask API<br/>(app.py)"]
        ML_MODEL["ML Model<br/>(ml_model.py)"]
        MODELS["Trained Models<br/>(models/)"]
    end

    subgraph MOBILE["📱 Mobile — Capacitor"]
        APK["Android APK<br/>(WebView Wrapper)"]
    end

    %% Page routing
    IDX -->|"Select Role"| LOGIN
    LOGIN -->|"Doctor"| DOC
    LOGIN -->|"Patient"| PAT

    %% Dashboard uses components
    DOC --- VC & VT & RS & MLP & AD & PR & PA & TS & EM & PS
    PAT --- VC & SOS & BN

    %% Hooks connect pages to data
    DOC --> UR & UVS & UML
    PAT --> UR & UVS

    %% Hooks use libraries
    UR --> RM
    UVS --> MD
    UML --> MLE

    %% Library connections to backend
    AUTH --> SB_AUTH
    RM --> SB_DB
    UVS <-->|"WebSocket<br/>1s intervals"| SB_RT
    MLE -.->|"Optional REST"| FLASK

    %% ML Server internals
    FLASK --> ML_MODEL
    ML_MODEL --> MODELS

    %% Mobile wraps client
    APK -.->|"WebView"| CLIENT

    %% Styling
    classDef pages fill:#0d9488,stroke:#0f766e,color:#fff
    classDef components fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef hooks fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef libs fill:#d97706,stroke:#b45309,color:#fff
    classDef backend fill:#2563eb,stroke:#1d4ed8,color:#fff
    classDef ml fill:#dc2626,stroke:#b91c1c,color:#fff
    classDef mobile fill:#059669,stroke:#047857,color:#fff

    class IDX,LOGIN,DOC,PAT pages
    class VC,VT,RS,MLP,AD,PR,PA,TS,EM,PS,SOS,BN components
    class UR,UVS,UML hooks
    class AUTH,RM,MLE,MD libs
    class SB_AUTH,SB_DB,SB_RT backend
    class FLASK,ML_MODEL,MODELS ml
    class APK mobile
```

### Architecture Overview

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | SPA with role-based routing (Doctor/Patient) |
| **UI Framework** | Tailwind CSS + shadcn/ui | Glassmorphism cards, animations, responsive layout |
| **State & Data** | Custom Hooks + React Query | Room management, vitals streaming, ML analysis |
| **Client ML** | Custom mlEngine.ts | Z-score anomaly detection, trend prediction, pattern recognition |
| **Realtime** | Supabase Realtime Broadcast | WebSocket-based vital streaming at 1s intervals |
| **Database** | Supabase PostgreSQL | Rooms, user profiles, vitals history |
| **Auth** | Supabase Auth | JWT-based doctor/patient authentication |
| **ML Server** | Python Flask + scikit-learn | Server-side ML model inference (optional) |
| **Mobile** | Capacitor + Android WebView | Native Android APK wrapper |

### Data Flow

```mermaid
sequenceDiagram
    participant P as 👤 Patient
    participant App as 📱 React App
    participant SB as ☁️ Supabase Realtime
    participant Doc as 🩺 Doctor Dashboard
    participant ML as 🧠 ML Engine

    P->>App: Connect to Room (6-digit code)
    App->>SB: Subscribe to Room Channel

    loop Every 1 second
        App->>App: Generate/Read Vitals
        App->>SB: Broadcast Vitals (WebSocket)
        SB->>Doc: Push Vitals to Doctor
        Doc->>ML: Analyze Vitals
        ML-->>Doc: Risk Score + Anomalies + Predictions
        Doc->>Doc: Update Dashboard UI
    end

    Note over Doc: Doctor sees real-time vitals,<br/>ML insights, and alerts
```

---

## ✨ Features

### 🏥 Room-Based Architecture
- **Doctor Dashboard** — Create monitoring rooms with unique 6-digit codes
- **Patient Portal** — Join rooms and stream vitals to the doctor
- **Cross-Device** — Works across different browsers/devices via Supabase Realtime Broadcast

### 🧠 ML-Powered Analysis (Client-Side)
- **Anomaly Detection** — Z-score and IQR methods to detect abnormal vital readings
- **Trend Prediction** — Linear regression with 5-step forecasting
- **Pattern Recognition** — Identifies clinical deterioration patterns (sepsis, respiratory distress, etc.)
- **Risk Scoring** — Composite ML-enhanced risk score (0-100)
- **AI Insights** — Natural language insights and recommendations

### 📡 Real-Time Data Streaming
- Vitals update every **1 second** via Supabase Realtime Broadcast (WebSocket)
- Heart Rate, Blood Pressure, SpO₂, Temperature, Respiratory Rate
- Live connection status indicators

### 🔐 Authentication
- Separate login/signup for Doctors and Patients
- Demo credentials for quick testing
- Session persistence via localStorage

### 🎨 Premium UI
- Glassmorphism cards with backdrop-blur
- Gradient color system (teal for doctors, gold for patients)
- Staggered entry animations and micro-interactions
- Responsive design for all screen sizes

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install
```bash
git clone https://github.com/zorox06/vital-watch.git
cd vital-watch
npm install
```

### 2. Setup Supabase
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Run the SQL setup in your Supabase SQL Editor:
```sql
-- See supabase-setup.sql for full script
```

### 3. Run
```bash
npm run dev
```
Open `http://localhost:8080`

---

## 🧪 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Doctor | doctor@vitalwatch.com | doctor123 |
| Doctor | dr.chen@vitalwatch.com | chen123 |
| Patient | john@email.com | patient123 |
| Patient | sarah@email.com | patient123 |

## 🔄 How to Test

1. **Tab 1** → Select "I'm a Doctor" → Login → Create Monitoring Room → Note 6-digit code
2. **Tab 2** → Select "I'm a Patient" → Login → Enter room code → Connect
3. Patient vitals stream to doctor dashboard in real-time
4. Click **AI** tab on doctor dashboard for ML analysis

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React + TypeScript | Frontend framework |
| Vite | Build tool & dev server |
| Supabase | Database + Realtime Broadcast |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Recharts | Data visualization |
| Lucide React | Icons |
| Capacitor | Mobile (Android) wrapper |
| Python Flask | ML server backend |

## 📁 Project Structure

```
vital-watch/
├── src/
│   ├── pages/                  # Route pages
│   │   ├── Index.tsx           # Landing — role selection
│   │   ├── LoginPage.tsx       # Auth — doctor/patient login
│   │   ├── DoctorDashboard.tsx # Doctor monitoring view
│   │   └── PatientPortal.tsx   # Patient vitals streaming
│   ├── components/
│   │   ├── dashboard/          # 15 dashboard components
│   │   │   ├── VitalCard.tsx           # Individual vital display
│   │   │   ├── VitalsTimeline.tsx      # Historical chart
│   │   │   ├── RiskScore.tsx           # ML risk gauge
│   │   │   ├── MLInsightsPanel.tsx     # AI recommendations
│   │   │   ├── AnomalyDetection.tsx    # Anomaly alerts
│   │   │   ├── PatternRecognition.tsx  # Clinical patterns
│   │   │   ├── PredictiveAlerts.tsx    # Forecasting
│   │   │   ├── ThresholdSettings.tsx   # Alert thresholds
│   │   │   ├── EmergencyModal.tsx      # Emergency alerts
│   │   │   └── ...
│   │   └── ui/                 # 49 shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRoom.ts          # Room create/join logic
│   │   ├── useVitalsStream.ts  # Real-time vitals via Supabase
│   │   └── useMLAnalysis.ts    # ML engine integration
│   ├── lib/                    # Core business logic
│   │   ├── mlEngine.ts         # Client-side ML algorithms
│   │   ├── roomManager.ts      # Room CRUD operations
│   │   ├── auth.ts             # Authentication helpers
│   │   └── mockData.ts         # Vital data simulation
│   └── integrations/supabase/  # Supabase client & types
├── ml-server/                  # Python ML backend
│   ├── app.py                  # Flask REST API
│   ├── ml_model.py             # ML model logic
│   └── models/                 # Trained model files
├── android/                    # Capacitor Android project
├── supabase/                   # Supabase config
└── package.json
```

## 🧠 ML Algorithms

- **Z-Score Anomaly Detection** — Flags readings >2σ from the mean
- **IQR Outlier Detection** — Uses interquartile range for robust outlier identification
- **Linear Regression** — Fits trend lines and predicts 5 future values
- **Pattern Matching** — Heuristic rules for clinical patterns (sepsis, cardiac, respiratory)
- **Composite Risk Score** — Weighted combination of all ML signals

---

## 📄 License

MIT
