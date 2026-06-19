import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'AI Travel Planner — Smart Itineraries Powered by AI',
  description:
    'Plan your perfect trip with AI-powered itineraries, weather-aware activity suggestions, real-time budget estimates, and an intelligent travel chat assistant.',
  keywords: 'travel planner, AI travel, itinerary generator, trip planning, travel assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <div className="bg-mesh" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
