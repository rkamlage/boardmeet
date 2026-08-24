import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser({ id: session.user.id, name: session.user.email.split('@')[0], email: session.user.email });
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser({ id: session.user.id, name: session.user.email.split('@')[0], email: session.user.email });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Default Data
  const defaultGroups = [{ id: 'g1', name: 'Weekly Boardgamers', adminId: 'u1', members: ['u1', 'u2'] }];
  const defaultLocations = [{ id: 'loc1', name: "Alex's Living Room", maxPlayers: 4 }];
  const defaultEvents = [{ id: 'e1', groupId: 'g1', title: 'Friday Game Night', date: '2023-11-10T19:00:00', locationId: 'loc1', maxPlayers: 4, attendees: ['u1'], waitlist: [], bringList: [], games: [] }];
  const defaultGames = [{ id: '13', name: 'Catan', icon: '🌾', description: 'Baue Siedlungen.', link: 'https://boardgamegeek.com/boardgame/13' }];

  // State with LocalStorage
  const [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem('bm_groups')) || defaultGroups);
  const [locations, setLocations] = useState(() => JSON.parse(localStorage.getItem('bm_locations')) || defaultLocations);
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('bm_events')) || defaultEvents);
  const [gamesCatalog, setGamesCatalog] = useState(() => JSON.parse(localStorage.getItem('bm_games')) || defaultGames);
  const [userProfiles, setUserProfiles] = useState(() => JSON.parse(localStorage.getItem('bm_profiles')) || {});

  // Persist on change
  useEffect(() => {
    localStorage.setItem('bm_groups', JSON.stringify(groups));
    localStorage.setItem('bm_locations', JSON.stringify(locations));
    localStorage.setItem('bm_events', JSON.stringify(events));
    localStorage.setItem('bm_games', JSON.stringify(gamesCatalog));
    localStorage.setItem('bm_profiles', JSON.stringify(userProfiles));
  }, [groups, locations, events, gamesCatalog, userProfiles]);

  const updateUserProfile = (userId, data) => {
    setUserProfiles(prev => ({ ...prev, [userId]: { ...prev[userId], ...data } }));
  };

  useEffect(() => {
    if (currentUser) {
      setGroups(prevGroups => prevGroups.map(g => {
        if (g.id === 'g1' && !g.members.includes(currentUser.id)) {
          return { ...g, members: [...g.members, currentUser.id] };
        }
        return g;
      }));
    }
  }, [currentUser]);

  const createGroup = (name) => {
    const newGroup = {
      id: `g${Date.now()}`,
      name,
      adminId: currentUser.id,
      members: [currentUser.id]
    };
    setGroups([...groups, newGroup]);
  };

  // Event Actions
  const createEvent = (eventData) => {
    const newEvent = {
      id: `e${Date.now()}`,
      ...eventData,
      attendees: [currentUser.id],
      waitlist: [],
      bringList: [],
      games: []
    };
    setEvents([...events, newEvent]);
  };

  const joinEvent = (eventId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        if (ev.attendees.includes(currentUser.id) || ev.waitlist.includes(currentUser.id)) {
          return ev; // already in
        }
        if (ev.attendees.length >= ev.maxPlayers) {
          // Add to waitlist
          return { ...ev, waitlist: [...ev.waitlist, currentUser.id] };
        } else {
          // Add to attendees
          return { ...ev, attendees: [...ev.attendees, currentUser.id] };
        }
      }
      return ev;
    }));
  };
  
  const leaveEvent = (eventId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        if (ev.attendees.includes(currentUser.id)) {
          const newAttendees = ev.attendees.filter(id => id !== currentUser.id);
          const newWaitlist = [...ev.waitlist];
          
          if (newWaitlist.length > 0) {
            const nextInLine = newWaitlist.shift();
            newAttendees.push(nextInLine);
          }
          
          return { ...ev, attendees: newAttendees, waitlist: newWaitlist };
        } 
        else if (ev.waitlist.includes(currentUser.id)) {
          return { ...ev, waitlist: ev.waitlist.filter(id => id !== currentUser.id) };
        }
      }
      return ev;
    }));
  };

  const addGuest = (eventId) => {
    const guestId = `${currentUser.id}_guest_${Date.now()}`;
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        if (ev.attendees.length >= ev.maxPlayers) {
          return { ...ev, waitlist: [...ev.waitlist, guestId] };
        } else {
          return { ...ev, attendees: [...ev.attendees, guestId] };
        }
      }
      return ev;
    }));
  };

  const addGameToEvent = (eventId, gameId, gameName) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId && !ev.games.find(g => g.id === gameId)) {
        return { ...ev, games: [...ev.games, { id: gameId, name: gameName, votes: [] }] };
      }
      return ev;
    }));
  };

  const voteGame = (eventId, gameId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        const updatedGames = ev.games.map(g => {
          if (g.id === gameId) {
            const hasVoted = g.votes.includes(currentUser.id);
            const newVotes = hasVoted 
              ? g.votes.filter(id => id !== currentUser.id)
              : [...g.votes, currentUser.id];
            return { ...g, votes: newVotes };
          }
          return g;
        });
        return { ...ev, games: updatedGames };
      }
      return ev;
    }));
  };

  const toggleVote = (eventId, gameId, userId) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          games: e.games.map(g => {
            if (g.id === gameId) {
              const hasVoted = g.votes.includes(userId);
              return { ...g, votes: hasVoted ? g.votes.filter(u => u !== userId) : [...g.votes, userId] };
            }
            return g;
          })
        };
      }
      return e;
    }));
  };

  const recordMatch = (eventId, gameId, winnerId) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const newMatch = { id: `m${Date.now()}`, gameId, winnerId, timestamp: new Date().toISOString() };
        return { ...e, matches: [...(e.matches || []), newMatch] };
      }
      return e;
    }));
  };

  const addBringListItem = (eventId, item, assignee) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, bringList: [...ev.bringList, { id: `b${Date.now()}`, item, assignee }] };
      }
      return ev;
    }));
  };

  const removeBringListItem = (eventId, itemId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, bringList: ev.bringList.filter(b => b.id !== itemId) };
      }
      return ev;
    }));
  };

  const removeGameFromEvent = (eventId, gameId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, games: ev.games.filter(g => g.id !== gameId) };
      }
      return ev;
    }));
  };

  const addLocation = (name, maxPlayers) => {
    const newLoc = { id: `loc${Date.now()}`, name, maxPlayers };
    setLocations([...locations, newLoc]);
    return newLoc;
  };

  const addGameToCatalog = (gameData) => {
    const newGame = {
      id: `gc_${Date.now()}`,
      name: gameData.name,
      icon: gameData.icon || '🎲',
      description: gameData.description || 'Ein neues Spiel in unserer Datenbank.',
      isExpansion: gameData.isExpansion || false,
      baseGameId: gameData.baseGameId || null,
      link: `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(gameData.name)}`
    };
    setGamesCatalog([...gamesCatalog, newGame]);
    return newGame;
  };

  const formatUserName = (userId) => {
    if (currentUser && userId === currentUser.id) {
      return currentUser.email ? currentUser.email.split('@')[0] : 'Du';
    }
    if (userId.includes('_guest_')) {
      const parent = userId.split('_guest_')[0];
      const parentName = parent === currentUser?.id ? 'Dein' : (userProfiles[parent]?.name || parent);
      return `${parentName} Gast`;
    }
    return userProfiles[userId]?.name || userId;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    groups,
    events,
    locations,
    gamesCatalog,
    userProfiles,
    updateUserProfile,
    formatUserName,
    addLocation,
    addGameToCatalog,
    createGroup,
    createEvent,
    joinEvent,
    leaveEvent,
    addGuest,
    addBringListItem,
    removeBringListItem,
    addGameToEvent,
    removeGameFromEvent,
    voteGame,
    recordMatch,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
