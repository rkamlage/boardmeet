import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const handleSession = async (session) => {
    const user = session.user;
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (!profile) {
      await supabase.from('profiles').insert({ id: user.id, email: user.email, name: user.email.split('@')[0] });
    }
    setCurrentUser({ id: user.id, name: user.email.split('@')[0], email: user.email });
    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session);
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

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ----------------------------------------------------
  // QUERIES
  // ----------------------------------------------------
  
  const { data: rawProfiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: rawGroups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*, group_members(user_id)');
      if (error) throw error;
      return data;
    }
  });

  const { data: rawLocations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: rawGames = [] } = useQuery({
    queryKey: ['gamesCatalog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('games_catalog').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: rawEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(user_id, status),
          event_guests(id, name, status, parent_user_id),
          event_games(game_id, votes, games_catalog(id, name, icon)),
          event_matches(id, game_id, winner_id, created_at),
          bring_list(id, item, assignee_id)
        `);
      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      return data;
    }
  });

  // ----------------------------------------------------
  // MAPPERS (Translating DB format to UI format)
  // ----------------------------------------------------

  const userProfiles = useMemo(() => {
    const dict = {};
    rawProfiles.forEach(p => {
      dict[p.id] = p;
    });
    return dict;
  }, [rawProfiles]);

  const groups = useMemo(() => {
    return rawGroups.map(g => ({
      id: g.id,
      name: g.name,
      adminId: g.created_by,
      members: g.group_members?.map(m => m.user_id) || []
    }));
  }, [rawGroups]);

  const locations = useMemo(() => {
    return rawLocations.map(l => ({
      id: l.id,
      name: l.name,
      maxPlayers: l.max_players
    }));
  }, [rawLocations]);

  const gamesCatalog = useMemo(() => {
    return rawGames.map(g => ({
      ...g,
      bggImage: g.bgg_image,
      isExpansion: g.is_expansion
    }));
  }, [rawGames]);

  const events = useMemo(() => {
    return rawEvents.map(e => {
      const attendees = e.event_attendees?.filter(a => a.status === 'attending').map(a => a.user_id) || [];
      const waitlist = e.event_attendees?.filter(a => a.status === 'waitlist').map(a => a.user_id) || [];
      
      const guestAttendees = e.event_guests?.filter(a => a.status === 'attending').map(a => `${a.parent_user_id}_guest_${a.id}`) || [];
      const guestWaitlist = e.event_guests?.filter(a => a.status === 'waitlist').map(a => `${a.parent_user_id}_guest_${a.id}`) || [];

      return {
        id: e.id,
        groupId: e.group_id,
        locationId: e.location_id,
        title: e.title,
        date: e.date,
        maxPlayers: e.max_players,
        createdBy: e.created_by,
        attendees: [...attendees, ...guestAttendees],
        waitlist: [...waitlist, ...guestWaitlist],
        games: e.event_games?.map(eg => ({
          id: eg.game_id,
          name: eg.games_catalog?.name || 'Unknown',
          icon: eg.games_catalog?.icon || '🎲',
          votes: eg.votes || []
        })) || [],
        matches: e.event_matches?.map(m => ({
          id: m.id,
          gameId: m.game_id,
          winnerId: m.winner_id,
          timestamp: m.created_at
        })) || [],
        bringList: e.bring_list?.map(b => ({
          id: b.id,
          item: b.item,
          assignee: b.assignee_id
        })) || []
      };
    });
  }, [rawEvents]);

  // ----------------------------------------------------
  // MUTATIONS (Write to DB and update cache)
  // ----------------------------------------------------

  const updateUserProfile = async (userId, data) => {
    await supabase.from('profiles').update(data).eq('id', userId);
    queryClient.invalidateQueries(['profiles']);
  };

  const createGroup = async (name) => {
    const { data: group, error } = await supabase.from('groups').insert({ name, created_by: currentUser.id }).select().single();
    if (error) console.error('Error creating group:', error);
    
    if (group) {
      const { error: memberError } = await supabase.from('group_members').insert({ group_id: group.id, user_id: currentUser.id, role: 'admin' });
      if (memberError) console.error('Error adding group member:', memberError);
      queryClient.invalidateQueries(['groups']);
    }
  };

  const createEvent = async (eventData) => {
    const { data: ev, error } = await supabase.from('events').insert({
      title: eventData.title,
      date: eventData.date,
      group_id: eventData.groupId,
      location_id: eventData.locationId,
      max_players: eventData.maxPlayers,
      created_by: currentUser.id
    }).select().single();
    if (error) console.error('Error creating event:', error);

    if (ev) {
      const { error: rsvpError } = await supabase.from('event_attendees').insert({ event_id: ev.id, user_id: currentUser.id, status: 'attending' });
      if (rsvpError) console.error('Error RSVPing to event:', rsvpError);
      queryClient.invalidateQueries(['events']);
    }
  };

  const deleteGroup = async (groupId) => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
    await queryClient.invalidateQueries(['groups']);
    await queryClient.invalidateQueries(['events']);
  };

  const deleteEvent = async (eventId) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
    await queryClient.invalidateQueries(['events']);
  };

  const joinGroup = async (groupId) => {
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: currentUser.id,
      role: 'member'
    });
    if (error) {
      // If it's a unique constraint error (already in group), that's fine
      if (error.code !== '23505') {
        console.error('Error joining group:', error);
        throw error;
      }
    }
    await queryClient.invalidateQueries(['groups']);
  };

  const joinEvent = async (eventId) => {
    const ev = rawEvents.find(e => e.id === eventId);
    if (!ev) return;
    const currentAttendees = ev.event_attendees?.filter(a => a.status === 'attending').length || 0;
    const status = currentAttendees >= ev.max_players ? 'waitlist' : 'attending';
    
    await supabase.from('event_attendees').insert({ event_id: eventId, user_id: currentUser.id, status });
    queryClient.invalidateQueries(['events']);
  };

  const leaveEvent = async (eventId) => {
    await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', currentUser.id);
    
    // Auto-promote waitlist logic is tricky purely in client, but let's do a basic promotion if possible
    const ev = rawEvents.find(e => e.id === eventId);
    if (ev) {
      const attending = ev.event_attendees?.filter(a => a.status === 'attending' && a.user_id !== currentUser.id) || [];
      const waitlist = ev.event_attendees?.filter(a => a.status === 'waitlist') || [];
      if (attending.length < ev.max_players && waitlist.length > 0) {
        // Promote first waitlist
        const first = waitlist.sort((a,b) => new Date(a.joined_at) - new Date(b.joined_at))[0];
        await supabase.from('event_attendees').update({ status: 'attending' }).eq('event_id', eventId).eq('user_id', first.user_id);
      }
    }
    queryClient.invalidateQueries(['events']);
  };

  const addGuest = async (eventId) => {
    const ev = rawEvents.find(e => e.id === eventId);
    if (!ev) return;
    const currentAttendees = ev.event_attendees?.filter(a => a.status === 'attending').length + (ev.event_guests?.filter(a => a.status === 'attending').length || 0) || 0;
    const status = currentAttendees >= ev.max_players ? 'waitlist' : 'attending';
    
    await supabase.from('event_guests').insert({ event_id: eventId, parent_user_id: currentUser.id, name: 'Guest', status });
    queryClient.invalidateQueries(['events']);
  };

  const addGameToEvent = async (eventId, gameId, gameName) => {
    await supabase.from('event_games').insert({ event_id: eventId, game_id: gameId });
    queryClient.invalidateQueries(['events']);
  };

  const removeGameFromEvent = async (eventId, gameId) => {
    await supabase.from('event_games').delete().eq('event_id', eventId).eq('game_id', gameId);
    queryClient.invalidateQueries(['events']);
  };

  const voteGame = async (eventId, gameId) => {
    toggleVote(eventId, gameId, currentUser.id);
  };

  const toggleVote = async (eventId, gameId, userId) => {
    const ev = rawEvents.find(e => e.id === eventId);
    if (!ev) return;
    const game = ev.event_games?.find(g => g.game_id === gameId);
    let newVotes = game?.votes || [];
    
    if (newVotes.includes(userId)) {
      newVotes = newVotes.filter(id => id !== userId);
    } else {
      newVotes = [...newVotes, userId];
    }
    
    await supabase.from('event_games').update({ votes: newVotes }).eq('event_id', eventId).eq('game_id', gameId);
    queryClient.invalidateQueries(['events']);
  };

  const recordMatch = async (eventId, gameId, winnerId) => {
    await supabase.from('event_matches').insert({ event_id: eventId, game_id: gameId, winner_id: winnerId });
    queryClient.invalidateQueries(['events']);
  };

  const addBringListItem = async (eventId, item, assignee) => {
    await supabase.from('bring_list').insert({ event_id: eventId, item, assignee_id: assignee });
    queryClient.invalidateQueries(['events']);
  };

  const removeBringListItem = async (eventId, itemId) => {
    await supabase.from('bring_list').delete().eq('id', itemId);
    queryClient.invalidateQueries(['events']);
  };

  const addLocation = async (name, maxPlayers) => {
    const { data } = await supabase.from('locations').insert({ name, max_players: maxPlayers, created_by: currentUser.id }).select().single();
    queryClient.invalidateQueries(['locations']);
    return data;
  };

  const addGameToCatalog = async (gameData) => {
    const { data, error } = await supabase.from('games_catalog').insert({
      name: gameData.name,
      icon: gameData.icon || '🎲',
      description: gameData.description || '',
      is_expansion: gameData.isExpansion || false,
      bgg_image: gameData.bggImage || null
    }).select().single();
    
    if (error) {
      console.error('Error inserting game:', error);
      alert('Fehler beim Hinzufügen: ' + error.message);
      throw error;
    }
    
    queryClient.invalidateQueries(['gamesCatalog']);
    return data;
  };

  const formatUserName = (userId) => {
    if (currentUser && userId === currentUser.id) {
      const name = userProfiles[userId]?.name || currentUser.name || 'Ohne Namen';
      return `Du (${name})`;
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
    authLoading,
    login,
    loginWithGoogle,
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
    joinGroup,
    createEvent,
    deleteGroup,
    deleteEvent,
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
