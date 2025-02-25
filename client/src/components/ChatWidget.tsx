import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import '../styles/ChatWidget.css';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-popup">
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          <ChatWindow />
        </div>
      )}
      <button className="chat-button" onClick={() => setIsOpen(!isOpen)}>
        💬 Chat
      </button>
    </div>
  );
};

export default ChatWidget;
