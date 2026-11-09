import type { Message } from '../types';

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-bubble whitespace-pre-wrap break-words text-base ${
          isUser
            ? 'chat-bubble-primary'
            : 'bg-base-100 text-base-content shadow-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
