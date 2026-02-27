import { Phone } from "lucide-react";
import { useState } from "react";

export default function SOSButton() {
  const [pressed, setPressed] = useState(false);

  const handleSOS = () => {
    setPressed(true);
    // Vibration simulation via CSS
    setTimeout(() => setPressed(false), 2000);
  };

  return (
    <button
      onClick={handleSOS}
      className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
        ${pressed
          ? "bg-destructive/80 scale-95"
          : "bg-destructive hover:bg-destructive/90 hover:scale-105"
        }
      `}
      style={{ boxShadow: "0 0 20px hsl(0, 85%, 55%, 0.4)" }}
    >
      <Phone className="w-6 h-6 text-destructive-foreground" />
      {pressed && (
        <span className="absolute -top-10 right-0 bg-card border border-border text-xs px-3 py-1 rounded-lg text-foreground whitespace-nowrap animate-fade-in">
          SOS Dispatched!
        </span>
      )}
    </button>
  );
}
