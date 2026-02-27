import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const notifications = [
  "Dr. Patel notified about John D. — BP spike at 14:32",
  "Shift change: Dr. Chen taking over CCU monitoring",
  "Sensor calibration required: Room ICU-210",
  "Emily L. temperature trending upward — monitor closely",
];

export default function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const showNotification = () => {
      setMessage(notifications[Math.floor(Math.random() * notifications.length)]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    const timer = setTimeout(showNotification, 8000);
    const interval = setInterval(showNotification, 25000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-3 animate-slide-down">
      <div className="max-w-lg mx-auto soft-card shadow-lg p-3.5 flex items-center gap-3 border-primary/20">
        <div className="w-8 h-8 rounded-xl bg-mint flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-success" />
        </div>
        <p className="text-xs text-foreground flex-1 leading-relaxed">{message}</p>
        <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
