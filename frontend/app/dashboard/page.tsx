'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { tripApi } from '@/services/tripApi';
import { Trip } from '@/types';
import Navbar from '@/components/Navbar';
import TripCard from '@/components/TripCard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fetchingTrips, setFetchingTrips] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      tripApi
        .getTrips()
        .then(({ trips }) => setTrips(trips))
        .catch((e) => setError(e.message))
        .finally(() => setFetchingTrips(false));
    }
  }, [user]);

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  if (loading) return null;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div
          className="fade-in"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 48,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 40,
                fontWeight: 800,
                marginBottom: 8,
                lineHeight: 1.1,
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
                My Trips
              </span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 16 }}>
              Welcome back, <strong style={{ color: '#94a3b8' }}>{user?.name}</strong>! You have{' '}
              <strong style={{ color: '#818cf8' }}>{trips.length}</strong> planned{' '}
              {trips.length === 1 ? 'adventure' : 'adventures'}.
            </p>
          </div>
          <Link
            href="/trips/new"
            className="btn-primary"
            style={{
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              fontSize: 15,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            ✈️ Plan New Trip
          </Link>
        </div>

        {/* Stats Row */}
        {!fetchingTrips && trips.length > 0 && (
          <div
            className="fade-in-delay-1"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}
          >
            {[
              {
                label: 'Total Trips',
                value: trips.length,
                icon: '🗺️',
                color: '#818cf8',
              },
              {
                label: 'Countries Planned',
                value: new Set(trips.map((t) => t.destination.split(',').pop()?.trim())).size,
                icon: '🌍',
                color: '#22d3ee',
              },
              {
                label: 'Total Budget',
                value: `$${trips.reduce((sum, t) => sum + (t.budgetEstimate?.total || 0), 0).toLocaleString()}`,
                icon: '💰',
                color: '#fbbf24',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <span style={{ fontSize: 28 }}>{stat.icon}</span>
                <div>
                  <p style={{ color: '#64748b', fontSize: 12, marginBottom: 2 }}>{stat.label}</p>
                  <p style={{ color: stat.color, fontSize: 22, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: 20,
              color: '#fca5a5',
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {fetchingTrips && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass" style={{ padding: 24, height: 220 }}>
                <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 20 }} />
                <div className="skeleton" style={{ height: 28, width: '80%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 20, width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Trip Grid */}
        {!fetchingTrips && trips.length > 0 && (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}
          >
            {trips.map((trip, i) => (
              <div
                key={trip._id}
                className={`fade-in-delay-${Math.min(i + 1, 3)}`}
              >
                <TripCard trip={trip} onDelete={handleDeleteTrip} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!fetchingTrips && trips.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)',
                border: '2px dashed rgba(99,102,241,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                margin: '0 auto 24px',
              }}
            >
              🗺️
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: 12,
              }}
            >
              No trips yet
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, marginBottom: 32 }}>
              Plan your first AI-powered adventure and get a complete itinerary in seconds!
            </p>
            <Link
              href="/trips/new"
              className="btn-primary"
              style={{
                textDecoration: 'none',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
                zIndex: 1,
              }}
            >
              ✈️ Plan My First Trip
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
