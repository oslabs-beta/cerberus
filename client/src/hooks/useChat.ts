import { useState } from 'react';

const useChat = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  const sendMessage = async (text: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    const response = await fetch('http://localhost:3000/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();
    setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
  };

  return { messages, sendMessage };
};

export default useChat;
