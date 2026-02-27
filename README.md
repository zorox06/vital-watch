# VitalWatch — Remote Patient Monitoring IoT Agent

A **real-time, ML-powered remote patient monitoring system** built with React, TypeScript, and Supabase. Doctors create monitoring rooms and patients join with a 6-digit code to stream vitals in real-time across devices.

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

## 📁 Project Structure

```
src/
├── components/dashboard/   # Vital cards, charts, ML components
├── hooks/                  # useRoom, useMLAnalysis, useVitalsStream
├── lib/                    # roomManager, mlEngine, auth, mockData
├── pages/                  # Index, LoginPage, DoctorDashboard, PatientPortal
└── integrations/supabase/  # Supabase client & types
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
