import { Phone } from "lucide-react";
import { useState } from "react";

export default function SOSButton() {
  const [pressed, setPressed] = useState(false);

  const handleSOS = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 2500);
  };

  return (
    <button
      onClick={handleSOS}
      className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg
        ${pressed
          ? "bg-destructive/80 scale-90 shadow-destructive/30"
          : "bg-destructive hover:bg-destructive/90 hover:scale-105 shadow-destructive/25 hover:shadow-destructive/40"
        }
      `}
    >
      <Phone className="w-6 h-6 text-destructive-foreground" />
      {pressed && (
        <span className="absolute -top-12 right-0 soft-card px-3 py-1.5 text-xs font-semibold text-destructive whitespace-nowrap animate-fade-in shadow-md">
          🚨 SOS Dispatched!
        </span>
      )}
    </button>
  );
}
