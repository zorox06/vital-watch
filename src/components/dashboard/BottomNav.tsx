import { LayoutDashboard, Bell, Clock, Settings } from "lucide-react";

type Tab = "dashboard" | "alerts" | "history" | "settings";

interface Props {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  alertCount: number;
}

export default function BottomNav({ active, onTabChange, alertCount }: Props) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "history", label: "History", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all duration-200 relative ${
                isActive ? "text-primary bg-primary/8" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {tab.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold px-1">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
