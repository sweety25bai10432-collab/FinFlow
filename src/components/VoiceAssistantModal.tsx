import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '../services/api.js';
import { VoiceCommandResult } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Sparkles,
    Send,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Languages,
    ArrowRight,
    Info,
    RotateCcw,
} from 'lucide-react';

interface VoiceAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExpenseAdded?: () => void;
    currency?: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    spokenText?: string;
    intent?: string;
    timestamp: string;
    addedExpense?: any;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onExpenseAdded,
                                                                            currency = '$',
                                                                        }) => {
    const { isDark } = useTheme();
    const [languageMode, setLanguageMode] = useState<'en' | 'hinglish'>('en');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [manualInput, setManualInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [speechEnabled, setSpeechEnabled] = useState(true);
    const [statusNote, setStatusNote] = useState<string | null>(null);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'assistant',
            text: `Hello! I'm your FinFlow Voice Assistant. You can speak in English or Hinglish (Hindi + English) to log expenses hands-free or ask about your spending!`,
            spokenText: `Hello! I am your FinFlow Voice Assistant. How can I help you manage your finances today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);

    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef<string>('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const silenceTimerRef = useRef<any>(null);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Voice output synthesizer
    const speakText = (text: string) => {
        if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                if (languageMode === 'hinglish') {
                    const hindiVoice = voices.find(
                        (v) =>
                            v.lang.startsWith('hi') ||
                            v.lang.startsWith('en-IN') ||
                            v.name.toLowerCase().includes('india') ||
                            v.name.toLowerCase().includes('hindi')
                    );
                    if (hindiVoice) utterance.voice = hindiVoice;
                } else {
                    const engVoice = voices.find(
                        (v) =>
                            v.lang.startsWith('en') &&
                            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('English'))
                    );
                    if (engVoice) utterance.voice = engVoice;
                }
            }

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('Speech synthesis error:', err);
        }
    };

    // Check Web Speech API support and setup recognition instance
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSpeechSupported(false);
            setStatusNote('Web Speech is not supported on this browser. You can type or use prompt chips below.');
            return;
        }

        setIsSpeechSupported(true);

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            // For Hinglish, en-IN accurately transcribes Indian English & Hinglish words into Latin characters
            recognition.lang = languageMode === 'hinglish' ? 'en-IN' : 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setStatusNote(
                    languageMode === 'hinglish'
                        ? 'Sun raha hoon... Kripya saaf bole'
                        : 'Listening... Speak clearly into your mic'
                );
            };

            recognition.onresult = (event: any) => {
                let fullTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript;
                }

                const trimmed = fullTranscript.trim();
                setTranscript(trimmed);
                transcriptRef.current = trimmed;

                // Auto-submit on silence timer (1.5 seconds after last word)
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                }
                silenceTimerRef.current = setTimeout(() => {
                    if (transcriptRef.current.trim() && recognitionRef.current) {
                        try {
                            recognitionRef.current.stop();
                        } catch (e) {
                            // Ignore
                        }
                    }
                }, 1800);
            };

            recognition.onerror = (event: any) => {
                console.warn('Speech recognition event error:', event.error);
                setIsListening(false);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                if (event.error === 'not-allowed') {
                    setStatusNote('Microphone permission blocked. Please allow mic permissions in your browser or type below.');
                } else if (event.error === 'no-speech') {
                    setStatusNote(
                        languageMode === 'hinglish'
                            ? 'Koi aawaz nahi sunai di. Kripya dubara mic dabayein.'
                            : 'No speech detected. Please tap mic and try again.'
                    );
                } else if (event.error === 'audio-capture') {
                    setStatusNote('No microphone detected. Please check your mic connection.');
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // If we captured speech, automatically send and process it!
                const captured = transcriptRef.current.trim();
                if (captured) {
                    transcriptRef.current = '';
                    handleProcessCommand(captured);
                }
            };

            recognitionRef.current = recognition;
        } catch (err) {
            console.warn('Failed to configure speech recognition:', err);
            setIsSpeechSupported(false);
        }

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            try {
                recognitionRef.current?.abort();
            } catch (e) {
                // Ignore
            }
        };
    }, [languageMode]);

    // Command processor calling Gemini with failover
    const handleProcessCommand = async (commandText: string) => {
        if (!commandText.trim()) return;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: commandText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setTranscript('');
        transcriptRef.current = '';
        setManualInput('');
        setStatusNote(null);
        setIsProcessing(true);

        try {
            const result: VoiceCommandResult = await aiApi.sendVoiceCommand(
                commandText.trim(),
                true,
                languageMode
            );

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                sender: 'assistant',
                text: result.displayResponse,
                spokenText: result.spokenResponse,
                intent: result.intent,
                addedExpense: result.addedExpense,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (result.spokenResponse) {
                speakText(result.spokenResponse);
            }

            if (result.addedExpense && onExpenseAdded) {
                onExpenseAdded();
            }
        } catch (err: any) {
            console.error('Failed to process voice command:', err);
            const fallbackText =
                languageMode === 'hinglish'
                    ? 'Kshama kijiye, command samajhne mein dikkat aayi. Kripya dobara try karein ya manually type karein.'
                    : 'Sorry, I encountered an issue parsing that command. Please try speaking again or typing below.';

            const errMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                sender: 'assistant',
                text: fallbackText,
                spokenText: fallbackText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = () => {
        setStatusNote(null);

        if (isListening) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            try {
                recognitionRef.current?.stop();
            } catch (e) {
                // Ignore
            }
            setIsListening(false);
            const captured = transcriptRef.current.trim() || transcript.trim();
            if (captured) {
                transcriptRef.current = '';
                handleProcessCommand(captured);
            }
        } else {
            setTranscript('');
            transcriptRef.current = '';

            if (!recognitionRef.current) {
                setStatusNote('Voice recognition not initialized. Please type or use prompt chips below.');
                return;
            }

            try {
                recognitionRef.current.lang = languageMode === 'hinglish' ? 'en-IN' : 'en-US';
                recognitionRef.current.start();
            } catch (err: any) {
                console.warn('Failed to start recognition:', err);
                // Sometimes restarting recognition if already in an active state throws an error
                try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                        recognitionRef.current?.start();
                    }, 150);
                } catch (retryErr) {
                    setStatusNote('Could not start microphone. You can type your command below.');
                }
            }
        }
    };

    if (!isOpen) return null;

    const quickVoiceChips =
        languageMode === 'hinglish'
            ? [
                'Kal Dmart se 1200 rupees ka grocery kharida',
                'Dosto ke saath dinner pe 850 spend kiya via Google Pay',
                'Uber ride ke liye 320 rupees diye',
                'Aaj maine kitna kharch kiya?',
                'Mera remaining budget kitna bacha hai?',
            ]
            : [
                'Spent $45 on dinner with friends yesterday',
                'I spent $35 on groceries at Whole Foods',
                'How much did I spend today?',
                'What is my remaining budget for this month?',
                'Logged 14 dollars for morning coffee',
            ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-full max-w-xl rounded-3xl border border-indigo-500/30 shadow-[0_0_80px_-15px_rgba(99,102,241,0.4)] overflow-hidden flex flex-col max-h-[88vh] bg-gradient-to-b from-[#090d1a] via-[#0d1329] to-[#070a14] text-slate-100 relative">
                {/* Ambient Top Glow Flare */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-32 bg-gradient-to-b from-indigo-500/30 via-cyan-500/15 to-transparent blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-indigo-500/20 bg-slate-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/35">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm tracking-tight text-white">
                                    FinFlow Voice Intelligence
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Dual Voice AI
                </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Natural speech parser powered by Gemini 3.8 & Flash-Lite
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Audio Speech Output Toggle */}
                        <button
                            onClick={() => {
                                setSpeechEnabled(!speechEnabled);
                                if (speechEnabled && typeof window !== 'undefined') {
                                    window.speechSynthesis?.cancel();
                                }
                            }}
                            title={speechEnabled ? 'Mute AI voice speech' : 'Enable AI voice speech'}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                speechEnabled
                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-cyan-300'
                                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                            }`}
                        >
                            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Language Mode Selector Bar */}
                <div className="relative z-10 px-5 py-2.5 bg-[#080b16]/80 border-b border-indigo-500/15 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Languages className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium">Voice Language:</span>
                    </div>

                    <div className="inline-flex p-0.5 rounded-xl bg-slate-900 border border-indigo-500/30">
                        <button
                            type="button"
                            onClick={() => {
                                setLanguageMode('en');
                                setStatusNote(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                languageMode === 'en'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span>🇬🇧</span>
                            <span>English</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguageMode('hinglish');
                                setStatusNote(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                languageMode === 'hinglish'
                                    ? 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 text-white shadow-md shadow-cyan-500/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span>🇮🇳</span>
                            <span>Hinglish (Hindi + EN)</span>
                        </button>
                    </div>
                </div>

                {/* Status notification banner if needed */}
                {statusNote && (
                    <div className="px-4 py-2 bg-indigo-950/70 border-b border-indigo-500/20 text-indigo-200 text-[11px] flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="flex-1">{statusNote}</span>
                        <button
                            onClick={() => setStatusNote(null)}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Chat / Interaction Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                    {messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                                        isUser
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-xs shadow-indigo-900/30'
                                            : 'bg-[#11162d]/90 border border-indigo-500/30 text-slate-100 rounded-bl-xs shadow-black/40'
                                    }`}
                                >
                                    {!isUser && (
                                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-cyan-300 font-semibold tracking-wide">
                                            <Sparkles className="w-3 h-3" />
                                            <span>FinFlow AI Assistant</span>
                                        </div>
                                    )}

                                    <p className="whitespace-pre-line leading-relaxed text-[12.5px]">{msg.text}</p>

                                    {/* Added Expense Receipt Tag if parsed */}
                                    {msg.addedExpense && (
                                        <div className="mt-2.5 pt-2 border-t border-indigo-400/20 flex items-center justify-between text-[11px] bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/30">
                                            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Logged to Records</span>
                                            </div>
                                            <span className="font-extrabold text-emerald-400">
                        {currency}
                                                {msg.addedExpense.amount.toFixed(2)}
                      </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                            </div>
                        );
                    })}

                    {isProcessing && (
                        <div className="flex items-start">
                            <div className="bg-[#11162d]/90 border border-indigo-500/30 rounded-2xl rounded-bl-xs px-4 py-3 text-slate-300 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                <span className="text-xs">
                  {languageMode === 'hinglish'
                      ? 'Aapka voice command parse ho raha hai...'
                      : 'Analyzing command with Gemini AI...'}
                </span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-4 py-2 border-t border-indigo-500/15 bg-slate-950/40 overflow-x-auto">
                    <div className="flex items-center gap-1.5 w-max">
            <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap mr-1">
              {languageMode === 'hinglish' ? 'Try Bolna:' : 'Suggested Prompts:'}
            </span>
                        {quickVoiceChips.map((chip, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleProcessCommand(chip)}
                                className="px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-500/30 hover:border-cyan-400/50 transition-all shrink-0 cursor-pointer active:scale-95"
                            >
                                "{chip}"
                            </button>
                        ))}
                    </div>
                </div>

                {/* Central Voice Control Interface */}
                <div className="p-4 bg-gradient-to-t from-[#060810] to-[#0c1022] border-t border-indigo-500/20 flex flex-col items-center gap-3">
                    {/* Animated Central Glowing Mic Orb */}
                    <div className="relative flex items-center justify-center my-1">
                        {/* Outer Pulsing Glow Rings when listening */}
                        {isListening && (
                            <>
                                <div className="absolute -inset-4 rounded-full bg-cyan-500/30 animate-ping pointer-events-none" />
                                <div className="absolute -inset-8 rounded-full bg-indigo-500/25 animate-pulse pointer-events-none" />
                                <div className="absolute -inset-12 rounded-full bg-violet-600/15 pointer-events-none blur-xl" />
                            </>
                        )}

                        <button
                            onClick={toggleListening}
                            type="button"
                            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
                                isListening
                                    ? 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-500/50 scale-105 ring-4 ring-rose-400/40 animate-pulse'
                                    : 'bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-indigo-500/50 hover:shadow-cyan-400/50 hover:scale-105 ring-2 ring-indigo-400/30'
                            }`}
                        >
                            {isListening ? (
                                <MicOff className="w-7 h-7 text-white" />
                            ) : (
                                <Mic className="w-7 h-7 text-white" />
                            )}
                        </button>
                    </div>

                    {/* Real-time status / Live transcript */}
                    <div className="text-center min-h-[24px] max-w-md">
                        {isListening ? (
                            <div className="flex flex-col items-center gap-1.5">
                                {/* Audio visualizer wave bars */}
                                <div className="flex items-center gap-1 h-3.5">
                                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                                    <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                                    <span className="w-1 bg-violet-400 rounded-full animate-bounce [animation-delay:0s] h-2.5" />
                                    <span className="w-1 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.2s] h-4" />
                                    <span className="w-1 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.35s] h-3" />
                                </div>
                                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-cyan-300">
                    {transcript
                        ? `"${transcript}"`
                        : languageMode === 'hinglish'
                            ? 'Sun raha hoon... Bolna shuru kijiye'
                            : 'Listening... Speak now'}
                  </span>
                                    {transcript && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (recognitionRef.current) {
                                                    try {
                                                        recognitionRef.current.stop();
                                                    } catch (e) {
                                                        // Ignore
                                                    }
                                                }
                                                setIsListening(false);
                                                handleProcessCommand(transcript);
                                            }}
                                            className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                                        >
                                            Send Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-[11px] text-slate-400">
                {languageMode === 'hinglish'
                    ? 'Mic dabayein aur Hindi/English mein bole (Tap mic to speak)'
                    : 'Tap microphone to speak or type your request below'}
              </span>
                        )}
                    </div>

                    {/* Fallback Text Input Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (manualInput.trim()) {
                                handleProcessCommand(manualInput.trim());
                            }
                        }}
                        className="w-full flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder={
                                languageMode === 'hinglish'
                                    ? 'Type karein: "Kal 500 ka petrol bharwaya" ya bol kar batayein...'
                                    : 'Type e.g. "Spent $45 on groceries" or tap mic above...'
                            }
                            className="flex-1 rounded-xl px-3.5 py-2 text-xs bg-slate-900/90 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!manualInput.trim() || isProcessing}
                            className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
