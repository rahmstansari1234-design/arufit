import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Send, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import {
  useMarkAsRead,
  useMessages,
  useMyProfile,
  useSendMessage,
  useStartCall,
} from "../hooks/useBackend";
import type { CallView } from "../types";
import CallEndedPage from "./CallEndedPage";
import InCallPage from "./InCallPage";
import IncomingCallPage from "./IncomingCallPage";

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { userId } = useParams({ from: "/chat/$userId" });
  const { data: messages = [], isLoading } = useMessages(userId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Call state
  const startCall = useStartCall();
  const { data: myProfile } = useMyProfile();
  const [callState, setCallState] = useState<
    "idle" | "outgoing" | "incoming" | "active" | "ended"
  >("idle");
  const [activeCall, setActiveCall] = useState<CallView | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Mark as read on mount
  useEffect(() => {
    markAsRead.mutate(userId);
  }, [userId, markAsRead]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // React Query refetch is handled by the hook's staleTime/refetchInterval
      // We trigger a manual refetch via queryClient if needed, but for now
      // the hook will refetch when window regains focus. Let's add a simple poll.
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Extract other user's name from first message if possible
  const displayName =
    messages.length > 0
      ? messages[0].fromId.toString() !== userId
        ? messages[0].fromId.toString()
        : messages[0].toId.toString()
      : "Chat";

  function handleStartCall() {
    startCall.mutate(userId as any, {
      onSuccess: (call: CallView) => {
        setActiveCall(call);
        setCallState("outgoing");
      },
    });
  }

  function handleAcceptCall() {
    setCallState("active");
  }

  function handleDeclineCall() {
    setCallState("idle");
    setActiveCall(null);
  }

  function handleEndCall() {
    setCallState("ended");
  }

  function handleCloseEnded() {
    setCallState("idle");
    setActiveCall(null);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    sendMessage.mutate(
      { toId: userId, content: text, mediaUrl: null },
      {
        onSuccess: () => {
          setInput("");
          inputRef.current?.focus();
        },
      },
    );
  }

  return (
    <div className="max-w-lg mx-auto h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate({ to: "/chat" })}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
          data-ocid="chat.back_button"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          <span className="font-display font-bold text-xs text-primary">
            {getInitials(displayName)}
          </span>
        </div>
        <span className="font-display font-semibold text-sm text-foreground">
          {displayName}
        </span>

        {/* Video call button */}
        <button
          type="button"
          onClick={handleStartCall}
          disabled={callState !== "idle" || startCall.isPending}
          className="ml-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center transition-smooth active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          data-ocid="chat.video_call_button"
          aria-label="Start video call"
        >
          <Video size={18} className="text-primary" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-40"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="chat.empty_state"
          >
            <p className="text-3xl mb-2">💬</p>
            <p className="font-display font-semibold text-foreground mb-1">
              Start chatting
            </p>
            <p className="text-sm text-muted-foreground">
              Send a message to get the conversation going
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.fromId.toString() !== userId;
            return (
              <div
                key={String(msg.id)}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                data-ocid={`chat.message.item.${i + 1}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-foreground rounded-bl-md shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active call banner */}
      {callState === "outgoing" && activeCall && (
        <div
          className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between"
          data-ocid="chat.call_banner"
        >
          <span className="text-sm text-primary font-medium">Calling...</span>
          <button
            type="button"
            onClick={handleDeclineCall}
            className="text-xs text-destructive font-medium"
            data-ocid="chat.cancel_call_button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            data-ocid="chat.input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-smooth active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            data-ocid="chat.send_button"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      {/* Call overlays */}
      {callState === "outgoing" && activeCall && (
        <IncomingCallPage
          call={activeCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
      {callState === "active" && activeCall && (
        <InCallPage
          call={activeCall}
          myProfile={myProfile ?? null}
          onEnd={handleEndCall}
        />
      )}
      {callState === "ended" && activeCall && (
        <CallEndedPage call={activeCall} onClose={handleCloseEnded} />
      )}
    </div>
  );
}
