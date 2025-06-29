

  
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect, useRef } from 'react';

interface ChatModalProps {
  project: {
    id: number;
    name: string;
  };
  chatData: {
    conversationId: number;
    messages: {
      id: number;
      senderId: number;
      sender: { username: string };
      content: string;
      timestamp: string;
    }[];
  } | null; // made nullable to be safer
  onClose: () => void;
}

function ChatModal({ project, chatData, onClose }: ChatModalProps) {
  // Initialize messages as empty array if chatData or messages missing
  const [messages, setMessages] = useState(chatData?.messages ?? []);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user, loading } = useAuthGuard();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Update messages when chatData changes, safely with fallback
  useEffect(() => {
    setMessages(chatData?.messages ?? []);
  }, [chatData]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading || !user) return null; // guard while loading or no user

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/projects/${project.id}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
        credentials: 'include',
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setInput('');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
  console.error(error);
  alert('Network error while sending message');
}
  };

  return (
    <div className="modal modal-open">
<div className="modal-box flex flex-col h-[500px] bg-gray-100">
            <div className="flex justify-between items-center p-2 border-b">
          <h3>Chat - {project.name}</h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat ${msg.senderId === Number(user.id) ? 'chat-end' : 'chat-start'}`}
              >
                <div className="chat-header">
                  {msg.sender.username}
                  <time className="text-xs opacity-50 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </time>
                </div>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No messages yet</div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-2 border-t">
          <input
  type="text"
  placeholder="Type your message"
  className="input input-bordered flex-grow bg-gray-100"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
/>

          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
