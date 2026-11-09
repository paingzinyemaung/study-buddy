import { useEffect, useRef, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import { askAI } from '../lib/ai';
import type { Message, Level } from '../types';
import { useLang } from '../i18n/LanguageContext';

export default function Chat() {
  const { t } = useLang();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Hi! I'm your English practice partner. Say hello to me!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<Level>('beginner');
  const bottomRef = useRef<HTMLDivElement>(null);

  // message အသစ်ရောက်တိုင်း အောက်ဆုံးကို scroll လုပ်
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const reply = await askAI(next, level);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: reply },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: t.chat.error,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <div className="flex h-[calc(100dvh-11rem)] flex-col md:h-[calc(100dvh-7rem)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold md:text-2xl">{t.chat.title}</h1>
        <select
          className="select select-sm w-36 text-base"
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
        >
          <option value="beginner">{t.chat.beginner}</option>
          <option value="intermediate">{t.chat.intermediate}</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-100 shadow-sm">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          className="input h-12 w-full flex-1 text-base"
          placeholder={t.chat.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          enterKeyHint="send"
        />
        <button
          className="btn btn-primary h-12"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {t.chat.send}
        </button>
      </div>
    </div>
  );
}
