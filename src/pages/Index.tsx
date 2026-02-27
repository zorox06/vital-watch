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

const Index = () => {
  const [patientId, setPatientId] = useState("p1");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { vitals, history, alerts, activeAlert, acknowledgeAlert, dispatchEmergency } = useVitalsStream(patientId);

  const patient = PATIENTS.find(p => p.id === patientId)!;
  const riskScore = computeRiskScore(vitals);
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  // Enrich alert patient names
  const enrichedAlerts = alerts.map(a => ({ ...a, patientName: patient.name }));

  return (
    <div className="min-h-screen gradient-radial pb-20">
      <NotificationBanner />

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Patient Monitor</h1>
            <p className="text-xs text-muted-foreground font-mono">RPM-IoT <span className="text-primary pulse-live">● LIVE</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
            <p className="text-xs font-mono text-muted-foreground">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <PatientSelector selectedId={patientId} onSelect={setPatientId} />

        {activeTab === "dashboard" && (
          <div className="space-y-4 animate-fade-in">
            <RiskScore score={riskScore} />

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {VITAL_CONFIGS.map(config => {
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
                  />
                );
              })}
            </div>

            <VitalsTimeline history={history} />
            <ShiftSummary patientId={patientId} vitals={vitals} alertCount={alerts.length} />
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-semibold text-foreground">Alert History</h2>
            <AlertHistory alerts={enrichedAlerts} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-semibold text-foreground">Vitals Timeline</h2>
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
