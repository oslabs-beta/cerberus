import React, { useState } from 'react';
import useChat from '../hooks/useChat';

const ChatWindow: React.FC = () => {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  return (
    <div className='chat-window'>
      <div className='messages'>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}
      </div>
      <input
        type='text'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => { sendMessage(input); setInput(''); }}>Send</button>
    </div>
  );
};

export default ChatWindow;
