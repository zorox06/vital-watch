import { useState } from "react";
import { VITAL_CONFIGS, PATIENTS, getVitalStatus, computeRiskScore } from "@/lib/mockData";
import { useVitalsStream } from "@/hooks/useVitalsStream";
import PatientSelector from "@/components/dashboard/PatientSelector";
import VitalCard from "@/components/dashboard/VitalCard";
import RiskScore from "@/components/dashboard/RiskScore";
import EmergencyModal from "@/components/dashboard/EmergencyModal";
import AlertHistory from "@/components/dashboard/AlertHistory";
import VitalsTimeline from "@/components/dashboard/VitalsTimeline";
import BottomNav from "@/components/dashboard/BottomNav";
import SOSButton from "@/components/dashboard/SOSButton";
import NotificationBanner from "@/components/dashboard/NotificationBanner";
import ShiftSummary from "@/components/dashboard/ShiftSummary";
import ThresholdSettings from "@/components/dashboard/ThresholdSettings";

type Tab = "dashboard" | "alerts" | "history" | "settings";

const cardColors = [
  "mint-card",
  "sky-card",
  "lavender-card",
  "peach-card",
  "accent-card",
];

const Index = () => {
  const [patientId, setPatientId] = useState("p1");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { vitals, history, alerts, activeAlert, acknowledgeAlert, dispatchEmergency } = useVitalsStream(patientId);

  const patient = PATIENTS.find(p => p.id === patientId)!;
  const riskScore = computeRiskScore(vitals);
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const enrichedAlerts = alerts.map(a => ({ ...a, patientName: patient.name }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <NotificationBanner />

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Good morning 👋</p>
            <h1 className="text-2xl font-bold font-display text-foreground">Patient Monitor</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint text-success text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-success pulse-live" />
              Live
            </div>
          </div>
        </div>

        <PatientSelector selectedId={patientId} onSelect={setPatientId} />

        {activeTab === "dashboard" && (
          <div className="space-y-5 animate-fade-in">
            <RiskScore score={riskScore} />

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {VITAL_CONFIGS.map((config, i) => {
                const value = vitals[config.key];
                const status = getVitalStatus(config.key, value);
                return (
                  <VitalCard
                    key={config.key}
                    config={config}
                    value={value}
                    secondaryValue={config.key === "systolic" ? vitals.diastolic : undefined}
                    status={status}
                    history={history[config.key]}
                    colorClass={status === "critical" ? "soft-card" : cardColors[i % cardColors.length]}
                  />
                );
              })}
            </div>

            <VitalsTimeline history={history} />
            <ShiftSummary patientId={patientId} vitals={vitals} alertCount={alerts.length} />
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-peach flex items-center justify-center">
                <span className="text-sm">🚨</span>
              </div>
              <h2 className="text-sm font-bold font-display text-foreground">Alert History</h2>
            </div>
            <AlertHistory alerts={enrichedAlerts} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4 animate-fade-in">
            <VitalsTimeline history={history} />
            <ShiftSummary patientId={patientId} vitals={vitals} alertCount={alerts.length} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-fade-in">
            <ThresholdSettings />
          </div>
        )}
      </div>

      <SOSButton />
      <BottomNav active={activeTab} onTabChange={setActiveTab} alertCount={unacknowledgedCount} />

      {activeAlert && !activeAlert.acknowledged && (
        <EmergencyModal
          alert={{ ...activeAlert, patientName: patient.name }}
          onAcknowledge={acknowledgeAlert}
          onDispatch={dispatchEmergency}
        />
      )}
    </div>
  );
};

export default Index;
