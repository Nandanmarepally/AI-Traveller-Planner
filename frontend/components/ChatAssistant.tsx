'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Trip } from '@/types';
import { tripApi } from '@/services/tripApi';

interface ChatAssistantProps {
  trip: Trip;
  onChatUpdate: (history: ChatMessage[]) => void;
}

export default function ChatAssistant({ trip, onChatUpdate }: ChatAssistantProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatHistory = trip.chatHistory || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const SUGGESTIONS = [
    'Best vegetarian restaurants nearby?',
    'Reduce budget by 20%',
    'What to pack for this trip?',
    'Any safety tips for this destination?',
  ];

  const handleSend = async (msg?: string) => {
    const text = (msg || message).trim();
    if (!text) return;
    setSending(true);
    setError('');
    setMessage('');
    try {
      const { chatHistory } = await tripApi.chat(trip._id, text);
      onChatUpdate(chatHistory);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="glass"
      style={{ display: 'flex', flexDirection: 'column', height: 500, overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(99,102,241,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🤖
        </div>
        <div>
          <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 15 }}>Trip Assistant</p>
          <p style={{ color: '#64748b', fontSize: 12 }}>Ask anything about your {trip.destination} trip</p>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulseGlow 2s infinite',
            }}
          />
          <span style={{ color: '#10b981', fontSize: 12 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chatHistory.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✈️</p>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
              Ask me anything about your trip to <strong style={{ color: '#f1f5f9' }}>{trip.destination}</strong>!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 10,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '9px 16px',
                    fontSize: 13,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#f1f5f9';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                  }}
                >
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  className={msg.role === 'user' ? 'chat-user' : 'chat-assistant'}
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  className="chat-assistant"
                  style={{ padding: '12px 20px', borderRadius: '16px 16px 16px 4px' }}
                >
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#6366f1',
                          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0 24px 8px', color: '#fca5a5', fontSize: 12 }}>{error}</div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 10,
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about your trip..."
          disabled={sending}
          className="input-field"
          style={{ padding: '11px 16px', fontSize: 14 }}
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || !message.trim()}
          className="btn-primary"
          style={{
            padding: '11px 20px',
            borderRadius: 10,
            fontSize: 14,
            zIndex: 1,
            minWidth: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sending ? <span className="spinner" /> : '↗'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
