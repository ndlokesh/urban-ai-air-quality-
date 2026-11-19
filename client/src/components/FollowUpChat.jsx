import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  AlertTriangle,
  Bot,
  User,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { translations } from '../utils/translations';

export default function FollowUpChat({
  aqiData,
  profile,
  previousPlan,
  language
}) {
  const t = translations[language] || translations.en;
  const isHindi = language === 'hi';

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: isHindi
        ? `नमस्ते! मैं आपका क्लीनब्रीथ सहायक हूँ। वर्तमान में आपका AQI **${aqiData?.aqi || 180}** (${aqiData?.band?.hindiLabel || 'अस्वस्थ'}) है। आप मुझसे वायु गुणवत्ता, बच्चों की सुरक्षा या प्यूरीफायर सेटिंग्स के बारे में कुछ भी पूछ सकते हैं।`
        : `Hello! I'm CleanBreath. Your current AQI is **${aqiData?.aqi || 180}** (${aqiData?.band?.label || 'Unhealthy'}). Feel free to ask about outdoor exercise safety, children's outdoor play, or DIY air purification!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const quickPrompts = isHindi
    ? [
        'क्या आज शाम मेरे बच्चे का बाहर खेलना सुरक्षित है?',
        'क्या रात में एयर प्यूरीफायर को हाई स्पीड पर चलाना चाहिए?',
        'सस्ते बजट में DIY एयर फिल्टर कैसे बनाएं?',
        'मुझे हल्की खांसी और सीने में जकड़न महसूस हो रही है।'
      ]
    : [
        'Is it safe for my kid to play outside today?',
        'Should I run my air purifier on high tonight?',
        'How do I make a low-cost DIY box fan filter?',
        'I am experiencing a cough and chest tightness.'
      ];

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isSending) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await sendChatMessage(
        queryText,
        aqiData,
        profile,
        previousPlan,
        messages,
        language
      );

      const assistantMsg = {
        sender: 'assistant',
        text: res.answer,
        hasMedicalConcern: res.hasMedicalConcern,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: isHindi
            ? 'क्षमा करें, संदेश भेजने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an issue retrieving the response. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.chatTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.chatSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">Medical Safety Protocol Active</span>
        </div>
      </div>

      {/* Medical disclaimer note */}
      <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
        <span>{t.medicalWarning}</span>
      </div>

      {/* Chat Messages Log */}
      <div className="h-80 sm:h-96 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : msg.hasMedicalConcern
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : msg.hasMedicalConcern
                    ? 'bg-rose-50 text-rose-950 border border-rose-300 rounded-tl-sm font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>CleanBreath is consulting air quality guidelines...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isSending}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 pt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isSending}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm font-medium text-slate-800 shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.sendBtn}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
