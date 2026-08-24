import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
  });
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) throw error;
      return data;
    }
  });
}

export function useGroupMembers(groupId) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profiles(*)')
        .eq('group_id', groupId);
      if (error) throw error;
      return data;
    },
    enabled: !!groupId
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(user_id, status),
          event_guests(id, name, status, parent_user_id),
          event_games(game_id, games_catalog(*), event_game_votes(user_id)),
          event_matches(id, game_id, winner_id, created_at),
          event_bring_list(id, item, assignee_id)
        `);
      if (error) throw error;
      return data;
    }
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      return data;
    }
  });
}

export function useGamesCatalog() {
  return useQuery({
    queryKey: ['gamesCatalog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('games_catalog').select('*');
      if (error) throw error;
      return data;
    }
  });
}

// Mutations
export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (group) => {
      const { data, error } = await supabase.from('groups').insert(group).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['groups'])
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event) => {
      const { data, error } = await supabase.from('events').insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['events'])
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location) => {
      const { data, error } = await supabase.from('locations').insert(location).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['locations'])
  });
}

export function useAddGameToCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game) => {
      const { data, error } = await supabase.from('games_catalog').insert(game).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['gamesCatalog'])
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['profiles'])
  });
}
