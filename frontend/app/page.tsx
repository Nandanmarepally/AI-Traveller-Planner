'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

const FEATURES = [
  {
    icon: '🌤️',
    title: 'Weather-Aware Planning',
    desc: 'We check the weather before generating your itinerary. Rainy? We plan museums. Sunny? We plan hikes.',
    color: '#f59e0b',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Itineraries',
    desc: 'Gemini AI crafts detailed day-by-day plans with real activities, local tips, and cultural experiences.',
    color: '#6366f1',
  },
  {
    icon: '✏️',
    title: 'Fully Editable',
    desc: 'Add activities, remove them, or regenerate any day with a custom prompt. Full control is yours.',
    color: '#10b981',
  },
  {
    icon: '💬',
    title: 'Trip Chat Assistant',
    desc: 'Ask your personal AI assistant anything about your trip — restaurants, budget tweaks, packing lists.',
    color: '#06b6d4',
  },
  {
    icon: '💰',
    title: 'Budget Estimates',
    desc: 'Get instant budget breakdowns across flights, accommodation, food, and activities.',
    color: '#8b5cf6',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    desc: 'Your trips belong to you. JWT auth with HTTP-only cookies ensures complete data isolation.',
    color: '#ef4444',
  },
];

const DESTINATIONS = ['Tokyo', 'Paris', 'Bali', 'New York', 'Rome', 'Bangkok', 'Barcelona', 'Dubai'];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '100px 24px 80px',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 9999,
              padding: '8px 20px',
              fontSize: 13,
              color: '#818cf8',
              fontWeight: 500,
            }}
          >
            🤖 Powered by Google Gemini AI
          </span>
        </div>

        {/* Headline */}
        <h1
          className="fade-in-delay-1"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          <span style={{ color: '#f1f5f9' }}>Plan Your Perfect </span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI-Powered Trip
          </span>
        </h1>

        <p
          className="fade-in-delay-2"
          style={{
            color: '#64748b',
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            maxWidth: 600,
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}
        >
          Tell us your destination, budget and interests. Our AI generates a weather-aware itinerary in seconds — with hotels, budget estimates, and a personal travel assistant.
        </p>

        {/* CTA Buttons */}
        <div
          className="fade-in-delay-3"
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            href="/register"
            className="btn-primary"
            style={{
              textDecoration: 'none',
              padding: '16px 36px',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            ✈️ Start Planning Free
          </Link>
          <Link
            href="/login"
            style={{
              textDecoration: 'none',
              padding: '16px 36px',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 600,
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Sign In →
          </Link>
        </div>

        {/* Destination Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            marginTop: 48,
          }}
        >
          <span style={{ color: '#64748b', fontSize: 14, lineHeight: 2 }}>Popular:</span>
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest}
              href="/register"
              style={{
                textDecoration: 'none',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999,
                color: '#94a3b8',
                fontSize: 13,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#818cf8';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              {dest}
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 36,
            fontWeight: 800,
            color: '#f1f5f9',
            marginBottom: 12,
          }}
        >
          Everything You Need
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          One platform for AI itineraries, budget planning, hotel suggestions and more.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`glass glass-hover fade-in-delay-${Math.min(i + 1, 3)}`}
              style={{ padding: 28 }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: `${feature.color}18`,
                  border: `1px solid ${feature.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: 8,
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
