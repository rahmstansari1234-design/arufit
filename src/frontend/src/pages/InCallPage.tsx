import { Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEndCall } from "../hooks/useBackend";
import type { CallView } from "../types";

interface InCallPageProps {
  call: CallView;
  myProfile: {
    displayName: string;
    avatarUrl?: string;
  } | null;
  onEnd: () => void;
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

// Network quality indicator component
function NetworkIndicator({ quality }: { quality: number }) {
  const bars = [
    { color: "bg-destructive", threshold: 1 },
    { color: "bg-yellow-500", threshold: 2 },
    { color: "bg-yellow-400", threshold: 3 },
    { color: "bg-primary", threshold: 4 },
  ];

  return (
    <div
      className="flex items-end gap-0.5 h-4"
      data-ocid="incall.network_indicator"
    >
      {bars.map((bar, i) => (
        <div
          key={bar.threshold}
          className={`w-1 rounded-sm transition-all duration-300 ${
            quality >= bar.threshold ? bar.color : "bg-muted"
          }`}
          style={{ height: `${(i + 1) * 4}px` }}
        />
      ))}
    </div>
  );
}

export default function InCallPage({
  call,
  myProfile,
  onEnd,
}: InCallPageProps) {
  const endCall = useEndCall();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [networkQuality, setNetworkQuality] = useState(4);

  // Local video PIP position
  const [pipPos, setPipPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, pipX: 0, pipY: 0 });
  const pipRef = useRef<HTMLDivElement>(null);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate network quality fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkQuality(Math.floor(Math.random() * 4) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const otherName = call.callerDisplayName || call.callerUsername || "Unknown";
  const otherInitials = getInitials(otherName);
  const myName = myProfile?.displayName || "You";
  const myInitials = getInitials(myName);

  // Drag handlers for PIP
  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragStart.current = {
        x: clientX,
        y: clientY,
        pipX: pipPos.x,
        pipY: pipPos.y,
      };
    },
    [pipPos],
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      setPipPos({
        x: dragStart.current.pipX + dx,
        y: dragStart.current.pipY + dy,
      });
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Snap to nearest corner
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pipW = 120;
    const pipH = 160;
    const margin = 16;

    setPipPos((pos) => {
      const centerX = pos.x + pipW / 2;
      const centerY = pos.y + pipH / 2;
      const snapX = centerX < vw / 2 ? margin : vw - pipW - margin;
      const snapY = centerY < vh / 2 ? margin : vh - pipH - margin - 100; // offset for controls
      return { x: snapX, y: snapY };
    });
  }, []);

  function handleEndCall() {
    endCall.mutate(call.callId, { onSuccess: onEnd });
  }

  return (
    <div
      className="fixed inset-0 bg-background z-50 flex flex-col"
      data-ocid="incall.page"
    >
      {/* Remote video placeholder (full screen background) */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
            {call.callerAvatarUrl ? (
              <img
                src={call.callerAvatarUrl}
                alt={otherName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="font-display font-bold text-4xl text-primary">
                {otherInitials}
              </span>
            )}
          </div>
          <p className="font-display font-semibold text-lg text-foreground">
            {otherName}
          </p>
          <p className="text-sm text-muted-foreground">Video call</p>
        </div>
      </div>

      {/* Top overlay */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        {/* Network quality */}
        <div className="glass-modal px-3 py-1.5 rounded-full flex items-center gap-2">
          <NetworkIndicator quality={networkQuality} />
          <span className="text-xs text-muted-foreground font-mono">
            {networkQuality >= 3
              ? "Good"
              : networkQuality >= 2
                ? "Fair"
                : "Poor"}
          </span>
        </div>

        {/* Duration timer */}
        <div
          className="glass-modal px-4 py-1.5 rounded-full"
          data-ocid="incall.duration_timer"
        >
          <span className="text-sm font-mono font-semibold text-foreground">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Spacer for balance */}
        <div className="w-16" />
      </div>

      {/* Local video PIP (draggable) */}
      <div
        ref={pipRef}
        className={`fixed z-20 w-[120px] h-[160px] rounded-2xl overflow-hidden shadow-elevated border-2 border-border/50 ${
          isDragging ? "cursor-grabbing scale-105" : "cursor-grab"
        } transition-transform`}
        style={{
          left: pipPos.x,
          top: pipPos.y,
          right: "auto",
          bottom: "auto",
        }}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) =>
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleDragEnd}
        data-ocid="incall.local_video_pip"
      >
        {isCameraOff ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <VideoOff size={24} className="text-muted-foreground" />
          </div>
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center">
            {myProfile?.avatarUrl ? (
              <img
                src={myProfile.avatarUrl}
                alt={myName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-xl text-primary">
                {myInitials}
              </span>
            )}
          </div>
        )}
        {/* Drag handle hint */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-foreground/20 rounded-full" />
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 mt-auto px-6 pb-8 pt-4">
        <div className="glass-modal px-6 py-4 rounded-3xl flex items-center justify-center gap-6">
          {/* Mute */}
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isMuted
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            data-ocid="incall.mute_button"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={() => setIsCameraOff((c) => !c)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isCameraOff
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            data-ocid="incall.camera_button"
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>

          {/* Speaker */}
          <button
            type="button"
            onClick={() => setIsSpeakerOn((s) => !s)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isSpeakerOn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            data-ocid="incall.speaker_button"
            aria-label={isSpeakerOn ? "Speaker off" : "Speaker on"}
          >
            <Volume2 size={22} />
          </button>

          {/* End call */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center transition-all duration-200 active:scale-90 shadow-elevated"
            data-ocid="incall.end_call_button"
            aria-label="End call"
          >
            <PhoneOff size={26} />
          </button>
        </div>
      </div>
    </div>
  );
}
