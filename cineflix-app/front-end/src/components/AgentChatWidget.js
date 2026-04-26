import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppContextProvider from '../redux/appContext/dispatchActionProvider';
import './AgentChatWidget.css';

const AgentChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI Booking Agent. What movie are you looking to watch?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Custom hook for Redux
  const dispatchActions = AppContextProvider();
  const userEmail = useSelector((state) => state.appContext.userEmail);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!inputVal.trim()) return;

    const userMessage = { role: 'user', content: inputVal };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await fetch('https://cineflix-agent.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: messages
        })
      });

      if (!response.ok) throw new Error('Agent API Error');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // Intent Checking
      if (data.intent === 'checkout_intent' && data.data) {
        handleCheckoutIntent(data.data);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! I encountered an error connecting to my servers.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCheckoutIntent = (intentData) => {
    // 1. Dispatch required Redux params
    if (intentData.theaterId) dispatchActions.setTheaterId(intentData.theaterId);
    if (intentData.screenId) dispatchActions.setScreenId(intentData.screenId);
    if (intentData.showTime) {
       // Just dispatching raw for fallback, context may need updating
       dispatchActions.setShowTime(intentData.showTime);
    }

    // 2. Navigate to seat selection with PreSelectedSeats via Router State
    // Format: /user/movie/:movieid/seatselection
    // Setting a slight timeout to let user see the final message before jumping
    setTimeout(() => {
        setIsOpen(false);
        if (userEmail) {
            navigate(`/user/movie/${intentData.movieId}/seatselection`, {
                state: { preSelectedSeats: intentData.preSelectedSeats || [] }
            });
        } else {
            alert("Please login to proceed with booking.");
            navigate('/login');
        }
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="agent-widget-container">
      {!isOpen && (
        <button className="agent-fab" onClick={toggleChat}>
          🤖
        </button>
      )}

      {isOpen && (
        <div className="agent-chat-window">
          <div className="agent-chat-header">
            <h4>Cineflix AI Assistant</h4>
            <button className="agent-close-btn" onClick={toggleChat}>×</button>
          </div>
          
          <div className="agent-message-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`agent-message ${msg.role}`}>
                <div className="agent-message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="agent-message assistant">
                <div className="agent-message-bubble typing">...typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="agent-chat-input-area">
            <input 
              type="text" 
              placeholder="E.g. Book 2 seats for Dunki..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage} disabled={isTyping || !inputVal.trim()}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentChatWidget;
