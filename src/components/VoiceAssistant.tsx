import React, { useEffect, useRef, useState } from "react";
import { Mic, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// 🧩 Fix TypeScript typing for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// 🔑 Replace this with your own OpenAI API key (for local testing only)
const OPENAI_API_KEY = "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";

type Message = { type: "user" | "assistant"; text: string };

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "assistant", text: "👋 Hi! I'm your AI assistant. How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const recognitionRef = useRef<any>(null);

  // 🎤 Voice recognition setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessages((prev) => [...prev, { type: "user", text: transcript }]);
        handleAIResponse(transcript);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    } else {
      console.warn("SpeechRecognition is not supported in this browser.");
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // 🧠 Call OpenAI API directly
  const handleAIResponse = async (userInput: string) => {
    setMessages((prev) => [...prev, { type: "assistant", text: "Thinking..." }]);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI financial assistant." },
            { role: "user", content: userInput },
          ],
        }),
      });

      const result = await response.json();
      const aiReply =
        result?.choices?.[0]?.message?.content || "Sorry, I couldn’t understand that.";

      setMessages((prev) => [...prev.slice(0, -1), { type: "assistant", text: aiReply }]);
      speakText(aiReply);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { type: "assistant", text: "⚠️ Error fetching AI response." },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInputValue("");
    handleAIResponse(text);
  };

  // 🔊 Voice output
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* 🎙️ Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 💬 Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            drag
            dragMomentum={false}
            className="fixed bottom-24 right-6 w-96 z-50 cursor-move"
          >
            <Card className="p-4 rounded-3xl shadow-2xl bg-white dark:bg-slate-800 border-2 border-teal-500/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Assistant</h4>
                    <p className="text-xs text-muted-foreground">
                      {isSpeaking ? "🔊 Speaking..." : "Online"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="h-80 overflow-y-auto space-y-2 mb-3">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        m.type === "user"
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Button
                  onClick={handleMicClick}
                  className={`rounded-xl ${
                    isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="rounded-xl"
                />
                <Button
                  onClick={handleSend}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
