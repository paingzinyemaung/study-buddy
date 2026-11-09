import { useEffect, useRef, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import { askAI } from '../lib/ai';
import type { Message, Level } from '../types';

export default function Chat() {
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
          content: 'Sorry, something went wrong. Please try again.',
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">Chat Practice</h1>
        <select
          className="select select-bordered select-sm"
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto bg-base-100 rounded-box p-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="input input-bordered flex-1"
          placeholder="Type your English here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
