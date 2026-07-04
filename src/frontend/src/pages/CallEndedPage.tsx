import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CallView } from "../types";

interface CallEndedPageProps {
  call: CallView;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function CallEndedPage({ call, onClose }: CallEndedPageProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const otherName = call.callerDisplayName || call.callerUsername || "Unknown";
  const otherInitials = getInitials(otherName);

  // Calculate duration
  const durationSec =
    call.endedAt && call.startedAt
      ? Math.floor(
          (Number(call.endedAt) - Number(call.startedAt)) / 1_000_000_000,
        )
      : 0;

  function handleMessage() {
    const otherId = call.callerId.toString();
    navigate({ to: "/chat/$userId", params: { userId: otherId } });
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      data-ocid="call_ended.page"
    >
      <div
        className={`glass-modal max-w-sm w-full mx-4 p-8 flex flex-col items-center gap-6 transition-all duration-500 ${
          visible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-3 border-primary/20">
          {call.callerAvatarUrl ? (
            <img
              src={call.callerAvatarUrl}
              alt={otherName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-display font-bold text-2xl text-primary">
              {otherInitials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <p className="font-display font-bold text-xl text-foreground">
            Call ended
          </p>
          <p className="text-sm text-muted-foreground">with {otherName}</p>
          <p className="text-lg font-mono font-semibold text-primary mt-2">
            {formatDuration(durationSec)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleMessage}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 active:scale-95"
            data-ocid="call_ended.message_button"
          >
            <MessageCircle size={18} />
            <span>Message {otherName.split(" ")[0]}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted text-foreground font-semibold text-sm transition-all duration-200 active:scale-95"
            data-ocid="call_ended.close_button"
          >
            <X size={18} />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
