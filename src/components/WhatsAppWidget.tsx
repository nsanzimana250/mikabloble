import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

const PHONE_NUMBER = "250793903992";
const BUSINESS_NAME = "MIKA Global";
const WELCOME_MESSAGE =
  "👋 Hello! Welcome to MIKA Global Business. How can we help you today?";

const WhatsAppIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-300 ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-label="WhatsApp chat"
        aria-hidden={!open}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-border flex flex-col">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight truncate">{BUSINESS_NAME}</p>
              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
                Typically replies within minutes
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div
            className="p-4 min-h-[140px] bg-[#ECE5DD] bg-opacity-60"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23d9d2c5' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm max-w-[85%] text-sm text-foreground">
              {WELCOME_MESSAGE}
              <span className="block text-[10px] text-muted-foreground text-right mt-1">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 p-2.5 bg-[#F0F0F0] border-t border-border"
          >
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none rounded-full px-4 py-2 text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-[#25D366] max-h-24"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="h-10 w-10 shrink-0 rounded-full bg-[#25D366] hover:bg-[#1ebe57] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-md"
              aria-label="Send message on WhatsApp"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 sm:right-6 z-[60] h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-orange"
        style={{
          boxShadow: "0 8px 24px rgba(37, 211, 102, 0.45)",
          animation: "wa-pulse 2s ease-out infinite",
        }}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <WhatsAppIcon className="h-7 w-7" />}
      </button>

      <style>{`
        @keyframes wa-pulse {
          0% { box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45), 0 0 0 0 rgba(37, 211, 102, 0.5); }
          70% { box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45), 0 0 0 16px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45), 0 0 0 0 rgba(37, 211, 102, 0); }
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;
