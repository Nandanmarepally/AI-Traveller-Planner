'use client';

import { Trip } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { tripApi } from '@/services/tripApi';

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  rainy: '🌧️',
  cloudy: '☁️',
  mixed: '⛅',
  unknown: '🌍',
};

const BUDGET_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Budget: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  Medium: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  Luxury: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [deleting, setDeleting] = useState(false);
  const budgetColors = BUDGET_COLORS[trip.budgetType] || BUDGET_COLORS.Medium;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    setDeleting(true);
    try {
      await tripApi.deleteTrip(trip._id);
      onDelete(trip._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/trips/${trip._id}`} style={{ textDecoration: 'none' }}>
      <div
        className="glass glass-hover"
        style={{
          padding: 24,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#f1f5f9',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: 4,
              }}
            >
              {trip.destination}
            </h3>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              {new Date(trip.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              color: '#ef4444',
              cursor: 'pointer',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <span
            className="tag"
            style={{
              background: budgetColors.bg,
              color: budgetColors.text,
              border: `1px solid ${budgetColors.border}`,
            }}
          >
            💰 {trip.budgetType}
          </span>
          <span
            className="tag"
            style={{
              background: 'rgba(6,182,212,0.1)',
              color: '#22d3ee',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            📅 {trip.days} {trip.days === 1 ? 'day' : 'days'}
          </span>
          <span
            className="tag"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {WEATHER_ICONS[trip.weatherContext?.condition || 'unknown']}{' '}
            {trip.weatherContext?.temperature > 0 ? `${trip.weatherContext.temperature}°C` : 'Weather'}
          </span>
        </div>

        {/* Interests */}
        {trip.interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {trip.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {interest}
              </span>
            ))}
            {trip.interests.length > 3 && (
              <span style={{ fontSize: 11, color: '#64748b' }}>+{trip.interests.length - 3} more</span>
            )}
          </div>
        )}

        {/* Budget total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ color: '#64748b', fontSize: 13 }}>Estimated Budget</span>
          <span
            style={{
              color: '#f1f5f9',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ${trip.budgetEstimate?.total?.toLocaleString() || '—'}
          </span>
        </div>
      </div>
    </Link>
  );
}
