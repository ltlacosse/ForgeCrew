'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Color constants
const colors = {
  bg: '#141211',
  bgLight: '#1c1a17',
  bgCard: 'rgba(35, 32, 28, 0.9)',
  gold: '#d4af37',
  goldLight: '#e5c76b',
  goldDark: '#a68a2a',
  accent: '#2d4a3e',
  accentLight: '#3d6352',
  burgundy: '#722f37',
  text: '#f0ebe3',
  textMuted: '#a69f93',
  textDark: '#6b655c',
  border: 'rgba(212, 175, 55, 0.12)',
  borderLight: 'rgba(212, 175, 55, 0.25)',
};

// Interest options
const interestOptions = [
  { id: 'poker', name: 'Poker & Cards', icon: '♠' },
  { id: 'sports', name: 'Sports Leagues', icon: '⚽' },
  { id: 'hiking', name: 'Hiking & Outdoors', icon: '⛰' },
  { id: 'cars', name: 'Cars & Motorcycles', icon: '🏎' },
  { id: 'woodworking', name: 'Woodworking', icon: '🪓' },
  { id: 'fantasy', name: 'Fantasy Sports', icon: '🏈' },
  { id: 'fishing', name: 'Fishing & Hunting', icon: '🎣' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'grilling', name: 'BBQ & Grilling', icon: '🔥' },
  { id: 'fitness', name: 'Fitness & Lifting', icon: '💪' },
  { id: 'brewing', name: 'Home Brewing', icon: '🍺' },
];

// Helper function to calculate interest match score
const calculateMatchScore = (userInterests, otherInterests) => {
  if (!userInterests || !otherInterests) return 0;
  const matches = userInterests.filter(i => otherInterests.includes(i));
  return matches.length;
};

// Helper function to check location match (simple city matching for now)
const locationsMatch = (loc1, loc2) => {
  if (!loc1 || !loc2) return false;
  const city1 = loc1.toLowerCase().split(',')[0].trim();
  const city2 = loc2.toLowerCase().split(',')[0].trim();
  return city1 === city2;
};

// Sample groups data
const sampleGroups = [
  { 
    id: 1, 
    name: 'Thursday Night Poker', 
    category: 'Poker & Cards',
    members: 8,
    maxMembers: 10,
    nextEvent: 'This Saturday, 7 PM',
    location: 'Rotating homes',
    description: 'Weekly Texas Hold\'em game. $50 buy-in, friendly competition.',
    eventFee: 50,
    verified: true,
    featured: false,
  },
  { 
    id: 2, 
    name: 'Summit Seekers', 
    category: 'Hiking & Outdoors',
    members: 23,
    maxMembers: 30,
    nextEvent: 'Sunday, 6 AM',
    location: 'Trailhead TBD',
    description: 'Weekend hiking group tackling local trails.',
    eventFee: null,
    verified: true,
    featured: true,
  },
  { 
    id: 3, 
    name: 'Eastside Car Crew', 
    category: 'Cars & Motorcycles',
    members: 45,
    maxMembers: null,
    nextEvent: 'First Saturday monthly',
    location: 'Various meets',
    description: 'Cars and coffee, weekend cruises, and shop days.',
    eventFee: null,
    verified: false,
    featured: false,
  },
  { 
    id: 4, 
    name: 'Detroit Cigar Society', 
    category: 'Cigars & Whiskey',
    members: 18,
    maxMembers: 25,
    nextEvent: 'Friday, 8 PM',
    location: 'The Churchill Lounge',
    description: 'Monthly cigar nights at premium lounges.',
    eventFee: 35,
    verified: true,
    featured: true,
  },
];

// Container styles
const containerStyle = {
  minHeight: '100vh',
  background: `linear-gradient(180deg, ${colors.bgLight} 0%, #0d0c0a 100%)`,
  fontFamily: '"Cormorant Garamond", Georgia, serif',
  color: colors.text,
};

const contentStyle = {
  maxWidth: '430px',
  margin: '0 auto',
  minHeight: '100vh',
  background: `linear-gradient(180deg, ${colors.bgLight} 0%, #141110 100%)`,
  boxShadow: '0 0 80px rgba(0,0,0,0.8)',
};

// Bottom Navigation Component
const BottomNav = ({ active, onNavigate }) => (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    background: 'linear-gradient(180deg, rgba(20, 17, 16, 0.95) 0%, rgba(20, 17, 16, 1) 100%)',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    padding: '12px 0',
    zIndex: 100,
  }}>
    {[
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'explore', icon: '🔍', label: 'Explore' },
      { id: 'messages', icon: '💬', label: 'Messages' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ].map(item => (
      <button 
        key={item.id}
        onClick={() => onNavigate(item.id)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px',
          color: active === item.id ? colors.gold : colors.textDark,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontFamily: '"Cormorant Garamond", Georgia, serif',
        }}
      >
        <span style={{ fontSize: '22px' }}>{item.icon}</span>
        <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.label}</span>
      </button>
    ))}
  </div>
);

// Main ForgeCrew Component
export default function ForgeCrew() {
  // Auth state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Screen state
  const [currentScreen, setCurrentScreen] = useState('splash');
  
  // Auth form state
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Onboarding state
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingLocation, setOnboardingLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  // App state
  const [joinedCrews, setJoinedCrews] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
        setCurrentScreen('home');
        // Fetch nearby users after profile loads
        fetchNearbyUsers(data);
      } else {
        // No profile yet, need onboarding
        setCurrentScreen('onboarding-name');
      }
    } catch (error) {
      // Profile doesn't exist yet
      setCurrentScreen('onboarding-name');
    }
  };

  // Fetch users with matching location and interests
  const fetchNearbyUsers = async (currentProfile) => {
    if (!currentProfile) return;
    setLoadingNearby(true);
    
    try {
      // Get all profiles except current user
      const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentProfile.id);
      
      if (error) throw error;
      
      if (allUsers && allUsers.length > 0) {
        // Score and sort users by match quality
        const scoredUsers = allUsers.map(otherUser => {
          const locationMatch = locationsMatch(currentProfile.location, otherUser.location);
          const interestScore = calculateMatchScore(currentProfile.interests, otherUser.interests);
          const sharedInterests = currentProfile.interests?.filter(i => 
            otherUser.interests?.includes(i)
          ) || [];
          
          return {
            ...otherUser,
            locationMatch,
            interestScore,
            sharedInterests,
            totalScore: (locationMatch ? 10 : 0) + interestScore
          };
        });
        
        // Sort by total score (highest first) and filter out zero matches
        const sortedUsers = scoredUsers
          .filter(u => u.totalScore > 0)
          .sort((a, b) => b.totalScore - a.totalScore);
        
        setNearbyUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  // Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Send notification email
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: '' }),
          });
        } catch (e) {
          console.log('Notification failed:', e);
        }
        
        setUser(data.user);
        setCurrentScreen('onboarding-name');
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      await fetchProfile(data.user.id);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentScreen('splash');
  };

  // Save Profile
  const saveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: onboardingName,
          location: onboardingLocation,
          interests: selectedInterests,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update notification with name
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: onboardingName }),
        });
      } catch (e) {
        console.log('Notification failed:', e);
      }

      setProfile({
        id: user.id,
        email: user.email,
        name: onboardingName,
        location: onboardingLocation,
        interests: selectedInterests,
      });
      
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                margin: '0 auto 16px',
              }}>🔥</div>
              <p style={{ color: colors.textMuted }}>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SPLASH SCREEN
  if (currentScreen === 'splash') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px 30px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '20px',
            }}>🔥</div>
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '42px',
              fontWeight: '700',
              letterSpacing: '3px',
              marginBottom: '8px',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #f5f0e6 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>ForgeCrew</h1>
            <p style={{
              fontSize: '16px',
              color: colors.textMuted,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '50px',
            }}>Brotherhood Built</p>
            
            <button 
              className="btn-primary"
              style={{ width: '100%', maxWidth: '280px', marginBottom: '16px' }}
              onClick={() => { setAuthMode('signup'); setCurrentScreen('auth'); }}
            >
              Get Started
            </button>
            
            <button 
              className="btn-secondary"
              style={{ width: '100%', maxWidth: '280px' }}
              onClick={() => { setAuthMode('login'); setCurrentScreen('auth'); }}
            >
              I Have an Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTH SCREEN (Login / Sign Up)
  if (currentScreen === 'auth') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <button 
              onClick={() => setCurrentScreen('splash')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.gold,
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '32px',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              ← Back
            </button>
            
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#f4e8d9',
            }}>
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              {authMode === 'signup' 
                ? 'Join the brotherhood. Find your crew.' 
                : 'Sign in to continue to your crews.'}
            </p>
            
            <form onSubmit={authMode === 'signup' ? handleSignUp : handleLogin}>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginBottom: '16px' }}
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ marginBottom: '24px' }}
              />
              
              {authError && (
                <p style={{
                  color: '#e74c3c',
                  fontSize: '14px',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'rgba(231, 76, 60, 0.1)',
                  borderRadius: '6px',
                }}>
                  {authError}
                </p>
              )}
              
              <button 
                className="btn-primary"
                type="submit"
                style={{ width: '100%', opacity: authLoading ? 0.7 : 1 }}
                disabled={authLoading}
              >
                {authLoading 
                  ? 'Please wait...' 
                  : authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <div style={{
              marginTop: '32px',
              textAlign: 'center',
              color: colors.textMuted,
              fontSize: '14px',
            }}>
              {authMode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.gold,
                      cursor: 'pointer',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '14px',
                    }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.gold,
                      cursor: 'pointer',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '14px',
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING - NAME
  if (currentScreen === 'onboarding-name') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: colors.gold }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
            </div>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#f4e8d9',
            }}>
              What should we call you?
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              This is how you'll appear to other members.
            </p>
            <input
              className="input"
              type="text"
              placeholder="Your name"
              value={onboardingName}
              onChange={(e) => setOnboardingName(e.target.value)}
              style={{ marginBottom: '24px' }}
            />
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: onboardingName ? 1 : 0.5 }}
              onClick={() => onboardingName && setCurrentScreen('onboarding-location')}
              disabled={!onboardingName}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING - LOCATION
  if (currentScreen === 'onboarding-location') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
              <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: colors.gold }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
            </div>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#f4e8d9',
            }}>
              Where are you located?
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              We'll find crews and events near you.
            </p>
            <input
              className="input"
              type="text"
              placeholder="City, State (e.g., Detroit, MI)"
              value={onboardingLocation}
              onChange={(e) => setOnboardingLocation(e.target.value)}
              style={{ marginBottom: '24px' }}
            />
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: onboardingLocation ? 1 : 0.5 }}
              onClick={() => onboardingLocation && setCurrentScreen('onboarding-interests')}
              disabled={!onboardingLocation}
            >
              Continue
            </button>
            <button 
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setCurrentScreen('onboarding-interests')}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING - INTERESTS
  if (currentScreen === 'onboarding-interests') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
              <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: colors.gold }} />
            </div>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#f4e8d9',
            }}>
              What are you into?
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              Select your interests to find the right crews.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
              {interestOptions.map(interest => (
                <div
                  key={interest.id}
                  style={{
                    padding: '20px 16px',
                    background: selectedInterests.includes(interest.id) 
                      ? `linear-gradient(135deg, rgba(184, 134, 80, 0.2) 0%, rgba(139, 98, 56, 0.15) 100%)`
                      : 'rgba(255,255,255,0.02)',
                    border: selectedInterests.includes(interest.id)
                      ? `1px solid rgba(184, 134, 80, 0.5)`
                      : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{interest.icon}</div>
                  <div style={{ fontSize: '13px', color: '#c9bfb0' }}>{interest.name}</div>
                </div>
              ))}
            </div>
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: selectedInterests.length ? 1 : 0.5 }}
              onClick={saveProfile}
              disabled={!selectedInterests.length}
            >
              Find My Crews
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME SCREEN
  if (currentScreen === 'home') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
              padding: '24px 20px',
              background: `linear-gradient(180deg, rgba(30, 25, 21, 1) 0%, rgba(30, 25, 21, 0) 100%)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: colors.goldLight,
                }}>
                  ForgeCrew
                </div>
                <div 
                  onClick={() => setCurrentScreen('profile')}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.bg,
                    cursor: 'pointer',
                  }}
                >
                  {profile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '4px' }}>Welcome back,</p>
              <h2 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '22px',
                color: '#f4e8d9',
              }}>
                {profile?.name || 'Friend'}
              </h2>
            </div>
            
            {/* Location badge */}
            {profile?.location && (
              <div style={{
                margin: '0 20px 20px',
                padding: '12px 16px',
                background: 'rgba(45, 74, 62, 0.2)',
                border: `1px solid rgba(45, 74, 62, 0.3)`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>📍</span>
                <span style={{ color: colors.text, fontSize: '14px' }}>{profile.location}</span>
              </div>
            )}
            
            {/* Crews section */}
            <div style={{ padding: '0 20px', marginBottom: '16px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: colors.gold,
              }}>
                Recommended Crews
              </span>
            </div>
            
            {sampleGroups.map(group => (
              <div 
                key={group.id}
                className="card"
                style={{ margin: '0 20px 16px', padding: '20px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#f4e8d9',
                      }}>
                        {group.name}
                      </h3>
                      {group.verified && <span style={{ color: colors.gold }}>✓</span>}
                      {group.featured && <span>⭐</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {group.category}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: colors.textMuted,
                    background: 'rgba(184, 134, 80, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                  }}>
                    {group.members} members
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.textMuted }}>
                  <span>📍 {group.location}</span>
                  <span>📅 {group.nextEvent}</span>
                </div>
              </div>
            ))}
            
            {/* People Near You Section */}
            <div style={{ padding: '0 20px', marginTop: '32px', marginBottom: '16px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: colors.gold,
              }}>
                People Near You
              </span>
            </div>
            
            {loadingNearby ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>Finding people nearby...</p>
              </div>
            ) : nearbyUsers.length > 0 ? (
              nearbyUsers.map(person => (
                <div 
                  key={person.id}
                  className="card"
                  style={{ margin: '0 20px 12px', padding: '16px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: colors.text,
                    }}>
                      {person.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#f4e8d9',
                        marginBottom: '4px',
                      }}>
                        {person.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {person.locationMatch && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: colors.accent,
                            background: 'rgba(45, 74, 62, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                          }}>
                            📍 {person.location}
                          </span>
                        )}
                        {person.sharedInterests?.slice(0, 2).map(interestId => {
                          const interest = interestOptions.find(i => i.id === interestId);
                          return interest ? (
                            <span key={interestId} style={{ 
                              fontSize: '11px', 
                              color: colors.textMuted,
                              background: 'rgba(184, 134, 80, 0.1)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}>
                              {interest.icon} {interest.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: colors.gold,
                      background: 'rgba(212, 175, 55, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                    }}>
                      {person.interestScore} match{person.interestScore !== 1 ? 'es' : ''}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                margin: '0 20px', 
                padding: '24px', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
              }}>
                <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '8px' }}>
                  No matches yet in your area
                </p>
                <p style={{ color: colors.textDark, fontSize: '13px' }}>
                  Invite friends to join ForgeCrew!
                </p>
              </div>
            )}
          </div>
          
          <BottomNav active="home" onNavigate={setCurrentScreen} />
        </div>
      </div>
    );
  }

  // EXPLORE SCREEN
  if (currentScreen === 'explore') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            <div style={{ padding: '24px 20px' }}>
              <h1 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '28px',
                color: '#f4e8d9',
                marginBottom: '20px',
              }}>
                Explore Crews
              </h1>
              <input 
                className="input" 
                placeholder="Search crews, interests, locations..." 
              />
            </div>
            
            <div style={{ padding: '0 20px' }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: colors.gold,
                marginBottom: '16px',
              }}>
                Browse by Interest
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {interestOptions.slice(0, 9).map(interest => (
                  <div key={interest.id} style={{
                    padding: '16px 8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{interest.icon}</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>{interest.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <BottomNav active="explore" onNavigate={setCurrentScreen} />
        </div>
      </div>
    );
  }

  // MESSAGES SCREEN
  if (currentScreen === 'messages') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h1 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '28px',
                color: '#f4e8d9',
              }}>
                Messages
              </h1>
            </div>
            
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '20px',
                color: '#f4e8d9',
                marginBottom: '8px',
              }}>
                No messages yet
              </h3>
              <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                Join a crew to start chatting with other members.
              </p>
            </div>
          </div>
          
          <BottomNav active="messages" onNavigate={setCurrentScreen} />
        </div>
      </div>
    );
  }

  // PROFILE SCREEN
  if (currentScreen === 'profile') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: `radial-gradient(ellipse at 50% 0%, rgba(184, 134, 80, 0.1) 0%, transparent 60%)`,
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: '600',
                color: colors.bg,
                margin: '0 auto 16px',
              }}>
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h1 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '28px',
                color: '#f4e8d9',
                marginBottom: '4px',
              }}>
                {profile?.name || 'User'}
              </h1>
              <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                {profile?.email}
              </p>
              {profile?.location && (
                <p style={{ color: colors.textMuted, fontSize: '14px', marginTop: '4px' }}>
                  📍 {profile.location}
                </p>
              )}
            </div>
            
            {/* Interests */}
            {profile?.interests?.length > 0 && (
              <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: colors.gold,
                  marginBottom: '12px',
                }}>
                  Interests
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.interests.map(interestId => {
                    const interest = interestOptions.find(i => i.id === interestId);
                    return interest ? (
                      <span key={interestId} style={{
                        padding: '8px 12px',
                        background: 'rgba(184, 134, 80, 0.1)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '20px',
                        fontSize: '13px',
                        color: colors.text,
                      }}>
                        {interest.icon} {interest.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {/* Logout button */}
            <div style={{ padding: '0 20px' }}>
              <button 
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <BottomNav active="profile" onNavigate={setCurrentScreen} />
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}
