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

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
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
const BottomNav = ({ active, onNavigate, pendingCount = 0 }) => (
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
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '22px', position: 'relative' }}>
          {item.icon}
          {item.id === 'profile' && pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-8px',
              background: '#e74c3c',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, sans-serif',
            }}>
              {pendingCount}
            </span>
          )}
        </span>
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
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Photo and social state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  // App state
  const [joinedCrews, setJoinedCrews] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [suggestedCrews, setSuggestedCrews] = useState([]);
  
  // Real crews state
  const [realCrews, setRealCrews] = useState([]);
  const [myCrews, setMyCrews] = useState([]);
  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewDescription, setNewCrewDescription] = useState('');
  const [newCrewCategory, setNewCrewCategory] = useState('');
  const [selectedCrew, setSelectedCrew] = useState(null);
  
  // Events state
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventCrewId, setNewEventCrewId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Friends state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Block/Report state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUser, setReportingUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

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
        // Fetch friends data
        fetchFriends(userId);
        // Fetch crews
        fetchCrews(userId, data);
        // Fetch events
        fetchEvents(userId);
        // Fetch blocked users
        fetchBlockedUsers(userId);
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
        const userRadius = currentProfile.radius_miles || 25;
        
        // Score and sort users by match quality
        const scoredUsers = allUsers.map(otherUser => {
          // Calculate distance if both users have GPS coordinates
          let distance = null;
          let withinRadius = false;
          
          if (currentProfile.latitude && currentProfile.longitude && 
              otherUser.latitude && otherUser.longitude) {
            distance = calculateDistance(
              currentProfile.latitude, currentProfile.longitude,
              otherUser.latitude, otherUser.longitude
            );
            withinRadius = distance !== null && distance <= userRadius;
          }
          
          // Fall back to city name matching if no GPS
          const locationMatch = withinRadius || locationsMatch(currentProfile.location, otherUser.location);
          const interestScore = calculateMatchScore(currentProfile.interests, otherUser.interests);
          const sharedInterests = currentProfile.interests?.filter(i => 
            otherUser.interests?.includes(i)
          ) || [];
          
          return {
            ...otherUser,
            locationMatch,
            distance,
            withinRadius,
            interestScore,
            sharedInterests,
            totalScore: (locationMatch ? 10 : 0) + interestScore
          };
        });
        
        // Sort by total score (highest first) and filter out zero matches and blocked users
        const sortedUsers = scoredUsers
          .filter(u => u.totalScore > 0 && !blockedUsers.includes(u.id))
          .sort((a, b) => b.totalScore - a.totalScore);
        
        setNearbyUsers(sortedUsers);
        
        // Generate suggested crews based on shared interests
        generateSuggestedCrews(currentProfile, allUsers);
      } else {
        // No other users yet, but still generate suggestions based on user's interests
        generateSuggestedCrews(currentProfile, []);
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  // Generate crew suggestions based on interest overlap
  const generateSuggestedCrews = (currentProfile, allUsers) => {
    if (!currentProfile?.interests) return;
    
    const userRadius = currentProfile.radius_miles || 25;
    const suggestions = [];
    
    // For each of the user's interests, count how many nearby people share it
    currentProfile.interests.forEach(interestId => {
      const interest = interestOptions.find(i => i.id === interestId);
      if (!interest) return;
      
      // Find users within radius with this interest
      const matchingUsers = allUsers.filter(u => {
        // Check if within radius using GPS or city match
        let isNearby = false;
        if (currentProfile.latitude && currentProfile.longitude && u.latitude && u.longitude) {
          const dist = calculateDistance(currentProfile.latitude, currentProfile.longitude, u.latitude, u.longitude);
          isNearby = dist !== null && dist <= userRadius;
        } else {
          isNearby = locationsMatch(currentProfile.location, u.location);
        }
        return isNearby && u.interests?.includes(interestId);
      });
      
      // Get city name for the crew suggestion
      const city = currentProfile.location?.split(',')[0]?.trim() || 'Local';
      
      suggestions.push({
        id: interestId,
        interest: interest,
        interestId: interestId,
        name: `${city} ${interest.name}`,
        icon: interest.icon,
        matchCount: matchingUsers.length,
        matchingUsers: matchingUsers.slice(0, 5), // Show up to 5 matching users
        category: interest.name,
      });
    });
    
    // Sort by match count (most matches first)
    suggestions.sort((a, b) => b.matchCount - a.matchCount);
    
    setSuggestedCrews(suggestions);
  };

  // Fetch friends and friend requests
  const fetchFriends = async (userId) => {
    try {
      // Get all friendships involving this user
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
      
      if (error) throw error;
      
      if (friendships) {
        // Separate into categories
        const accepted = [];
        const pending = [];
        const sent = [];
        
        for (const f of friendships) {
          if (f.status === 'accepted') {
            // Get the other person's ID
            const friendId = f.requester_id === userId ? f.recipient_id : f.requester_id;
            accepted.push(friendId);
          } else if (f.status === 'pending') {
            if (f.recipient_id === userId) {
              // Someone sent us a request
              pending.push(f);
            } else {
              // We sent a request
              sent.push(f.recipient_id);
            }
          }
        }
        
        setFriends(accepted);
        setPendingRequests(pending);
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  // Send friend request
  const sendFriendRequest = async (recipientId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Update local state
      setSentRequests(prev => [...prev, recipientId]);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requesterId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setPendingRequests(prev => prev.filter(r => r.requester_id !== requesterId));
      setFriends(prev => [...prev, requesterId]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Decline friend request
  const declineFriendRequest = async (requesterId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setPendingRequests(prev => prev.filter(r => r.requester_id !== requesterId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Check friendship status with a user
  const getFriendshipStatus = (otherUserId) => {
    if (friends.includes(otherUserId)) return 'friends';
    if (sentRequests.includes(otherUserId)) return 'pending_sent';
    if (pendingRequests.find(r => r.requester_id === otherUserId)) return 'pending_received';
    return 'none';
  };

  // Fetch all crews and user's memberships
  const fetchCrews = async (userId, currentProfile) => {
    try {
      // Fetch all public crews
      const { data: crews, error: crewsError } = await supabase
        .from('crews')
        .select('*')
        .eq('is_public', true);
      
      if (crewsError) throw crewsError;
      
      // Fetch user's crew memberships
      const { data: memberships, error: memberError } = await supabase
        .from('crew_members')
        .select('crew_id')
        .eq('user_id', userId);
      
      if (memberError) throw memberError;
      
      const memberCrewIds = memberships?.map(m => m.crew_id) || [];
      
      // Add member count and membership status to each crew
      if (crews) {
        const crewsWithData = await Promise.all(crews.map(async (crew) => {
          const { count } = await supabase
            .from('crew_members')
            .select('*', { count: 'exact', head: true })
            .eq('crew_id', crew.id);
          
          // Calculate distance if GPS available
          let distance = null;
          if (currentProfile?.latitude && currentProfile?.longitude && crew.latitude && crew.longitude) {
            distance = calculateDistance(
              currentProfile.latitude, currentProfile.longitude,
              crew.latitude, crew.longitude
            );
          }
          
          return {
            ...crew,
            memberCount: count || 0,
            isMember: memberCrewIds.includes(crew.id),
            distance
          };
        }));
        
        setRealCrews(crewsWithData);
        setMyCrews(crewsWithData.filter(c => c.isMember));
      }
    } catch (error) {
      console.error('Error fetching crews:', error);
    }
  };

  // Create a new crew
  const createCrew = async () => {
    if (!user || !newCrewName || !newCrewCategory) return;
    
    try {
      const { data: crew, error } = await supabase
        .from('crews')
        .insert({
          name: newCrewName,
          description: newCrewDescription,
          category: newCrewCategory,
          creator_id: user.id,
          location: profile?.location,
          latitude: profile?.latitude,
          longitude: profile?.longitude,
          is_public: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-join the crew as creator
      await supabase
        .from('crew_members')
        .insert({
          crew_id: crew.id,
          user_id: user.id,
          role: 'creator'
        });
      
      // Reset form and refresh
      setNewCrewName('');
      setNewCrewDescription('');
      setNewCrewCategory('');
      setShowCreateCrew(false);
      fetchCrews(user.id, profile);
    } catch (error) {
      console.error('Error creating crew:', error);
      alert('Error creating crew. Please try again.');
    }
  };

  // Join a crew
  const joinCrew = async (crewId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('crew_members')
        .insert({
          crew_id: crewId,
          user_id: user.id,
          role: 'member'
        });
      
      if (error) throw error;
      
      fetchCrews(user.id, profile);
    } catch (error) {
      console.error('Error joining crew:', error);
    }
  };

  // Leave a crew
  const leaveCrew = async (crewId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('crew_id', crewId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSelectedCrew(null);
      fetchCrews(user.id, profile);
    } catch (error) {
      console.error('Error leaving crew:', error);
    }
  };

  // Fetch events for user's crews
  const fetchEvents = async (userId) => {
    try {
      // Get user's crew memberships
      const { data: memberships } = await supabase
        .from('crew_members')
        .select('crew_id')
        .eq('user_id', userId);
      
      if (!memberships || memberships.length === 0) {
        setEvents([]);
        return;
      }
      
      const crewIds = memberships.map(m => m.crew_id);
      
      // Fetch events for those crews
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .in('crew_id', crewIds)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      // Add attendee count and user's RSVP status
      if (eventsData) {
        const eventsWithData = await Promise.all(eventsData.map(async (event) => {
          const { count } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          
          const { data: userRsvp } = await supabase
            .from('event_attendees')
            .select('status')
            .eq('event_id', event.id)
            .eq('user_id', userId)
            .single();
          
          // Get crew name
          const crew = myCrews.find(c => c.id === event.crew_id) || realCrews.find(c => c.id === event.crew_id);
          
          return {
            ...event,
            attendeeCount: count || 0,
            userRsvp: userRsvp?.status || null,
            crewName: crew?.name || 'Unknown Crew'
          };
        }));
        
        setEvents(eventsWithData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Create a new event
  const createEvent = async () => {
    if (!user || !newEventTitle || !newEventDate || !newEventTime || !newEventCrewId) return;
    
    try {
      const eventDateTime = new Date(`${newEventDate}T${newEventTime}`);
      
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          crew_id: newEventCrewId,
          creator_id: user.id,
          title: newEventTitle,
          description: newEventDescription,
          location: newEventLocation,
          event_date: eventDateTime.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-RSVP creator as going
      await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'going'
        });
      
      // Reset form and refresh
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventLocation('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventCrewId(null);
      setShowCreateEvent(false);
      fetchEvents(user.id);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  // RSVP to event
  const rsvpToEvent = async (eventId, status) => {
    if (!user) return;
    
    try {
      // Check if already RSVPed
      const { data: existing } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      if (existing) {
        // Update existing RSVP
        await supabase
          .from('event_attendees')
          .update({ status })
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        // Create new RSVP
        await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          });
      }
      
      fetchEvents(user.id);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  // Cancel RSVP
  const cancelRsvp = async (eventId) => {
    if (!user) return;
    
    try {
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      fetchEvents(user.id);
    } catch (error) {
      console.error('Error canceling RSVP:', error);
    }
  };

  // Fetch blocked users
  const fetchBlockedUsers = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', userId);
      
      if (error) throw error;
      
      setBlockedUsers(data?.map(b => b.blocked_id) || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  // Block a user
  const blockUser = async (blockedId) => {
    if (!user) return;
    
    try {
      await supabase
        .from('blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedId
        });
      
      // Also remove any friendship
      await supabase
        .from('friends')
        .delete()
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${blockedId}),and(requester_id.eq.${blockedId},recipient_id.eq.${user.id})`);
      
      setBlockedUsers(prev => [...prev, blockedId]);
      // Refresh nearby users to hide blocked user
      fetchNearbyUsers(profile);
      fetchFriends(user.id);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Unblock a user
  const unblockUser = async (blockedId) => {
    if (!user) return;
    
    try {
      await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);
      
      setBlockedUsers(prev => prev.filter(id => id !== blockedId));
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  // Report a user
  const reportUser = async () => {
    if (!user || !reportingUser || !reportReason) return;
    
    try {
      await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportingUser.id,
          reason: reportReason,
          description: reportDescription
        });
      
      // Reset and close modal
      setShowReportModal(false);
      setReportingUser(null);
      setReportReason('');
      setReportDescription('');
      
      alert('Report submitted. Thank you for helping keep ForgeCrew safe.');
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  // Check if user is blocked
  const isUserBlocked = (userId) => {
    return blockedUsers.includes(userId);
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
    setUploadingPhoto(true);

    try {
      let photoUrl = null;
      
      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, photoFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }
      
      // Check if verified (has photo AND at least one social link)
      const isVerified = !!(photoUrl && (instagram || linkedin));
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: onboardingName,
          location: onboardingLocation,
          interests: selectedInterests,
          latitude: userLatitude,
          longitude: userLongitude,
          radius_miles: radiusMiles,
          photo_url: photoUrl,
          instagram: instagram || null,
          linkedin: linkedin || null,
          is_verified: isVerified,
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
        latitude: userLatitude,
        longitude: userLongitude,
        radius_miles: radiusMiles,
        photo_url: photoUrl,
        instagram: instagram,
        linkedin: linkedin,
        is_verified: isVerified,
      });
      
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get user's GPS location
  const getUserLocation = () => {
    setGettingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLatitude(lat);
        setUserLongitude(lon);
        
        // Try to get city name from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          if (city && state) {
            setOnboardingLocation(`${city}, ${state}`);
          } else if (city) {
            setOnboardingLocation(city);
          }
        } catch (e) {
          console.log('Reverse geocoding failed:', e);
        }
        
        setGettingLocation(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enter it manually.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
              style={{ width: '100%', maxWidth: '280px', marginBottom: '24px' }}
              onClick={() => { setAuthMode('login'); setCurrentScreen('auth'); }}
            >
              I Have an Account
            </button>
            
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <button
                onClick={() => setCurrentScreen('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textDark,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
              >
                Terms of Service
              </button>
              <button
                onClick={() => setCurrentScreen('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textDark,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TERMS OF SERVICE SCREEN
  if (currentScreen === 'terms') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '24px', minHeight: '100vh' }}>
            <button 
              onClick={() => setCurrentScreen('splash')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.gold,
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '24px',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              ← Back
            </button>
            
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              color: '#f4e8d9',
              marginBottom: '24px',
            }}>
              Terms of Service
            </h1>
            
            <div style={{ color: colors.textMuted, fontSize: '14px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '16px' }}><strong style={{ color: colors.text }}>Last updated:</strong> January 2026</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>1. Acceptance of Terms</h3>
              <p style={{ marginBottom: '16px' }}>By accessing or using ForgeCrew, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>2. Eligibility</h3>
              <p style={{ marginBottom: '16px' }}>You must be at least 21 years old to use ForgeCrew. By using this service, you represent that you meet this age requirement.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>3. User Conduct</h3>
              <p style={{ marginBottom: '8px' }}>You agree not to:</p>
              <p style={{ marginBottom: '4px' }}>• Harass, bully, or intimidate other users</p>
              <p style={{ marginBottom: '4px' }}>• Post false, misleading, or fraudulent information</p>
              <p style={{ marginBottom: '4px' }}>• Use the service for illegal activities</p>
              <p style={{ marginBottom: '4px' }}>• Impersonate others or create fake profiles</p>
              <p style={{ marginBottom: '16px' }}>• Share other users' personal information without consent</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>4. Account Termination</h3>
              <p style={{ marginBottom: '16px' }}>We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>5. Content Ownership</h3>
              <p style={{ marginBottom: '16px' }}>You retain ownership of content you post. By posting content, you grant ForgeCrew a license to use, display, and distribute that content within the service.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>6. Disclaimer</h3>
              <p style={{ marginBottom: '16px' }}>ForgeCrew is provided "as is" without warranties of any kind. We do not guarantee the accuracy of user profiles or the safety of in-person meetups. Always exercise caution when meeting people from the internet.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>7. Limitation of Liability</h3>
              <p style={{ marginBottom: '16px' }}>ForgeCrew shall not be liable for any damages arising from your use of the service, including but not limited to interactions with other users.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>8. Changes to Terms</h3>
              <p style={{ marginBottom: '16px' }}>We may update these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>9. Contact</h3>
              <p style={{ marginBottom: '40px' }}>Questions about these terms? Contact us at support@forgecrew.app</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRIVACY POLICY SCREEN
  if (currentScreen === 'privacy') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '24px', minHeight: '100vh' }}>
            <button 
              onClick={() => setCurrentScreen('splash')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.gold,
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '24px',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              ← Back
            </button>
            
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              color: '#f4e8d9',
              marginBottom: '24px',
            }}>
              Privacy Policy
            </h1>
            
            <div style={{ color: colors.textMuted, fontSize: '14px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '16px' }}><strong style={{ color: colors.text }}>Last updated:</strong> January 2026</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>1. Information We Collect</h3>
              <p style={{ marginBottom: '8px' }}>We collect information you provide directly:</p>
              <p style={{ marginBottom: '4px' }}>• Account information (email, name)</p>
              <p style={{ marginBottom: '4px' }}>• Profile information (photo, location, interests)</p>
              <p style={{ marginBottom: '4px' }}>• Social media links (optional)</p>
              <p style={{ marginBottom: '16px' }}>• Location data (with your permission)</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>2. How We Use Your Information</h3>
              <p style={{ marginBottom: '8px' }}>We use your information to:</p>
              <p style={{ marginBottom: '4px' }}>• Provide and improve the service</p>
              <p style={{ marginBottom: '4px' }}>• Match you with nearby users who share your interests</p>
              <p style={{ marginBottom: '4px' }}>• Send notifications about events and friend requests</p>
              <p style={{ marginBottom: '16px' }}>• Ensure safety and prevent abuse</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>3. Information Sharing</h3>
              <p style={{ marginBottom: '8px' }}>Your profile information is visible to other users, including:</p>
              <p style={{ marginBottom: '4px' }}>• Name and profile photo</p>
              <p style={{ marginBottom: '4px' }}>• General location (city/area)</p>
              <p style={{ marginBottom: '4px' }}>• Interests and crew memberships</p>
              <p style={{ marginBottom: '16px' }}>We do not sell your personal information to third parties.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>4. Location Data</h3>
              <p style={{ marginBottom: '16px' }}>If you enable location services, we use your GPS coordinates to find nearby users and events. This data is used only for matching purposes and is not shared with other users (they see your city, not your exact location).</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>5. Data Security</h3>
              <p style={{ marginBottom: '16px' }}>We use industry-standard security measures to protect your data, including encryption and secure servers. However, no method of transmission over the internet is 100% secure.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>6. Data Retention</h3>
              <p style={{ marginBottom: '16px' }}>We retain your data for as long as your account is active. You can request deletion of your account and data at any time.</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>7. Your Rights</h3>
              <p style={{ marginBottom: '8px' }}>You have the right to:</p>
              <p style={{ marginBottom: '4px' }}>• Access your personal data</p>
              <p style={{ marginBottom: '4px' }}>• Correct inaccurate data</p>
              <p style={{ marginBottom: '4px' }}>• Delete your account and data</p>
              <p style={{ marginBottom: '16px' }}>• Opt out of location tracking</p>
              
              <h3 style={{ color: colors.gold, fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>8. Contact</h3>
              <p style={{ marginBottom: '40px' }}>Privacy questions? Contact us at privacy@forgecrew.app</p>
            </div>
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
                style={{ marginBottom: '16px' }}
              />
              
              {authMode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '13px',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              {authMode === 'signup' && <div style={{ marginBottom: '24px' }} />}
              
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

  // FORGOT PASSWORD SCREEN
  if (currentScreen === 'forgot-password') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <button 
              onClick={() => setCurrentScreen('auth')}
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
              ← Back to Sign In
            </button>
            
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#f4e8d9',
            }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setAuthError('');
              
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                
                if (error) throw error;
                
                alert('Check your email for the password reset link!');
                setCurrentScreen('auth');
              } catch (error) {
                setAuthError(error.message);
              } finally {
                setAuthLoading(false);
              }
            }}>
              <input
                className="input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                {authLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
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
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '24px' }}>
              We'll find crews and events near you.
            </p>
            
            {/* GPS Location Button */}
            <button
              onClick={getUserLocation}
              disabled={gettingLocation}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '16px',
                background: userLatitude ? 'rgba(45, 74, 62, 0.3)' : 'rgba(45, 74, 62, 0.15)',
                border: userLatitude ? '1px solid rgba(45, 74, 62, 0.5)' : '1px solid rgba(45, 74, 62, 0.3)',
                borderRadius: '8px',
                color: colors.text,
                fontSize: '15px',
                cursor: gettingLocation ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              <span style={{ fontSize: '20px' }}>{userLatitude ? '✓' : '📍'}</span>
              {gettingLocation ? 'Getting location...' : userLatitude ? 'Location detected!' : 'Use my current location'}
            </button>
            
            {locationError && (
              <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '12px' }}>{locationError}</p>
            )}
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px',
              color: colors.textMuted,
              fontSize: '13px',
            }}>
              <div style={{ flex: 1, height: '1px', background: colors.border }} />
              <span>or enter manually</span>
              <div style={{ flex: 1, height: '1px', background: colors.border }} />
            </div>
            
            <input
              className="input"
              type="text"
              placeholder="City, State (e.g., Detroit, MI)"
              value={onboardingLocation}
              onChange={(e) => setOnboardingLocation(e.target.value)}
              style={{ marginBottom: '24px' }}
            />
            
            {/* Radius Selector */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '12px' }}>
                Search radius: <span style={{ color: colors.gold, fontWeight: '600' }}>{radiusMiles} miles</span>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[10, 25, 50, 100].map(miles => (
                  <button
                    key={miles}
                    onClick={() => setRadiusMiles(miles)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      background: radiusMiles === miles 
                        ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`
                        : 'rgba(255,255,255,0.03)',
                      border: radiusMiles === miles 
                        ? 'none'
                        : `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: radiusMiles === miles ? colors.bg : colors.textMuted,
                      fontSize: '14px',
                      fontWeight: radiusMiles === miles ? '600' : '400',
                      cursor: 'pointer',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    {miles} mi
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: (onboardingLocation || userLatitude) ? 1 : 0.5 }}
              onClick={() => (onboardingLocation || userLatitude) && setCurrentScreen('onboarding-interests')}
              disabled={!onboardingLocation && !userLatitude}
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
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
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
              onClick={() => selectedInterests.length && setCurrentScreen('onboarding-photo')}
              disabled={!selectedInterests.length}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING - PHOTO & VERIFICATION
  if (currentScreen === 'onboarding-photo') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: colors.borderLight }} />
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
              Verify your profile
            </h2>
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              Add a photo and social link to get verified. This helps build trust in the community.
            </p>
            
            {/* Photo Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: colors.gold, 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                marginBottom: '12px' 
              }}>
                Profile Photo
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: photoPreview 
                    ? `url(${photoPreview}) center/cover`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                }}>
                  {!photoPreview && '📷'}
                </div>
                <label style={{
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}>
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
            {/* Social Links */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: colors.gold, 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                marginBottom: '12px' 
              }}>
                Social Links (at least one for verification)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Instagram username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💼</span>
                <input
                  className="input"
                  type="text"
                  placeholder="LinkedIn profile URL"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            {/* Verification badge preview */}
            {photoPreview && (instagram || linkedin) && (
              <div style={{
                padding: '16px',
                background: 'rgba(45, 74, 62, 0.2)',
                border: '1px solid rgba(45, 74, 62, 0.4)',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '24px' }}>✓</span>
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                    You'll be verified!
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '13px' }}>
                    Other members will see a verified badge on your profile.
                  </p>
                </div>
              </div>
            )}
            
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: uploadingPhoto ? 0.7 : 1 }}
              onClick={saveProfile}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Saving...' : 'Find My Crews'}
            </button>
            
            <button 
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={saveProfile}
              disabled={uploadingPhoto}
            >
              Skip for now
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
            
            {/* Suggested Crews Section */}
            {suggestedCrews.length > 0 && (
              <>
                <div style={{ padding: '0 20px', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: colors.gold,
                  }}>
                    Start a Crew
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  padding: '0 20px 20px',
                  gap: '12px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}>
                  {suggestedCrews.slice(0, 4).map(suggestion => (
                    <div 
                      key={suggestion.id}
                      onClick={() => {
                        setNewCrewName(suggestion.name);
                        setNewCrewCategory(suggestion.category);
                        setShowCreateCrew(true);
                      }}
                      style={{
                        minWidth: '200px',
                        padding: '20px',
                        background: suggestion.matchCount > 0 
                          ? 'linear-gradient(135deg, rgba(45, 74, 62, 0.3) 0%, rgba(45, 74, 62, 0.1) 100%)'
                          : 'rgba(255,255,255,0.02)',
                        border: suggestion.matchCount > 0 
                          ? '1px solid rgba(45, 74, 62, 0.4)'
                          : `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{suggestion.icon}</div>
                      <h3 style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#f4e8d9',
                        marginBottom: '8px',
                      }}>
                        {suggestion.name}
                      </h3>
                      {suggestion.matchCount > 0 ? (
                        <p style={{ 
                          fontSize: '13px', 
                          color: colors.accentLight,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span style={{ fontSize: '16px' }}>👥</span>
                          {suggestion.matchCount} {suggestion.matchCount === 1 ? 'person' : 'people'} nearby
                        </p>
                      ) : (
                        <p style={{ fontSize: '13px', color: colors.textMuted }}>
                          Be the first to start this crew
                        </p>
                      )}
                      <button style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: suggestion.matchCount > 0 
                          ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`
                          : 'transparent',
                        border: suggestion.matchCount > 0 
                          ? 'none'
                          : `1px solid ${colors.borderLight}`,
                        borderRadius: '6px',
                        color: suggestion.matchCount > 0 ? colors.bg : colors.textMuted,
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                      }}>
                        {suggestion.matchCount > 0 ? 'Start Crew' : 'Create'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Upcoming Events Section */}
            {events.length > 0 && (
              <>
                <div style={{ padding: '0 20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: colors.gold,
                    }}>
                      Upcoming Events
                    </span>
                    {myCrews.length > 0 && (
                      <button
                        onClick={() => setShowCreateEvent(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.gold,
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                        }}
                      >
                        + Create Event
                      </button>
                    )}
                  </div>
                </div>
                
                {events.slice(0, 3).map(event => {
                  const eventDate = new Date(event.event_date);
                  return (
                    <div 
                      key={event.id}
                      className="card"
                      onClick={() => setSelectedEvent(event)}
                      style={{ margin: '0 20px 12px', padding: '16px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                          width: '50px',
                          textAlign: 'center',
                          padding: '8px',
                          background: 'rgba(212, 175, 55, 0.1)',
                          borderRadius: '8px',
                        }}>
                          <div style={{ fontSize: '11px', color: colors.gold, textTransform: 'uppercase' }}>
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.text }}>
                            {eventDate.getDate()}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#f4e8d9',
                            marginBottom: '4px',
                          }}>
                            {event.title}
                          </h3>
                          <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>
                            {event.crewName}
                          </p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: colors.textMuted }}>
                            <span>🕐 {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            {event.location && <span>📍 {event.location}</span>}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '4px',
                        }}>
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>
                            {event.attendeeCount} going
                          </span>
                          {event.userRsvp === 'going' && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: colors.gold,
                              background: 'rgba(212, 175, 55, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}>✓ Going</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            {/* Create Event Button (if no events but has crews) */}
            {events.length === 0 && myCrews.length > 0 && (
              <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <button
                  onClick={() => setShowCreateEvent(true)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(45, 74, 62, 0.15)',
                    border: '1px solid rgba(45, 74, 62, 0.3)',
                    borderRadius: '12px',
                    color: colors.text,
                    fontSize: '15px',
                    cursor: 'pointer',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📅</span>
                  Create your first event
                </button>
              </div>
            )}
            
            {/* My Crews Section */}
            {myCrews.length > 0 && (
              <>
                <div style={{ padding: '0 20px', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: colors.gold,
                  }}>
                    My Crews
                  </span>
                </div>
                
                {myCrews.map(crew => (
                  <div 
                    key={crew.id}
                    className="card"
                    onClick={() => setSelectedCrew(crew)}
                    style={{ margin: '0 20px 12px', padding: '16px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#f4e8d9',
                          marginBottom: '4px',
                        }}>
                          {crew.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {crew.category}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        background: 'rgba(45, 74, 62, 0.2)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                      }}>
                        {crew.memberCount} members
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Nearby Crews Section */}
            {realCrews.filter(c => !c.isMember).length > 0 && (
              <>
                <div style={{ padding: '0 20px', marginBottom: '16px', marginTop: '24px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: colors.gold,
                  }}>
                    Crews Near You
                  </span>
                </div>
                
                {realCrews.filter(c => !c.isMember).map(crew => (
                  <div 
                    key={crew.id}
                    className="card"
                    style={{ margin: '0 20px 12px', padding: '16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#f4e8d9',
                          marginBottom: '4px',
                        }}>
                          {crew.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {crew.category}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: colors.textMuted }}>
                          <span>👥 {crew.memberCount} members</span>
                          {crew.distance && <span>📍 {crew.distance} mi</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => joinCrew(crew.id)}
                        style={{
                          padding: '8px 16px',
                          background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                          border: 'none',
                          borderRadius: '6px',
                          color: colors.bg,
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                        }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Crews section */}
            
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
              nearbyUsers.map(person => {
                const friendStatus = getFriendshipStatus(person.id);
                return (
                <div 
                  key={person.id}
                  className="card"
                  style={{ margin: '0 20px 12px', padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: person.photo_url 
                        ? `url(${person.photo_url}) center/cover`
                        : friendStatus === 'friends' 
                          ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`
                          : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: friendStatus === 'friends' ? colors.bg : colors.text,
                      border: person.is_verified ? `2px solid ${colors.gold}` : 'none',
                    }}>
                      {!person.photo_url && (person.name?.[0]?.toUpperCase() || '?')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#f4e8d9',
                        }}>
                          {person.name}
                        </h3>
                        {person.is_verified && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: colors.gold,
                            background: 'rgba(212, 175, 55, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}>✓ Verified</span>
                        )}
                        {friendStatus === 'friends' && (
                          <span style={{ fontSize: '12px', color: colors.gold }}>• Friends</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {person.locationMatch && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: colors.accent,
                            background: 'rgba(45, 74, 62, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                          }}>
                            📍 {person.distance ? `${person.distance} mi away` : person.location}
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {/* Friend action button */}
                      {friendStatus === 'none' && (
                        <button
                          onClick={() => sendFriendRequest(person.id)}
                          style={{
                            padding: '8px 12px',
                            background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                            border: 'none',
                            borderRadius: '6px',
                            color: colors.bg,
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: '"Cormorant Garamond", Georgia, serif',
                          }}
                        >
                          + Add
                        </button>
                      )}
                      {friendStatus === 'pending_sent' && (
                        <span style={{
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          color: colors.textMuted,
                          fontSize: '11px',
                        }}>
                          Pending
                        </span>
                      )}
                      {friendStatus === 'friends' && (
                        <span style={{
                          fontSize: '11px',
                          color: colors.gold,
                          background: 'rgba(212, 175, 55, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                        }}>
                          {person.interestScore} match{person.interestScore !== 1 ? 'es' : ''}
                        </span>
                      )}
                      {/* Report/Block button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingUser(person);
                          setShowReportModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.textDark,
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        ⋯
                      </button>
                    </div>
                  </div>
                </div>
              )})
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
          
          {/* Create Crew Modal */}
          {showCreateCrew && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}>
              <div style={{
                background: colors.bgLight,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                border: `1px solid ${colors.border}`,
              }}>
                <h2 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '24px',
                  color: '#f4e8d9',
                  marginBottom: '20px',
                }}>
                  Create a Crew
                </h2>
                
                <input
                  className="input"
                  type="text"
                  placeholder="Crew name"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                
                <select
                  value={newCrewCategory}
                  onChange={(e) => setNewCrewCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: newCrewCategory ? colors.text : colors.textDark,
                    fontSize: '16px',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  <option value="">Select category</option>
                  {interestOptions.map(opt => (
                    <option key={opt.id} value={opt.name}>{opt.icon} {opt.name}</option>
                  ))}
                </select>
                
                <textarea
                  className="input"
                  placeholder="Description (optional)"
                  value={newCrewDescription}
                  onChange={(e) => setNewCrewDescription(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '20px', resize: 'none' }}
                />
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateCrew(false);
                      setNewCrewName('');
                      setNewCrewDescription('');
                      setNewCrewCategory('');
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={createCrew}
                    disabled={!newCrewName || !newCrewCategory}
                    style={{ flex: 1, opacity: (!newCrewName || !newCrewCategory) ? 0.5 : 1 }}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Crew Detail Modal */}
          {selectedCrew && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}>
              <div style={{
                background: colors.bgLight,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                border: `1px solid ${colors.border}`,
              }}>
                <h2 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '24px',
                  color: '#f4e8d9',
                  marginBottom: '8px',
                }}>
                  {selectedCrew.name}
                </h2>
                <p style={{ fontSize: '12px', color: colors.gold, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
                  {selectedCrew.category}
                </p>
                
                {selectedCrew.description && (
                  <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>
                    {selectedCrew.description}
                  </p>
                )}
                
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted, fontSize: '14px' }}>
                    <span>👥 {selectedCrew.memberCount} members</span>
                    {selectedCrew.location && <span>📍 {selectedCrew.location}</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedCrew(null)}
                    style={{ flex: 1 }}
                  >
                    Close
                  </button>
                  {selectedCrew.isMember && (
                    <button
                      onClick={() => leaveCrew(selectedCrew.id)}
                      style={{
                        flex: 1,
                        padding: '14px 28px',
                        background: 'rgba(231, 76, 60, 0.2)',
                        border: '1px solid rgba(231, 76, 60, 0.4)',
                        borderRadius: '6px',
                        color: '#e74c3c',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                      }}
                    >
                      Leave Crew
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Create Event Modal */}
          {showCreateEvent && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}>
              <div style={{
                background: colors.bgLight,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                border: `1px solid ${colors.border}`,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}>
                <h2 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '24px',
                  color: '#f4e8d9',
                  marginBottom: '20px',
                }}>
                  Create Event
                </h2>
                
                <select
                  value={newEventCrewId || ''}
                  onChange={(e) => setNewEventCrewId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: newEventCrewId ? colors.text : colors.textDark,
                    fontSize: '16px',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  <option value="">Select crew</option>
                  {myCrews.map(crew => (
                    <option key={crew.id} value={crew.id}>{crew.name}</option>
                  ))}
                </select>
                
                <input
                  className="input"
                  type="text"
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    className="input"
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="input"
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                
                <input
                  className="input"
                  type="text"
                  placeholder="Location (optional)"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                
                <textarea
                  className="input"
                  placeholder="Description (optional)"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '20px', resize: 'none' }}
                />
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateEvent(false);
                      setNewEventTitle('');
                      setNewEventDescription('');
                      setNewEventLocation('');
                      setNewEventDate('');
                      setNewEventTime('');
                      setNewEventCrewId(null);
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={createEvent}
                    disabled={!newEventTitle || !newEventDate || !newEventTime || !newEventCrewId}
                    style={{ flex: 1, opacity: (!newEventTitle || !newEventDate || !newEventTime || !newEventCrewId) ? 0.5 : 1 }}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Event Detail Modal */}
          {selectedEvent && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}>
              <div style={{
                background: colors.bgLight,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '12px 20px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '12px', color: colors.gold, textTransform: 'uppercase' }}>
                      {new Date(selectedEvent.event_date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text }}>
                      {new Date(selectedEvent.event_date).getDate()}
                    </div>
                  </div>
                  <h2 style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: '24px',
                    color: '#f4e8d9',
                    marginBottom: '8px',
                  }}>
                    {selectedEvent.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: colors.gold }}>
                    {selectedEvent.crewName}
                  </p>
                </div>
                
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: colors.textMuted, fontSize: '14px' }}>
                    <span>🕐 {new Date(selectedEvent.event_date).toLocaleString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                    {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
                    <span>👥 {selectedEvent.attendeeCount} going</span>
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>
                    {selectedEvent.description}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedEvent(null)}
                    style={{ flex: 1 }}
                  >
                    Close
                  </button>
                  {selectedEvent.userRsvp === 'going' ? (
                    <button
                      onClick={() => {
                        cancelRsvp(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '14px 28px',
                        background: 'rgba(231, 76, 60, 0.2)',
                        border: '1px solid rgba(231, 76, 60, 0.4)',
                        borderRadius: '6px',
                        color: '#e74c3c',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                      }}
                    >
                      Can't Go
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        rsvpToEvent(selectedEvent.id, 'going');
                        setSelectedEvent(null);
                      }}
                      style={{ flex: 1 }}
                    >
                      I'm Going!
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Report/Block Modal */}
          {showReportModal && reportingUser && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}>
              <div style={{
                background: colors.bgLight,
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                border: `1px solid ${colors.border}`,
              }}>
                <h2 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '20px',
                  color: '#f4e8d9',
                  marginBottom: '8px',
                }}>
                  {reportingUser.name}
                </h2>
                <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '20px' }}>
                  What would you like to do?
                </p>
                
                {/* Block Button */}
                <button
                  onClick={() => {
                    if (confirm(`Block ${reportingUser.name}? They won't be able to see you or contact you.`)) {
                      blockUser(reportingUser.id);
                      setShowReportModal(false);
                      setReportingUser(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    marginBottom: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.text,
                    fontSize: '15px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  🚫 Block this person
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
                    They won't see you or be able to contact you
                  </p>
                </button>
                
                {/* Report Section */}
                <div style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <p style={{ color: colors.text, fontSize: '15px', marginBottom: '12px' }}>
                    🚩 Report this person
                  </p>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: reportReason ? colors.text : colors.textDark,
                      fontSize: '14px',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    <option value="">Select reason</option>
                    <option value="harassment">Harassment or bullying</option>
                    <option value="fake">Fake profile</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="spam">Spam or scam</option>
                    <option value="other">Other</option>
                  </select>
                  
                  {reportReason && (
                    <>
                      <textarea
                        placeholder="Add details (optional)"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginBottom: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          resize: 'none',
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                        }}
                      />
                      <button
                        onClick={reportUser}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'rgba(231, 76, 60, 0.2)',
                          border: '1px solid rgba(231, 76, 60, 0.4)',
                          borderRadius: '6px',
                          color: '#e74c3c',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                        }}
                      >
                        Submit Report
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportingUser(null);
                    setReportReason('');
                    setReportDescription('');
                  }}
                  style={{ width: '100%' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <BottomNav active="home" onNavigate={setCurrentScreen} pendingCount={pendingRequests.length} />
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
          
          <BottomNav active="explore" onNavigate={setCurrentScreen} pendingCount={pendingRequests.length} />
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
          
          <BottomNav active="messages" onNavigate={setCurrentScreen} pendingCount={pendingRequests.length} />
        </div>
      </div>
    );
  }

  // EDIT PROFILE SCREEN
  if (currentScreen === 'edit-profile') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ padding: '40px 24px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <button
                onClick={() => setCurrentScreen('profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.gold,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  marginRight: '16px',
                }}
              >
                ←
              </button>
              <h2 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '24px',
                fontWeight: '600',
                color: '#f4e8d9',
              }}>
                Get Verified
              </h2>
            </div>
            
            <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
              Add a photo and social link to verify your profile. This helps build trust in the community.
            </p>
            
            {/* Photo Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: colors.gold, 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                marginBottom: '12px' 
              }}>
                Profile Photo
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: photoPreview || profile?.photo_url
                    ? `url(${photoPreview || profile?.photo_url}) center/cover`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                }}>
                  {!photoPreview && !profile?.photo_url && '📷'}
                </div>
                <label style={{
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}>
                  {photoPreview || profile?.photo_url ? 'Change Photo' : 'Upload Photo'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
            {/* Social Links */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: colors.gold, 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                marginBottom: '12px' 
              }}>
                Social Links (at least one for verification)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Instagram username"
                  value={instagram || profile?.instagram || ''}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💼</span>
                <input
                  className="input"
                  type="text"
                  placeholder="LinkedIn profile URL"
                  value={linkedin || profile?.linkedin || ''}
                  onChange={(e) => setLinkedin(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            {/* Verification preview */}
            {(photoPreview || profile?.photo_url) && (instagram || linkedin || profile?.instagram || profile?.linkedin) && (
              <div style={{
                padding: '16px',
                background: 'rgba(45, 74, 62, 0.2)',
                border: '1px solid rgba(45, 74, 62, 0.4)',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '24px' }}>✓</span>
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                    You'll be verified!
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '13px' }}>
                    Save to get your verified badge.
                  </p>
                </div>
              </div>
            )}
            
            <button 
              className="btn-primary"
              style={{ width: '100%', opacity: uploadingPhoto ? 0.7 : 1 }}
              onClick={async () => {
                if (!user) return;
                setUploadingPhoto(true);
                
                try {
                  let photoUrl = profile?.photo_url;
                  
                  if (photoFile) {
                    const fileExt = photoFile.name.split('.').pop();
                    const fileName = `${user.id}/avatar.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('avatars')
                      .upload(fileName, photoFile, { upsert: true });
                    
                    if (uploadError) throw uploadError;
                    
                    const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(fileName);
                    
                    photoUrl = publicUrl;
                  }
                  
                  const finalInstagram = instagram || profile?.instagram || null;
                  const finalLinkedin = linkedin || profile?.linkedin || null;
                  const isVerified = !!(photoUrl && (finalInstagram || finalLinkedin));
                  
                  const { error } = await supabase
                    .from('profiles')
                    .update({
                      photo_url: photoUrl,
                      instagram: finalInstagram,
                      linkedin: finalLinkedin,
                      is_verified: isVerified,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id);
                  
                  if (error) throw error;
                  
                  setProfile({
                    ...profile,
                    photo_url: photoUrl,
                    instagram: finalInstagram,
                    linkedin: finalLinkedin,
                    is_verified: isVerified,
                  });
                  
                  setCurrentScreen('profile');
                } catch (error) {
                  console.error('Error updating profile:', error);
                  alert('Error updating profile. Please try again.');
                } finally {
                  setUploadingPhoto(false);
                }
              }}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Saving...' : 'Save & Get Verified'}
            </button>
            
            <button 
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setCurrentScreen('profile')}
            >
              Cancel
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
                background: profile?.photo_url 
                  ? `url(${profile.photo_url}) center/cover`
                  : `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: '600',
                color: colors.bg,
                margin: '0 auto 16px',
                border: profile?.is_verified ? `3px solid ${colors.gold}` : 'none',
              }}>
                {!profile?.photo_url && (profile?.name?.[0]?.toUpperCase() || 'U')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '28px',
                  color: '#f4e8d9',
                }}>
                  {profile?.name || 'User'}
                </h1>
                {profile?.is_verified && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: colors.gold,
                    background: 'rgba(212, 175, 55, 0.15)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}>✓ Verified</span>
                )}
              </div>
              <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                {profile?.email}
              </p>
              {profile?.location && (
                <p style={{ color: colors.textMuted, fontSize: '14px', marginTop: '4px' }}>
                  📍 {profile.location}
                </p>
              )}
              
              {/* Social Links */}
              {(profile?.instagram || profile?.linkedin) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                  {profile.instagram && (
                    <a 
                      href={`https://instagram.com/${profile.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: colors.textMuted, fontSize: '14px', textDecoration: 'none' }}
                    >
                      📸 @{profile.instagram}
                    </a>
                  )}
                  {profile.linkedin && (
                    <a 
                      href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: colors.textMuted, fontSize: '14px', textDecoration: 'none' }}
                    >
                      💼 LinkedIn
                    </a>
                  )}
                </div>
              )}
              
              {/* Edit Profile / Get Verified Button */}
              {!profile?.is_verified && (
                <button
                  onClick={() => setCurrentScreen('edit-profile')}
                  style={{
                    marginTop: '16px',
                    padding: '10px 20px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: `1px solid ${colors.gold}`,
                    borderRadius: '20px',
                    color: colors.gold,
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  ✓ Get Verified
                </button>
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
            
            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
              <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: colors.gold,
                  marginBottom: '12px',
                }}>
                  Friend Requests ({pendingRequests.length})
                </h3>
                {pendingRequests.map(request => {
                  const requester = nearbyUsers.find(u => u.id === request.requester_id);
                  return (
                    <div key={request.id} style={{
                      padding: '12px 16px',
                      background: 'rgba(45, 74, 62, 0.15)',
                      border: '1px solid rgba(45, 74, 62, 0.3)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.text,
                        }}>
                          {requester?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ color: colors.text, fontSize: '14px' }}>
                          {requester?.name || 'Someone'} wants to connect
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => acceptFriendRequest(request.requester_id)}
                          style={{
                            padding: '6px 12px',
                            background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                            border: 'none',
                            borderRadius: '4px',
                            color: colors.bg,
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: '"Cormorant Garamond", Georgia, serif',
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineFriendRequest(request.requester_id)}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            color: colors.textMuted,
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontFamily: '"Cormorant Garamond", Georgia, serif',
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Friends List */}
            {friends.length > 0 && (
              <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: colors.gold,
                  marginBottom: '12px',
                }}>
                  Friends ({friends.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {friends.map(friendId => {
                    const friend = nearbyUsers.find(u => u.id === friendId);
                    return (
                      <div key={friendId} style={{
                        padding: '8px 12px',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: colors.bg,
                        }}>
                          {friend?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ color: colors.text, fontSize: '13px' }}>
                          {friend?.name || 'Friend'}
                        </span>
                      </div>
                    );
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
            
            {/* Delete Account */}
            <div style={{ padding: '20px', marginTop: '24px', borderTop: `1px solid ${colors.border}` }}>
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    if (confirm('This will permanently delete all your data including your profile, crews, friends, and events. Continue?')) {
                      try {
                        // Delete user's data from all tables
                        await supabase.from('event_attendees').delete().eq('user_id', user.id);
                        await supabase.from('events').delete().eq('creator_id', user.id);
                        await supabase.from('crew_members').delete().eq('user_id', user.id);
                        await supabase.from('friends').delete().or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
                        await supabase.from('blocks').delete().or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
                        await supabase.from('reports').delete().eq('reporter_id', user.id);
                        await supabase.from('profiles').delete().eq('id', user.id);
                        
                        // Delete avatar from storage
                        await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`]);
                        
                        // Sign out
                        await supabase.auth.signOut();
                        
                        alert('Your account has been deleted.');
                        setUser(null);
                        setProfile(null);
                        setCurrentScreen('splash');
                      } catch (error) {
                        console.error('Error deleting account:', error);
                        alert('Error deleting account. Please contact support.');
                      }
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  border: `1px solid rgba(231, 76, 60, 0.3)`,
                  borderRadius: '6px',
                  color: '#e74c3c',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
              >
                Delete Account
              </button>
              <p style={{ fontSize: '12px', color: colors.textDark, textAlign: 'center', marginTop: '8px' }}>
                This will permanently delete all your data
              </p>
            </div>
          </div>
          
          <BottomNav active="profile" onNavigate={setCurrentScreen} pendingCount={pendingRequests.length} />
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
