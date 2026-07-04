import { Phone, PhoneOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useUpdateCallStatus } from "../hooks/useBackend";
import type { CallView } from "../types";

interface IncomingCallPageProps {
  call: CallView;
  onAccept: () => void;
  onDecline: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCallDuration(startedAt: bigint, endedAt?: bigint): string {
  const start = Number(startedAt) / 1_000_000;
  const end = endedAt ? Number(endedAt) / 1_000_000 : Date.now();
  const diffSec = Math.floor((end - start) / 1000);
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function IncomingCallPage({
  call,
  onAccept,
  onDecline,
}: IncomingCallPageProps) {
  const updateCallStatus = useUpdateCallStatus();
  const [ringCount, setRingCount] = useState(0);

  // Auto-increment ring animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRingCount((c) => (c + 1) % 4);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const callerName = call.callerDisplayName || call.callerUsername || "Unknown";
  const callerInitials = getInitials(callerName);

  function handleAccept() {
    updateCallStatus.mutate(
      {
        callId: call.callId,
        status: "active" as import("../backend.d").CallStatus,
      },
      { onSuccess: onAccept },
    );
  }

  function handleDecline() {
    updateCallStatus.mutate(
      {
        callId: call.callId,
        status: "declined" as import("../backend.d").CallStatus,
      },
      { onSuccess: onDecline },
    );
  }

  return (
    <div className="call-screen-overlay" data-ocid="incoming_call.page">
      <div className="call-modal glass-modal max-w-sm w-full mx-4">
        {/* Pulsing avatar with expanding rings */}
        <div className="relative flex items-center justify-center">
          {/* Expanding ring animations */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-primary/30"
              style={{
                width: `${120 + (i + 1) * 40}px`,
                height: `${120 + (i + 1) * 40}px`,
                opacity: ringCount === i ? 0.6 : 0,
                transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                transform: ringCount === i ? "scale(1.1)" : "scale(1)",
              }}
            />
          ))}

          {/* Avatar */}
          <div className="call-avatar" data-ocid="incoming_call.avatar">
            {call.callerAvatarUrl ? (
              <img
                src={call.callerAvatarUrl}
                alt={callerName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="font-display font-bold text-primary-foreground">
                {callerInitials}
              </span>
            )}
          </div>
        </div>

        {/* Caller info */}
        <div className="text-center space-y-1">
          <p
            className="font-display font-bold text-2xl text-foreground"
            data-ocid="incoming_call.caller_name"
          >
            {callerName}
          </p>
          <p className="text-sm text-muted-foreground animate-pulse">
            Incoming video call
          </p>
          {call.startedAt && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {formatCallDuration(call.startedAt)}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="call-button-group">
          <button
            type="button"
            onClick={handleDecline}
            className="call-button call-button-decline flex items-center gap-2"
            data-ocid="incoming_call.decline_button"
            aria-label="Decline call"
          >
            <PhoneOff size={20} />
            <span>Decline</span>
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="call-button call-button-accept flex items-center gap-2"
            data-ocid="incoming_call.accept_button"
            aria-label="Accept call"
          >
            <Phone size={20} />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
