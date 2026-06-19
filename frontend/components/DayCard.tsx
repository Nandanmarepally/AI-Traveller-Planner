'use client';

import { useState } from 'react';
import { Day } from '@/types';
import { tripApi } from '@/services/tripApi';

interface DayCardProps {
  day: Day;
  tripId: string;
  totalDays: number;
  destination: string;
  onUpdate: (updatedDay: Day) => void;
}

export default function DayCard({ day, tripId, onUpdate }: DayCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [newActivity, setNewActivity] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;
    setAddingActivity(true);
    setError('');
    try {
      const { trip } = await tripApi.addActivity(tripId, day.day, newActivity.trim());
      const updated = trip.itinerary.find((d) => d.day === day.day);
      if (updated) onUpdate(updated);
      setNewActivity('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingActivity(false);
    }
  };

  const handleRemoveActivity = async (index: number) => {
    setRemovingIndex(index);
    setError('');
    try {
      const { trip } = await tripApi.removeActivity(tripId, day.day, index);
      const updated = trip.itinerary.find((d) => d.day === day.day);
      if (updated) onUpdate(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemovingIndex(null);
    }
  };

  const handleRegenerateDay = async () => {
    if (!regenPrompt.trim()) return;
    setRegenerating(true);
    setError('');
    try {
      const { trip } = await tripApi.regenerateDay(tripId, day.day, regenPrompt.trim());
      const updated = trip.itinerary.find((d) => d.day === day.day);
      if (updated) onUpdate(updated);
      setShowRegenInput(false);
      setRegenPrompt('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div
      className="glass"
      style={{
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Day Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '18px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99,102,241,0.06)',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>D{day.day}</span>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 16 }}>Day {day.day}</p>
            {day.theme && (
              <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 500 }}>{day.theme}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#818cf8',
              borderRadius: 9999,
              padding: '3px 10px',
              fontSize: 12,
            }}
          >
            {day.activities.length} activities
          </span>
          <span style={{ color: '#64748b', fontSize: 18, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: 24 }}>
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Activity List */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {day.activities.map((activity, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.2)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ color: '#e2e8f0', fontSize: 14, flex: 1 }}>{activity}</span>
                <button
                  onClick={() => handleRemoveActivity(idx)}
                  disabled={removingIndex === idx}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 6,
                    color: '#ef4444',
                    cursor: 'pointer',
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {removingIndex === idx ? '...' : '✕'}
                </button>
              </li>
            ))}
          </ul>

          {/* Add Activity */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="Add an activity..."
              className="input-field"
              style={{ padding: '10px 14px', fontSize: 14 }}
            />
            <button
              onClick={handleAddActivity}
              disabled={addingActivity || !newActivity.trim()}
              className="btn-primary"
              style={{ padding: '10px 18px', borderRadius: 10, fontSize: 14, whiteSpace: 'nowrap', zIndex: 1 }}
            >
              {addingActivity ? <span className="spinner" /> : '+ Add'}
            </button>
          </div>

          {/* Regenerate Day */}
          {!showRegenInput ? (
            <button
              onClick={() => setShowRegenInput(true)}
              style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: 10,
                color: '#22d3ee',
                cursor: 'pointer',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              🔄 Regenerate This Day with AI
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                placeholder="e.g. More outdoor activities, focus on local food..."
                className="input-field"
                style={{ padding: '10px 14px', fontSize: 14 }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleRegenerateDay}
                  disabled={regenerating || !regenPrompt.trim()}
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, zIndex: 1 }}
                >
                  {regenerating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span className="spinner" /> Regenerating...
                    </span>
                  ) : (
                    '✨ Regenerate Day'
                  )}
                </button>
                <button
                  onClick={() => { setShowRegenInput(false); setRegenPrompt(''); }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
