"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating "chat" widget for the bottom-right corner.
 *
 * - Collapsed: a round gold FAB with a chat-bubble icon.
 * - Expanded: a chat-style panel that opens with a greeting message
 *   (time-aware: Good morning / afternoon / evening) followed by a
 *   short introduction and a set of quick-reply FAQ buttons.
 * - Quick replies are paginated (2 shown initially, "See more" reveals
 *   3 more at a time) so the panel doesn't open with a wall of buttons.
 * - Every bot reply is preceded by a brief animated "typing…" bubble,
 *   so it reads as conversational rather than instant.
 *
 * This is front-end only — quick replies resolve to canned bot
 * answers defined in FAQS below. Once a quick reply is clicked, it's
 * removed from the list so it isn't offered again in the same session.
 * There's no free-text composer — this is a guided FAQ chooser, not
 * an open chat input. Wire the FAQ answers up to a real backend or
 * expand `FAQS` as needed.
 */

type Sender = "bot" | "user";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
}

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "How much is the tutorial fee?",
    answer: "Our tutorial fee is \u20B1150 per hour.",
  },
  {
    question: "Is the fee per hour or per session?",
    answer:
      "The fee is \u20B1150 per hour. Each session can be arranged based on your preferred number of hours.",
  },
  {
    question: "Do you offer package rates?",
    answer:
      "Yes. We can offer package rates for multiple sessions. You may message us for available packages.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Yes, student discounts may be available depending on the tutorial program or package.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept available online payment methods and other approved payment options. Please message us for the current payment details.",
  },
  {
    question: "Can I choose my preferred schedule?",
    answer: "Yes. You can choose your preferred schedule, subject to tutor availability.",
  },
  {
    question: "Can I reschedule if I cannot attend?",
    answer: "Yes. You may request to reschedule, but please inform us in advance.",
  },
  {
    question: "Do I need to pay before the session?",
    answer:
      "Yes. Payment is generally required before the scheduled tutorial session to confirm your booking.",
  },
  {
    question: "Do you provide receipts?",
    answer:
      "Yes. A payment acknowledgment or receipt can be provided upon request, depending on the payment method.",
  },
  {
    question: "Do you have a face-to-face setup?",
    answer:
      "Yes. We offer face-to-face tutorials depending on the subject, tutor availability, and agreed location.",
  },
];

function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

let idCounter = 0;
const nextId = () => `msg-${++idCounter}`;

// Quick-reply pagination: show INITIAL_FAQ_COUNT first, then reveal
// FAQ_STEP more each time "See more" is clicked.
const INITIAL_FAQ_COUNT = 2;
const FAQ_STEP = 3;

// How long the typing indicator shows before a bot reply lands.
const TYPING_MIN_MS = 900;
const TYPING_MAX_MS = 1600;

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleFaqCount, setVisibleFaqCount] = useState(INITIAL_FAQ_COUNT);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Send the greeting + intro the first time the panel is opened.
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      const greeting = getGreeting();
      const intro: ChatMessage[] = [
        { id: nextId(), sender: "bot", text: `${greeting}! 👋` },
        {
          id: nextId(),
          sender: "bot",
          text: "I'm here to help. Here are a few things people usually ask — tap one to see the answer.",
        },
      ];
      setMessages(intro);
    }
  }, [open, hasGreeted]);

  // Auto-scroll to the latest message (or the typing indicator).
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, isTyping, visibleFaqCount]);

  // Close on Escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clean up any pending typing timeout on unmount.
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const pushMessage = (sender: Sender, text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), sender, text }]);
  };

  /** Shows the typing indicator for a beat, then delivers the bot's reply. */
  const replyAfterTyping = (text: string) => {
    setIsTyping(true);
    const delay =
      TYPING_MIN_MS + Math.random() * (TYPING_MAX_MS - TYPING_MIN_MS);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      pushMessage("bot", text);
    }, delay);
  };

  const handleFaqClick = (faq: Faq) => {
    if (isTyping) return;
    setAskedQuestions((prev) => new Set(prev).add(faq.question));
    pushMessage("user", faq.question);
    replyAfterTyping(faq.answer);
  };

  const remainingFaqs = FAQS.filter((f) => !askedQuestions.has(f.question));
  const visibleFaqs = remainingFaqs.slice(0, visibleFaqCount);
  const hasMoreFaqs = visibleFaqCount < remainingFaqs.length;

  const handleSeeMore = () => {
    setVisibleFaqCount((prev) => Math.min(prev + FAQ_STEP, remainingFaqs.length));
  };

  return (
    <div className="fixed bottom-5 right-5 z-999 flex flex-col items-end isolate sm:bottom-7 sm:right-7">
      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Chat"
          className="relative mb-3.5 flex h-112 w-84 max-w-[calc(100vw-2.5rem)] animate-[panelIn_0.25s_ease-out] flex-col overflow-hidden rounded-3 border border-gold-600/25 bg-navy-900 shadow-gold-lg sm:w-96"
          style={{ background: "linear-gradient(160deg, #122448, #0a1836)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/6 px-5 py-4">
            <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-500 bg-gold-600/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5 text-gold-400"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[0.95rem] font-bold text-cream">
                Chat with us
              </p>
              <p className="truncate text-[0.72rem] text-ink-faint">
                Usually replies within a few minutes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-white/6 hover:text-cream"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="chat-scroll flex-1 space-y-3 overflow-y-auto px-5 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.85rem] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[#1a1204]"
                      : "border border-white/8 bg-white/4 text-ink-soft"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator — shown while a bot reply is "on its way" */}
            {isTyping && (
              <div className="flex justify-start" aria-live="polite">
                <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
                </div>
              </div>
            )}

            {/* Quick-reply FAQ buttons — paginated, shown after the intro */}
            {messages.length > 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {visibleFaqs.map((faq) => (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() => handleFaqClick(faq)}
                    disabled={isTyping}
                    className="rounded-full border border-gold-600/40 px-3.5 py-1.5 text-left text-[0.78rem] font-medium text-gold-400 transition-colors duration-200 hover:border-gold-500 hover:bg-gold-600/8 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {faq.question}
                  </button>
                ))}

                {hasMoreFaqs && (
                  <button
                    type="button"
                    onClick={handleSeeMore}
                    disabled={isTyping}
                    className="group flex items-center gap-1 rounded-full px-3.5 py-1.5 text-left text-[0.78rem] font-semibold text-ink-faint transition-colors duration-200 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    See more
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[#1a1204] shadow-gold-lg transition-transform duration-200 hover:-translate-y-0.5"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5.5 w-5.5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      <style jsx>{`
        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        .typing-dot {
          animation: typingBounce 1.1s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(201, 162, 39, 0.4) transparent;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(201, 162, 39, 0.4);
          border-radius: 999px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(201, 162, 39, 0.65);
        }
      `}</style>
    </div>
  );
}