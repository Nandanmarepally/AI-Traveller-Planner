'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { tripApi } from '@/services/tripApi';
import { Trip, Day, ChatMessage } from '@/types';
import Navbar from '@/components/Navbar';
import DayCard from '@/components/DayCard';
import ChatAssistant from '@/components/ChatAssistant';

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️', rainy: '🌧️', cloudy: '☁️', mixed: '⛅', unknown: '🌍',
};

const BUDGET_COLORS: Record<string, string> = {
  Budget: '#10b981', Medium: '#6366f1', Luxury: '#f59e0b',
};

export default function TripDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [fetchingTrip, setFetchingTrip] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'hotels' | 'chat'>('itinerary');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (tripId && user) {
      tripApi
        .getTripById(tripId)
        .then(({ trip }) => setTrip(trip))
        .catch((e) => setError(e.message))
        .finally(() => setFetchingTrip(false));
    }
  }, [tripId, user]);

  const handleDayUpdate = (updatedDay: Day) => {
    if (!trip) return;
    setTrip({
      ...trip,
      itinerary: trip.itinerary.map((d) => (d.day === updatedDay.day ? updatedDay : d)),
    });
  };

  const handleChatUpdate = (history: ChatMessage[]) => {
    if (!trip) return;
    setTrip({ ...trip, chatHistory: history });
  };

  if (loading || fetchingTrip) {
    return (
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
          <div className="skeleton" style={{ height: 48, width: '50%', marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 90 }} />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, marginBottom: 16 }} />
          ))}
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', fontSize: 16 }}>{error || 'Trip not found'}</p>
        </main>
      </div>
    );
  }

  const budgetColor = BUDGET_COLORS[trip.budgetType] || '#6366f1';
  const weatherIcon = WEATHER_ICONS[trip.weatherContext?.condition || 'unknown'];

  const TABS = [
    { id: 'itinerary', label: '🗓️ Itinerary' },
    { id: 'budget', label: '💰 Budget' },
    { id: 'hotels', label: '🏨 Hotels' },
    { id: 'chat', label: '💬 Chat' },
  ] as const;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero Header */}
        <div
          className="glass fade-in"
          style={{
            padding: '36px 40px',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gradient bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 42,
                  fontWeight: 800,
                  color: '#f1f5f9',
                  marginBottom: 8,
                }}
              >
                {trip.destination}
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Created {new Date(trip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <span
                className="tag"
                style={{ background: `${budgetColor}18`, color: budgetColor, border: `1px solid ${budgetColor}40`, padding: '8px 16px' }}
              >
                💰 {trip.budgetType}
              </span>
              <span
                className="tag"
                style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)', padding: '8px 16px' }}
              >
                📅 {trip.days} days
              </span>
              {trip.weatherContext?.condition !== 'unknown' && (
                <span
                  className="tag"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 16px' }}
                >
                  {weatherIcon} {trip.weatherContext.temperature}°C · {trip.weatherContext.description}
                </span>
              )}
            </div>
          </div>

          {/* Interests */}
          {trip.interests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
              {trip.interests.map((interest) => (
                <span
                  key={interest}
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 12px',
                    borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          className="fade-in-delay-1"
          style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: 6,
            marginBottom: 28,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="fade-in-delay-2">
          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {trip.itinerary
                .sort((a, b) => a.day - b.day)
                .map((day) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    tripId={trip._id}
                    totalDays={trip.days}
                    destination={trip.destination}
                    onUpdate={handleDayUpdate}
                  />
                ))}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="glass" style={{ padding: 36 }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 28 }}>
                Budget Breakdown
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Flights', value: trip.budgetEstimate.flights, icon: '✈️', color: '#6366f1' },
                  { label: 'Accommodation', value: trip.budgetEstimate.accommodation, icon: '🏨', color: '#8b5cf6' },
                  { label: 'Food', value: trip.budgetEstimate.food, icon: '🍽️', color: '#06b6d4' },
                  { label: 'Activities', value: trip.budgetEstimate.activities, icon: '🎯', color: '#10b981' },
                ].map((item) => {
                  const pct = trip.budgetEstimate.total > 0
                    ? (item.value / trip.budgetEstimate.total) * 100
                    : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#94a3b8', fontSize: 15 }}>
                          {item.icon} {item.label}
                        </span>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 16 }}>
                          ${item.value.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: item.color,
                            borderRadius: 9999,
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 32,
                  padding: '20px 24px',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#94a3b8', fontSize: 16 }}>Total Estimated Cost</span>
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 36,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ${trip.budgetEstimate.total.toLocaleString()}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                * Estimates are approximate and may vary. Always check current prices before booking.
              </p>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div className="glass" style={{ padding: 36 }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                Recommended Hotels
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
                AI-suggested accommodations for your {trip.budgetType} budget in {trip.destination}
              </p>
              {trip.hotels.length === 0 ? (
                <p style={{ color: '#64748b' }}>No hotel recommendations available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {trip.hotels.map((hotel, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '18px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                          border: '1px solid rgba(99,102,241,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        🏨
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{hotel}</p>
                        <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{trip.destination}</p>
                      </div>
                      <span
                        style={{
                          background: `${budgetColor}15`,
                          color: budgetColor,
                          border: `1px solid ${budgetColor}30`,
                          borderRadius: 9999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {trip.budgetType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <ChatAssistant trip={trip} onChatUpdate={handleChatUpdate} />
          )}
        </div>
      </main>
    </div>
  );
}
