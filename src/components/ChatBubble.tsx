import type { Message } from '../types';

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-bubble whitespace-pre-wrap ${
          isUser ? 'chat-bubble-primary' : ''
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
