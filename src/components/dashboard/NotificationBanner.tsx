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
    <div className="fixed top-0 left-0 right-0 z-50 p-2 animate-slide-up">
      <div className="max-w-lg mx-auto glass-card border border-primary/20 p-3 flex items-center gap-3">
        <div className="p-1.5 rounded-full bg-primary/15">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-foreground flex-1">{message}</p>
        <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
