import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am the Velocraft Assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse = generateResponse(userMessage.text.toLowerCase());
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (text) => {
    if (text.includes('shipping') || text.includes('delivery') || text.includes('deliver')) {
      return 'We currently offer Nationwide Free Delivery anywhere in Bangladesh with no minimum order! 🚚';
    }
    if (text.includes('discount') || text.includes('promo') || text.includes('coupon') || text.includes('offer')) {
      return 'You can use the promo code SUPER10 at checkout for an instant 10% discount on your entire order. 🎁 Also, paying with City Bank or BRAC bank gives you an extra 20% off!';
    }
    if (text.includes('stock') || text.includes('available') || text.includes('when')) {
      return 'If an item is out of stock, it usually restocks within 14 business days depending on international shipments.';
    }
    if (text.includes('store') || text.includes('physical') || text.includes('shop') || text.includes('offline')) {
      return 'We have a physical showroom in Banani, Dhaka where you can experience the models in person!';
    }
    return 'Thank you for reaching out! A human support agent will review your message and connect with you shortly. If this is urgent, please call our hotline.';
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass-card animate-slide-up"
          style={{ 
            width: '320px', 
            height: '450px', 
            marginBottom: '16px', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '16px', 
            background: 'linear-gradient(90deg, #11131a 0%, #1a1c23 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>Velocraft Assistant</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'linear-gradient(90deg, #00e5ff 0%, #0077ff 100%)' : 'rgba(255,255,255,0.05)',
                  color: msg.sender === 'user' ? '#000' : '#fff',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  boxShadow: msg.sender === 'user' ? '0 4px 10px rgba(0,229,255,0.2)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '16px 16px 16px 0' }}>
                <span className="dot-typing">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', background: 'var(--bg-surface)' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask me anything..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '10px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', border: 'none' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSend}
              style={{ padding: '10px', borderRadius: '8px', background: 'var(--accent-cyan)', color: '#000', border: 'none' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00e5ff 0%, #0077ff 100%)',
          color: '#000',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,229,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          float: 'right'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <style>{`
        .dot-typing {
          animation: pulse 1s infinite alternate;
          color: var(--text-muted);
          font-weight: bold;
          letter-spacing: 2px;
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
