"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

// "Flair" — compact fire/flame icon mascot
const FlairSVG = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Outer flame — main body */}
        <path
            d="M32 62 C18 62 8 50 10 38 C12 29 6 21 14 12 C18 8 24 12 26 6 C27.5 2 32 0 32 0 C32 0 36.5 2 38 6 C40 12 46 8 50 12 C58 21 52 29 54 38 C56 50 46 62 32 62Z"
            fill="currentColor"
        />
        {/* Inner flame — bright core for depth */}
        <path
            d="M32 52 C23 52 17 43 19 34 C20.5 28 16 22 22 15 C24.5 12 28 16 29 12 C29.5 9.5 30.5 8 32 8 C33.5 8 34.5 9.5 35 12 C36 16 39.5 12 42 15 C48 22 43.5 28 45 34 C47 43 41 52 32 52Z"
            fill="white"
            opacity="0.22"
        />
        {/* Tip highlight */}
        <ellipse cx="32" cy="10" rx="4" ry="6" fill="white" opacity="0.14" />

        {/* Spark — left */}
        <line x1="2"  y1="30" x2="8"  y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="5"  y1="27" x2="5"  y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        {/* Spark — right */}
        <line x1="56" y1="30" x2="62" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="59" y1="27" x2="59" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Floating embers */}
        <circle cx="9"  cy="18" r="2"   fill="white" opacity="0.6" />
        <circle cx="55" cy="18" r="2"   fill="white" opacity="0.6" />
        <circle cx="4"  cy="42" r="1.4" fill="white" opacity="0.35" />
        <circle cx="60" cy="42" r="1.4" fill="white" opacity="0.35" />
    </svg>
);

type Message = { from: "flair" | "user"; text: string };

const QUICK_REPLIES = [
    {
        label: "💰 Pricing",
        reply: "We have a free plan to get started, plus affordable paid plans as you grow. No credit card needed — check the pricing section on this page!",
    },
    {
        label: "✨ Features",
        reply: "FlairSync covers reservations, digital menus, staff & shift management, inventory tracking, customer analytics, and a lot more — all from one dashboard.",
    },
    {
        label: "🔒 Is my data safe?",
        reply: "Absolutely. We use encrypted storage, role-based access control, and comply with modern data-protection standards. Your data belongs to you, always.",
    },
    { label: "🚀 Get Started", action: "/signup" },
    { label: "💬 Talk to us", action: "/support" },
];

const INITIAL_MESSAGES: Message[] = [
    { from: "flair", text: "Hey there! 👋 I'm Flair, your FlairSync guide." },
    { from: "flair", text: "Ask me anything about the platform, or pick one of the quick options below!" },
];

export default function MascotChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [dotVisible, setDotVisible] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Show the green dot after a delay to attract attention
    useEffect(() => {
        const t = setTimeout(() => setDotVisible(true), 2000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [open, messages]);

    const handleQuick = (item: (typeof QUICK_REPLIES)[number]) => {
        if ("action" in item && item.action) {
            window.location.href = item.action;
            return;
        }
        setMessages((prev) => [
            ...prev,
            { from: "user", text: item.label },
            { from: "flair", text: (item as { label: string; reply: string }).reply },
        ]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setMessages((prev) => [
            ...prev,
            { from: "user", text },
            {
                from: "flair",
                text: "Thanks for reaching out! For the best help, visit our support page or use one of the quick options above.",
            },
        ]);
        setInput("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Chat panel */}
            <div
                className={`w-[340px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-out origin-bottom-right ${
                    open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
                }`}
            >
                {/* Header */}
                <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                        <FlairSVG size={34} className="text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary-foreground text-sm leading-none">Flair</p>
                        <p className="text-primary-foreground/70 text-xs mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            FlairSync Assistant
                        </p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-muted/20">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.from === "flair" && (
                                <div className="w-7 h-7 rounded-full bg-primary shrink-0 flex items-center justify-center">
                                    <FlairSVG size={22} className="text-primary-foreground" />
                                </div>
                            )}
                            <div
                                className={`max-w-[230px] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                                    msg.from === "flair"
                                        ? "bg-background border border-border text-foreground rounded-bl-sm"
                                        : "bg-primary text-primary-foreground rounded-br-sm"
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Quick reply chips — always visible */}
                    <div className="flex flex-wrap gap-2 pt-1 pl-9">
                        {QUICK_REPLIES.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleQuick(item)}
                                className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-150 font-medium"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-2.5 border-t border-border bg-background flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message…"
                        className="flex-1 text-sm bg-muted rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground"
                    />
                    <button
                        onClick={handleSend}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-40"
                        disabled={!input.trim()}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Trigger button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Chat with Flair"
                className={`relative w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 ${
                    !open && dotVisible ? "ring-4 ring-primary/25 ring-offset-2 ring-offset-background" : ""
                }`}
            >
                <div
                    className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
                        open ? "opacity-100 rotate-0" : "opacity-0 rotate-90 scale-50"
                    }`}
                >
                    <X className="w-6 h-6" />
                </div>
                <div
                    className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
                        open ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0"
                    }`}
                >
                    <FlairSVG size={46} className="text-primary-foreground" />
                </div>

                {/* Online dot */}
                {!open && dotVisible && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                )}
            </button>
        </div>
    );
}
