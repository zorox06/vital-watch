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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
