import { LayoutDashboard, Bell, Clock, Settings } from "lucide-react";

type Tab = "dashboard" | "alerts" | "history" | "settings";

interface Props {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  alertCount: number;
}

export default function BottomNav({ active, onTabChange, alertCount }: Props) {
  const tabs: { id: Tab; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", icon: LayoutDashboard },
    { id: "alerts", icon: Bell, badge: alertCount },
    { id: "history", icon: Clock },
    { id: "settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40" style={{ width: 'min(280px, 70vw)' }}>
      <div className="bg-card/95 backdrop-blur-xl border border-border/40 shadow-2xl shadow-black/10 rounded-[28px] px-3 py-2.5 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive
                ? "bg-primary/12 text-primary scale-110"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <Icon className={`w-[22px] h-[22px] transition-transform duration-200 ${isActive ? 'drop-shadow-sm' : ''}`} />
              {tab.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1 ring-[2.5px] ring-card shadow-md">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
