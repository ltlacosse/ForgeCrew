'use client';

import React, { useState } from 'react';

// Color constants - Refined palette
const colors = {
  bg: '#141211',
  bgLight: '#1c1a17',
  bgCard: 'rgba(35, 32, 28, 0.9)',
  gold: '#d4af37',           // True gold - more refined
  goldLight: '#e5c76b',      // Brighter gold for highlights
  goldDark: '#a68a2a',       // Deeper gold for gradients
  accent: '#2d4a3e',         // Deep forest green - poker table feel
  accentLight: '#3d6352',    // Lighter green for hover states
  burgundy: '#722f37',       // Deep red - cigar lounge accent
  text: '#f0ebe3',           // Slightly warmer white
  textMuted: '#a69f93',      // Warmer muted text
  textDark: '#6b655c',       // Darker muted text
  border: 'rgba(212, 175, 55, 0.12)',
  borderLight: 'rgba(212, 175, 55, 0.25)',
};

// Data
const interests = [
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

const initialGroups = [
  { 
    id: 1, 
    name: 'Thursday Night Poker', 
    category: 'Poker & Cards',
    members: 8,
    maxMembers: 10,
    nextEvent: 'This Saturday, 7 PM',
    location: 'Rotating homes',
    description: 'Weekly Texas Hold\'em game. $50 buy-in, friendly competition. We rotate hosting duties. Drinks provided, bring snacks to share.',
    eventFee: 50,
    verified: true,
    featured: false,
    membersList: [
      { name: 'Mike T.', role: 'Organizer', joined: 'Founder', avatar: 'M', badge: 'Founding Member' },
      { name: 'James R.', role: 'Member', joined: '6 months ago', avatar: 'J', badge: 'Regular' },
      { name: 'Dave K.', role: 'Member', joined: '4 months ago', avatar: 'D', badge: null },
      { name: 'Chris M.', role: 'Member', joined: '3 months ago', avatar: 'C', badge: null },
      { name: 'Steve B.', role: 'Member', joined: '2 months ago', avatar: 'S', badge: 'Newbie' },
    ],
    sponsor: null,
  },
  { 
    id: 2, 
    name: 'Summit Seekers', 
    category: 'Hiking & Outdoors',
    members: 23,
    maxMembers: 30,
    nextEvent: 'Sunday, 6 AM',
    location: 'Trailhead TBD',
    description: 'Weekend hiking group tackling local trails and occasional overnight trips. All skill levels welcome.',
    eventFee: null,
    verified: true,
    featured: true,
    membersList: [
      { name: 'Alex P.', role: 'Organizer', joined: 'Founder', avatar: 'A', badge: 'Founding Member' },
    ],
    sponsor: { name: 'REI', logo: '🏔', offer: '15% off gear for members' },
  },
  { 
    id: 3, 
    name: 'Eastside Car Crew', 
    category: 'Cars & Motorcycles',
    members: 45,
    maxMembers: null,
    nextEvent: 'First Saturday monthly',
    location: 'Various meets',
    description: 'Cars and coffee, weekend cruises, and shop days. All makes and models welcome.',
    eventFee: null,
    verified: false,
    featured: false,
    membersList: [],
    sponsor: null,
  },
  { 
    id: 4, 
    name: 'Sawdust Society', 
    category: 'Woodworking',
    members: 12,
    maxMembers: 15,
    nextEvent: 'Wednesday, 6 PM',
    location: 'Community Workshop',
    description: 'Learn woodworking, share projects, and use the community shop. Beginners encouraged.',
    eventFee: 25,
    verified: true,
    featured: false,
    membersList: [],
    sponsor: null,
  },
  { 
    id: 5, 
    name: 'Detroit Cigar Society', 
    category: 'Cigars & Whiskey',
    members: 18,
    maxMembers: 25,
    nextEvent: 'Friday, 8 PM',
    location: 'The Churchill Lounge',
    description: 'Monthly cigar nights at premium lounges. Good conversation, better smoke. 21+ only.',
    eventFee: 35,
    verified: true,
    featured: true,
    membersList: [],
    sponsor: { name: 'Davidoff', logo: '🥃', offer: 'Complimentary cigar for first-timers' },
  },
];

const initialNotifications = [
  { id: 1, type: 'event', title: 'Thursday Night Poker is meeting Saturday', subtitle: '6 others confirmed · 7 PM', time: '2h ago', unread: true },
  { id: 2, type: 'message', title: 'Mike T. posted in Thursday Night Poker', subtitle: '"Who\'s bringing the cards Saturday?"', time: '4h ago', unread: true },
  { id: 3, type: 'new_crew', title: 'New crew near you', subtitle: 'Detroit Cigar Society · 12 members', time: '1d ago', unread: false },
  { id: 4, type: 'achievement', title: 'Achievement Unlocked!', subtitle: 'You\'ve attended 5 meetups 🎯', time: '3d ago', unread: false },
  { id: 5, type: 'seasonal', title: '🏈 Fantasy Football Season', subtitle: '8 new fantasy crews in your area', time: '1w ago', unread: false },
];

const userStats = {
  meetupsAttended: 12,
  crewsJoined: 3,
  memberSince: 'March 2024',
  badges: ['Founding Member', 'Regular', 'Organizer'],
};

// Modal Component
const Modal = ({ children, onClose }) => (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }} 
    onClick={onClose}
  >
    <div 
      onClick={e => e.stopPropagation()} 
      style={{
        background: `linear-gradient(180deg, #252019 0%, #1a1512 100%)`,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        maxWidth: '380px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  </div>
);

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
          fontFamily: '"Crimson Pro", Georgia, serif',
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
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [userName, setUserName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [joinedCrews, setJoinedCrews] = useState([1]);
  const [rsvpd, setRsvpd] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Mike T.', text: "Who's bringing the cards Saturday?", time: '2:34 PM', avatar: 'M' },
    { id: 2, user: 'James R.', text: 'I got a new set. Kem plastic, casino quality.', time: '2:41 PM', avatar: 'J' },
    { id: 3, user: 'Dave K.', text: "Nice. I'll handle the whiskey.", time: '3:05 PM', avatar: 'D' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const groups = initialGroups;
  const notifications = initialNotifications;

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        text: newMessage,
        time: 'Just now',
        avatar: userName[0]?.toUpperCase() || 'Y'
      }]);
      setNewMessage('');
    }
  };

  const handleJoinCrew = (groupId) => {
    if (!isPremium && joinedCrews.length >= 3 && !joinedCrews.includes(groupId)) {
      setShowPremiumModal(true);
    } else if (!joinedCrews.includes(groupId)) {
      setJoinedCrews([...joinedCrews, groupId]);
    }
  };

  // Container style used across screens
  const containerStyle = {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${colors.bgLight} 0%, #0d0c0a 100%)`,
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    color: colors.text,
    position: 'relative',
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    maxWidth: '430px',
    margin: '0 auto',
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${colors.bgLight} 0%, #141110 100%)`,
    boxShadow: '0 0 80px rgba(0,0,0,0.8)',
  };

  // Premium Modal
  const PremiumModal = () => (
    <Modal onClose={() => setShowPremiumModal(false)}>
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '28px',
        }}>⚜</div>
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '26px',
          color: '#f4e8d9',
          marginBottom: '8px',
        }}>Upgrade to Premium</h2>
        <p style={{ color: colors.textMuted, marginBottom: '24px', lineHeight: '1.6' }}>
          You've joined 3 crews. Upgrade to unlock unlimited access.
        </p>
        
        <div style={{
          background: 'rgba(184, 134, 80, 0.1)',
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontFamily: '"Playfair Display", Georgia, serif',
            color: colors.goldLight,
            marginBottom: '4px',
          }}>
            $9.99<span style={{ fontSize: '16px', color: colors.textMuted }}>/month</span>
          </div>
          <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
            Cancel anytime
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Unlimited crew memberships',
              'Create your own crews',
              'Priority matching',
              'See who viewed your profile',
              'Verified member badge',
              'Early access to new features',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: colors.text }}>
                <span style={{ color: colors.gold }}>✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="btn-primary"
          style={{ width: '100%', marginBottom: '12px' }}
          onClick={() => { setIsPremium(true); setShowPremiumModal(false); }}
        >
          Upgrade Now
        </button>
        <button 
          className="btn-secondary"
          style={{ width: '100%', padding: '14px' }}
          onClick={() => setShowPremiumModal(false)}
        >
          Maybe Later
        </button>
      </div>
    </Modal>
  );

  // Payment Modal
  const PaymentModal = ({ group, onClose }) => (
    <Modal onClose={onClose}>
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '22px',
          color: '#f4e8d9',
          marginBottom: '8px',
        }}>RSVP & Pay</h2>
        <p style={{ color: colors.textMuted, marginBottom: '24px', fontSize: '14px' }}>
          {group.name} · {group.nextEvent}
        </p>
        
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: colors.textMuted }}>Event fee</span>
            <span style={{ color: colors.text }}>${group.eventFee}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: colors.textMuted }}>Platform fee (5%)</span>
            <span style={{ color: colors.text }}>${(group.eventFee * 0.05).toFixed(2)}</span>
          </div>
          <div style={{ 
            borderTop: `1px solid ${colors.border}`, 
            paddingTop: '12px',
            display: 'flex', 
            justifyContent: 'space-between',
          }}>
            <span style={{ color: colors.text, fontWeight: '600' }}>Total</span>
            <span style={{ color: colors.goldLight, fontWeight: '600', fontSize: '18px' }}>
              ${(group.eventFee * 1.05).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: colors.textMuted, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Card Number
          </label>
          <input className="input" style={{ marginBottom: '12px' }} placeholder="4242 4242 4242 4242" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input className="input" style={{ flex: 1 }} placeholder="MM/YY" />
            <input className="input" style={{ flex: 1 }} placeholder="CVC" />
          </div>
        </div>
        
        <button 
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={() => { setRsvpd([...rsvpd, group.id]); onClose(); }}
        >
          Confirm & Pay ${(group.eventFee * 1.05).toFixed(2)}
        </button>
        
        <p style={{ fontSize: '11px', color: colors.textDark, textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }}>
          🔒 Secured by Stripe. Your payment info is encrypted.
        </p>
      </div>
    </Modal>
  );

  // Notifications Panel
  const NotificationsPanel = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      right: showNotifications ? 0 : '-100%',
      bottom: 0,
      width: '100%',
      maxWidth: '430px',
      background: `linear-gradient(180deg, #1e1915 0%, #141110 100%)`,
      zIndex: 1000,
      transition: 'right 0.3s ease',
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: colors.bgLight,
        zIndex: 10,
      }}>
        <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '22px', color: '#f4e8d9' }}>
          Notifications
        </h2>
        <button 
          onClick={() => setShowNotifications(false)}
          style={{ background: 'none', border: 'none', color: colors.gold, fontSize: '24px', cursor: 'pointer' }}
        >×</button>
      </div>
      
      <div style={{ padding: '12px' }}>
        {notifications.map(notif => (
          <div key={notif.id} style={{
            padding: '16px',
            background: notif.unread ? 'rgba(184, 134, 80, 0.08)' : 'transparent',
            borderRadius: '10px',
            marginBottom: '8px',
            borderLeft: notif.unread ? `3px solid ${colors.gold}` : '3px solid transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ 
                fontSize: '15px', 
                fontWeight: notif.unread ? '600' : '400',
                color: notif.unread ? '#f4e8d9' : colors.text,
              }}>{notif.title}</span>
              <span style={{ fontSize: '11px', color: colors.textDark }}>{notif.time}</span>
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{notif.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );

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
            background: `radial-gradient(ellipse at 50% 30%, rgba(184, 134, 80, 0.08) 0%, transparent 50%), linear-gradient(180deg, #1e1915 0%, #141110 100%)`,
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
              boxShadow: '0 8px 32px rgba(184, 134, 80, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: `1px solid ${colors.borderLight}`,
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
              marginBottom: '60px',
            }}>Brotherhood Built</p>
            <div style={{
              width: '120px',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
              margin: '0 auto 60px',
            }} />
            <button className="btn-primary" onClick={() => setCurrentScreen('onboarding-name')}>
              Get Started
            </button>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '16px' }}
              onClick={() => { setUserName('Mike'); setCurrentScreen('home'); }}
            >
              I Have an Account
            </button>
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
            </div>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', fontWeight: '600', marginBottom: '12px', color: '#f4e8d9' }}>
              What should we call you?
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px', lineHeight: '1.6' }}>
              This is how you'll appear to other members in your crews.
            </p>
            <input
              className="input"
              style={{ marginBottom: '24px' }}
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: userName ? 1 : 0.5 }}
              onClick={() => userName && setCurrentScreen('onboarding-interests')}
              disabled={!userName}
            >
              Continue
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
              <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: colors.gold }} />
            </div>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', fontWeight: '600', marginBottom: '12px', color: '#f4e8d9' }}>
              What are you into?
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px', lineHeight: '1.6' }}>
              Select your interests and we'll match you with local crews.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
              {interests.map(interest => (
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
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#c9bfb0', letterSpacing: '0.5px' }}>
                    {interest.name}
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: selectedInterests.length ? 1 : 0.5 }}
              onClick={() => selectedInterests.length && setCurrentScreen('home')}
              disabled={!selectedInterests.length}
            >
              Find My Crews
            </button>
          </div>
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
                boxShadow: '0 8px 32px rgba(184, 134, 80, 0.3)',
              }}>
                {userName ? userName[0].toUpperCase() : 'G'}
              </div>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', color: '#f4e8d9', marginBottom: '4px' }}>
                {userName || 'Guest'}
              </h1>
              <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>
                Member since {userStats.memberSince}
              </p>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {userStats.badges.map((badge, i) => (
                  <span key={i} style={{
                    background: 'rgba(184, 134, 80, 0.15)',
                    border: `1px solid ${colors.border}`,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: colors.goldLight,
                    letterSpacing: '0.5px',
                  }}>
                    {badge === 'Founding Member' && '⭐ '}
                    {badge === 'Regular' && '🔥 '}
                    {badge === 'Organizer' && '👑 '}
                    {badge}
                  </span>
                ))}
                {isPremium && (
                  <span style={{
                    background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: colors.bg,
                    fontWeight: '600',
                  }}>⚜ PREMIUM</span>
                )}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              margin: '0 20px 24px',
              background: colors.bgCard,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}>
              <div style={{ flex: 1, padding: '20px', textAlign: 'center', borderRight: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '32px', fontFamily: '"Playfair Display", Georgia, serif', color: colors.goldLight, marginBottom: '4px' }}>
                  {userStats.meetupsAttended}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Meetups</div>
              </div>
              <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontFamily: '"Playfair Display", Georgia, serif', color: colors.goldLight, marginBottom: '4px' }}>
                  {joinedCrews.length}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Crews</div>
              </div>
            </div>
            
            <div style={{
              margin: '0 20px 24px',
              padding: '20px',
              background: colors.bgCard,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>Next badge: <span style={{ color: colors.goldLight }}>Veteran</span></span>
                <span style={{ fontSize: '13px', color: colors.gold }}>{userStats.meetupsAttended}/25 meetups</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(userStats.meetupsAttended / 25) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                  borderRadius: '4px',
                }} />
              </div>
            </div>
            
            <div style={{ padding: '0 20px' }}>
              {!isPremium && (
                <button 
                  onClick={() => setShowPremiumModal(true)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: `linear-gradient(135deg, rgba(184, 134, 80, 0.2) 0%, rgba(139, 98, 56, 0.15) 100%)`,
                    border: `1px solid ${colors.gold}`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    fontFamily: '"Crimson Pro", Georgia, serif',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>⚜</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: colors.goldLight, fontWeight: '600' }}>Upgrade to Premium</div>
                    <div style={{ color: colors.textMuted, fontSize: '13px' }}>Unlimited crews, create your own & more</div>
                  </div>
                  <span style={{ color: colors.gold }}>→</span>
                </button>
              )}
              
              {[
                { icon: '⚙', label: 'Settings', subtitle: 'Account, notifications, privacy' },
                { icon: '📍', label: 'Location', subtitle: 'Detroit, MI' },
                { icon: '🎯', label: 'Interests', subtitle: `${selectedInterests.length || 4} selected` },
                { icon: '❓', label: 'Help & Support', subtitle: 'FAQ, contact us' },
              ].map((item, i) => (
                <button key={i} style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  fontFamily: '"Crimson Pro", Georgia, serif',
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: colors.text }}>{item.label}</div>
                    <div style={{ color: colors.textMuted, fontSize: '13px' }}>{item.subtitle}</div>
                  </div>
                  <span style={{ color: colors.textDark }}>→</span>
                </button>
              ))}
            </div>
          </div>
          
          <BottomNav active="profile" onNavigate={setCurrentScreen} />
          {showPremiumModal && <PremiumModal />}
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
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', color: '#f4e8d9', marginBottom: '20px' }}>
                Explore Crews
              </h1>
              <input className="input" style={{ marginBottom: '20px' }} placeholder="Search crews, interests, locations..." />
            </div>
            
            <div style={{
              margin: '0 20px 24px',
              padding: '20px',
              background: `linear-gradient(135deg, rgba(45, 74, 62, 0.4) 0%, rgba(45, 74, 62, 0.15) 100%)`,
              border: `1px solid rgba(45, 74, 62, 0.5)`,
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏈</div>
              <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '18px', color: '#f0ebe3', marginBottom: '4px' }}>
                Fantasy Football Season
              </h3>
              <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '12px' }}>
                8 new fantasy crews in your area. Draft day is coming!
              </p>
              <button style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, #1f332b 100%)`,
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#a8c5b8',
                cursor: 'pointer',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}>Browse Fantasy Crews</button>
            </div>
            
            <div style={{ padding: '0 20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: colors.gold, marginBottom: '16px' }}>
                Browse by Interest
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {interests.slice(0, 9).map(interest => (
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
    const conversations = [
      { id: 1, name: 'Thursday Night Poker', lastMessage: 'Dave K.: Nice. I\'ll handle the whiskey.', time: '3:05 PM', unread: 2, isGroup: true },
      { id: 2, name: 'Mike T.', lastMessage: 'You coming Saturday?', time: '1:22 PM', unread: 0, isGroup: false },
      { id: 3, name: 'Summit Seekers', lastMessage: 'Alex P.: Trail conditions look good', time: 'Yesterday', unread: 0, isGroup: true },
    ];
    
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', color: '#f4e8d9' }}>Messages</h1>
            </div>
            
            {conversations.map(conv => (
              <div key={conv.id} style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: conv.isGroup ? '12px' : '50%',
                  background: `linear-gradient(135deg, ${colors.goldDark} 0%, #3a332d 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: conv.isGroup ? '20px' : '18px',
                  color: colors.goldLight,
                }}>
                  {conv.isGroup ? '👥' : conv.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: conv.unread ? '600' : '400', color: '#f4e8d9' }}>{conv.name}</span>
                    <span style={{ fontSize: '12px', color: colors.textDark }}>{conv.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '13px', 
                      color: conv.unread ? colors.text : colors.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '220px',
                    }}>{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span style={{
                        background: colors.gold,
                        color: colors.bg,
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <BottomNav active="messages" onNavigate={setCurrentScreen} />
        </div>
      </div>
    );
  }

  // GROUP DETAIL SCREEN
  if (currentScreen === 'group-detail' && selectedGroup) {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ paddingBottom: '100px' }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '20px',
                fontSize: '14px',
                color: colors.gold,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: '"Crimson Pro", Georgia, serif',
              }}
              onClick={() => setCurrentScreen('home')}
            >
              ← Back to Crews
            </button>
            
            <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {selectedGroup.featured && (
                  <span style={{
                    background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: colors.bg,
                    letterSpacing: '1px',
                  }}>⭐ FEATURED</span>
                )}
                {selectedGroup.verified && (
                  <span style={{
                    background: `linear-gradient(135deg, ${colors.accent} 0%, #1f332b 100%)`,
                    border: `1px solid rgba(45, 74, 62, 0.5)`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#a8c5b8',
                    letterSpacing: '1px',
                  }}>✓ VERIFIED</span>
                )}
              </div>
              
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', fontWeight: '600', color: '#f4e8d9', marginBottom: '8px' }}>
                {selectedGroup.name}
              </h1>
              <p style={{ fontSize: '13px', color: colors.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
                {selectedGroup.category}
              </p>
              
              {selectedGroup.sponsor && (
                <div style={{
                  background: 'rgba(184, 134, 80, 0.1)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '24px' }}>{selectedGroup.sponsor.logo}</span>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>
                      Sponsored by {selectedGroup.sponsor.name}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.goldLight }}>{selectedGroup.sponsor.offer}</div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: colors.goldLight, fontFamily: '"Playfair Display", Georgia, serif' }}>
                    {selectedGroup.members}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Members</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: colors.goldLight, fontFamily: '"Playfair Display", Georgia, serif' }}>
                    {selectedGroup.nextEvent.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Next Meet</div>
                </div>
                {selectedGroup.eventFee && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: colors.goldLight, fontFamily: '"Playfair Display", Georgia, serif' }}>
                      ${selectedGroup.eventFee}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Per Event</div>
                  </div>
                )}
              </div>
              
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#b5a898' }}>{selectedGroup.description}</p>
              
              {joinedCrews.includes(selectedGroup.id) ? (
                selectedGroup.eventFee && !rsvpd.includes(selectedGroup.id) ? (
                  <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowPaymentModal(true)}>
                    RSVP & Pay ${selectedGroup.eventFee}
                  </button>
                ) : (
                  <div style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(184, 134, 80, 0.1)',
                    border: `1px solid ${colors.gold}`,
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: colors.goldLight,
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontSize: '14px',
                  }}>
                    ✓ {rsvpd.includes(selectedGroup.id) ? "You're Going!" : 'Member'}
                  </div>
                )
              ) : (
                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => handleJoinCrew(selectedGroup.id)}>
                  Join This Crew
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, margin: '0 20px' }}>
              {['about', 'members', 'chat'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '500',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: activeTab === tab ? colors.gold : colors.textMuted,
                    borderBottom: activeTab === tab ? `2px solid ${colors.gold}` : '2px solid transparent',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontFamily: '"Crimson Pro", Georgia, serif',
                  }}
                >{tab}</button>
              ))}
            </div>
            
            {activeTab === 'about' && (
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Next Event</div>
                  <div style={{ fontSize: '16px', color: colors.text }}>{selectedGroup.nextEvent}</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Location</div>
                  <div style={{ fontSize: '16px', color: colors.text }}>{selectedGroup.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Capacity</div>
                  <div style={{ fontSize: '16px', color: colors.text }}>{selectedGroup.members} / {selectedGroup.maxMembers || '∞'} members</div>
                </div>
              </div>
            )}
            
            {activeTab === 'members' && (
              <div style={{ padding: '20px' }}>
                {selectedGroup.membersList.map((member, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: `1px solid rgba(255,255,255,0.03)`,
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, #4a4035 0%, #3a332d 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: colors.goldLight,
                    }}>{member.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: colors.text }}>{member.name}</span>
                        {member.badge && (
                          <span style={{
                            fontSize: '10px',
                            color: member.badge === 'Founding Member' ? colors.goldLight : '#a8c5b8',
                            background: member.badge === 'Founding Member' ? 'rgba(212, 175, 55, 0.15)' : `rgba(45, 74, 62, 0.4)`,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}>{member.badge}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>{member.role} · {member.joined}</div>
                    </div>
                    <button style={{
                      background: 'none',
                      border: `1px solid ${colors.border}`,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      fontFamily: '"Crimson Pro", Georgia, serif',
                    }}>Message</button>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'chat' && (
              <>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '300px' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{
                      display: 'flex',
                      flexDirection: msg.user === 'You' ? 'row-reverse' : 'row',
                      gap: '10px',
                      alignItems: 'flex-end',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, #4a4035 0%, #3a332d 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        color: colors.goldLight,
                      }}>{msg.avatar}</div>
                      <div style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        background: msg.user === 'You'
                          ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`
                          : 'rgba(255,255,255,0.05)',
                        borderRadius: msg.user === 'You' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        color: msg.user === 'You' ? colors.bg : colors.text,
                      }}>
                        {msg.user !== 'You' && (
                          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.gold }}>{msg.user}</div>
                        )}
                        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</div>
                        <div style={{ fontSize: '11px', marginTop: '4px', color: msg.user === 'You' ? 'rgba(26,21,18,0.6)' : colors.textDark }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px 20px',
                  borderTop: `1px solid ${colors.border}`,
                  background: 'rgba(20, 17, 16, 0.8)',
                }}>
                  <input
                    className="input"
                    style={{ flex: 1, borderRadius: '24px', padding: '12px 16px' }}
                    placeholder="Message the crew..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                    onClick={sendMessage}
                  >→</button>
                </div>
              </>
            )}
          </div>
          
          <BottomNav active="home" onNavigate={setCurrentScreen} />
          {showPaymentModal && <PaymentModal group={selectedGroup} onClose={() => setShowPaymentModal(false)} />}
          {showPremiumModal && <PremiumModal />}
        </div>
      </div>
    );
  }

  // HOME SCREEN (default)
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={{ paddingBottom: '100px' }}>
          <div style={{
            padding: '24px 20px',
            background: `linear-gradient(180deg, rgba(30, 25, 21, 1) 0%, rgba(30, 25, 21, 0) 100%)`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '24px', fontWeight: '700', color: colors.goldLight, letterSpacing: '1px' }}>
                ForgeCrew
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={() => setShowNotifications(true)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🔔</span>
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '10px',
                    height: '10px',
                    background: '#e74c3c',
                    borderRadius: '50%',
                    border: `2px solid ${colors.bgLight}`,
                  }} />
                </button>
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
                  {userName ? userName[0].toUpperCase() : 'G'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '4px' }}>Welcome back,</p>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '22px', color: '#f4e8d9' }}>
              {userName || 'Guest'}
            </h2>
          </div>
          
          {!isPremium && (
            <div 
              onClick={() => setShowPremiumModal(true)}
              style={{
                margin: '0 20px 20px',
                padding: '16px 20px',
                background: `linear-gradient(135deg, rgba(184, 134, 80, 0.15) 0%, rgba(139, 98, 56, 0.1) 100%)`,
                border: `1px solid ${colors.gold}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '24px' }}>⚜</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.goldLight, fontWeight: '600', marginBottom: '2px' }}>Unlock Unlimited Crews</div>
                <div style={{ fontSize: '13px', color: colors.textMuted }}>{3 - joinedCrews.length} free joins remaining</div>
              </div>
              <span style={{ color: colors.gold }}>→</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: colors.gold }}>
              Recommended Crews
            </span>
            <span style={{ fontSize: '13px', color: colors.textMuted, cursor: 'pointer' }}>View All</span>
          </div>
          
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => {
                setSelectedGroup(group);
                setActiveTab('about');
                setCurrentScreen('group-detail');
              }}
              className="card"
              style={{ margin: '0 20px 16px', padding: '20px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '18px', fontWeight: '600', color: '#f4e8d9' }}>
                      {group.name}
                    </h3>
                    {group.verified && <span style={{ color: colors.gold, fontSize: '14px' }}>✓</span>}
                    {group.featured && <span style={{ fontSize: '12px' }}>⭐</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase' }}>{group.category}</p>
                </div>
                <span style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  background: 'rgba(184, 134, 80, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                }}>{group.members} members</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.textMuted }}>
                <span>📍 {group.location}</span>
                <span>📅 {group.nextEvent}</span>
              </div>
              {group.sponsor && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: `1px solid ${colors.border}`,
                  fontSize: '12px',
                  color: colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>{group.sponsor.logo}</span>
                  <span>Sponsored by {group.sponsor.name}</span>
                </div>
              )}
            </div>
          ))}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '16px', marginTop: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: colors.gold }}>
              Start a Crew
            </span>
          </div>
          
          <div 
            onClick={() => !isPremium && setShowPremiumModal(true)}
            style={{
              margin: '0 20px 16px',
              padding: '24px 20px',
              background: colors.bgCard,
              border: `1px dashed ${colors.borderLight}`,
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
            <div style={{ color: colors.gold, fontSize: '14px', letterSpacing: '1px' }}>Create New Crew</div>
            <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
              {isPremium ? 'Start something in your area' : 'Premium feature · Upgrade to create'}
            </div>
          </div>
        </div>
        
        <BottomNav active="home" onNavigate={setCurrentScreen} />
        {showPremiumModal && <PremiumModal />}
        <NotificationsPanel />
      </div>
    </div>
  );
}
