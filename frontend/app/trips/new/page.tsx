'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { tripApi } from '@/services/tripApi';
import { INTERESTS, BUDGET_TYPES, BudgetType } from '@/types';
import Navbar from '@/components/Navbar';

export default function NewTripPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [budgetType, setBudgetType] = useState<BudgetType>('Medium');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'weather' | 'ai' | 'saving'>('idle');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) { setError('Please enter a destination'); return; }
    setError('');
    setSubmitting(true);
    setStep('weather');

    setTimeout(() => setStep('ai'), 1500);
    setTimeout(() => setStep('saving'), 5000);

    try {
      const { trip } = await tripApi.createTrip({
        destination: destination.trim(),
        days,
        budgetType,
        interests: selectedInterests,
      });
      router.push(`/trips/${trip._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip. Please try again.');
      setSubmitting(false);
      setStep('idle');
    }
  };

  if (loading) return null;

  const BUDGET_DETAILS: Record<BudgetType, { emoji: string; desc: string; color: string }> = {
    Budget: { emoji: '💚', desc: 'Hostels, street food, public transport', color: '#10b981' },
    Medium: { emoji: '💙', desc: '3-star hotels, local restaurants, mix of transport', color: '#6366f1' },
    Luxury: { emoji: '💛', desc: '5-star hotels, fine dining, private transport', color: '#f59e0b' },
  };

  const STEP_LABELS: Record<string, string> = {
    weather: '🌤️ Checking destination weather...',
    ai: '🤖 Generating your personalized itinerary...',
    saving: '💾 Saving your trip...',
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 40,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Plan a New Trip
            </span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>
            Tell us your preferences and our AI will craft the perfect itinerary — weather-aware, budget-smart, and tailored for you.
          </p>
        </div>

        {/* AI Loading State */}
        {submitting && (
          <div
            className="glass fade-in"
            style={{
              padding: 48,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                margin: '0 auto 24px',
                animation: 'pulseGlow 1.5s infinite',
              }}
            >
              ✈️
            </div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
              Creating your trip...
            </p>
            <p style={{ color: '#6366f1', fontSize: 15, fontWeight: 500 }}>
              {STEP_LABELS[step] || 'Processing...'}
            </p>
            <div
              style={{
                marginTop: 24,
                height: 4,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                  borderRadius: 9999,
                  animation: 'progressBar 8s linear forwards',
                }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        {!submitting && (
          <form onSubmit={handleSubmit} className="fade-in-delay-1">
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  color: '#fca5a5',
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Destination */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                📍 Where do you want to go?
              </h2>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Japan or Paris, France"
                required
                className="input-field"
                style={{ padding: '14px 18px', fontSize: 16 }}
              />
            </div>

            {/* Days */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                📅 How many days?
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <input
                  id="days"
                  type="range"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <div
                  style={{
                    minWidth: 80,
                    height: 50,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  {days}d
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                💰 Budget type
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {BUDGET_TYPES.map((bt) => {
                  const details = BUDGET_DETAILS[bt];
                  const selected = budgetType === bt;
                  return (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setBudgetType(bt)}
                      style={{
                        padding: '18px 12px',
                        borderRadius: 12,
                        border: selected
                          ? `2px solid ${details.color}`
                          : '2px solid rgba(255,255,255,0.08)',
                        background: selected
                          ? `${details.color}15`
                          : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: selected ? `0 0 20px ${details.color}30` : 'none',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{details.emoji}</div>
                      <div style={{ color: selected ? details.color : '#94a3b8', fontWeight: 600, fontSize: 14 }}>
                        {bt}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{details.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div className="glass" style={{ padding: 28, marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                🎯 Your interests
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Select all that apply (optional)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {INTERESTS.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 9999,
                        border: selected
                          ? '1px solid rgba(99,102,241,0.6)'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: selected
                          ? 'rgba(99,102,241,0.2)'
                          : 'rgba(255,255,255,0.03)',
                        color: selected ? '#818cf8' : '#64748b',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: selected ? 600 : 400,
                        transition: 'all 0.2s',
                        transform: selected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {selected ? '✓ ' : ''}{interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              id="create-trip-btn"
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 700,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <span>✨ Generate My AI Itinerary</span>
            </button>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 12 }}>
              🌤️ Weather-aware · 🤖 AI-powered · ⚡ Takes ~10 seconds
            </p>
          </form>
        )}
      </main>

      <style>{`
        @keyframes progressBar {
          0% { width: 0%; }
          15% { width: 20%; }
          40% { width: 50%; }
          80% { width: 85%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
}
