-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  accessory text default 'none',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Groups table
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;
create policy "Groups are viewable by everyone." on groups for select using (true);
create policy "Authenticated users can create groups." on groups for insert to authenticated with check (true);
create policy "Group creators can update their groups." on groups for update using (auth.uid() = created_by);

-- Group Members table
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;
create policy "Group members are viewable by everyone." on group_members for select using (true);
create policy "Authenticated users can join groups." on group_members for insert to authenticated with check (true);
create policy "Users can leave groups." on group_members for delete using (auth.uid() = user_id);

-- Locations table
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  max_players integer not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.locations enable row level security;
create policy "Locations are viewable by everyone." on locations for select using (true);
create policy "Authenticated users can create locations." on locations for insert to authenticated with check (true);

-- Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null,
  group_id uuid references public.groups(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  max_players integer not null,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;
create policy "Events are viewable by everyone." on events for select using (true);
create policy "Authenticated users can create events." on events for insert to authenticated with check (true);
create policy "Authenticated users can update events." on events for update to authenticated using (true);
create policy "Authenticated users can delete events." on events for delete to authenticated using (true);

-- Event Attendees table
create table public.event_attendees (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('attending', 'waitlist')) default 'attending',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (event_id, user_id)
);

alter table public.event_attendees enable row level security;
create policy "Event attendees are viewable by everyone." on event_attendees for select using (true);
create policy "Authenticated users can RSVP." on event_attendees for insert to authenticated with check (true);
create policy "Users can update their RSVP." on event_attendees for update using (auth.uid() = user_id);
create policy "Users can cancel their RSVP." on event_attendees for delete using (auth.uid() = user_id);

-- Event Guests
create table public.event_guests (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade,
  parent_user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  status text check (status in ('attending', 'waitlist')) default 'attending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_guests enable row level security;
create policy "Guests are viewable by everyone." on event_guests for select using (true);
create policy "Users can add guests." on event_guests for insert to authenticated with check (auth.uid() = parent_user_id);
create policy "Users can remove guests." on event_guests for delete using (auth.uid() = parent_user_id);

-- Games Catalog
create table public.games_catalog (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text,
  description text,
  bgg_id text,
  thumbnail text,
  is_expansion boolean default false,
  base_game_id uuid references public.games_catalog(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.games_catalog enable row level security;
create policy "Games catalog is viewable by everyone." on games_catalog for select using (true);
create policy "Authenticated users can add games." on games_catalog for insert to authenticated with check (true);

-- Event Games
create table public.event_games (
  event_id uuid references public.events(id) on delete cascade,
  game_id uuid references public.games_catalog(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  primary key (event_id, game_id)
);

alter table public.event_games enable row level security;
create policy "Event games are viewable by everyone." on event_games for select using (true);
create policy "Authenticated users can add games to events." on event_games for insert to authenticated with check (true);
create policy "Authenticated users can remove games from events." on event_games for delete to authenticated using (true);

-- Event Game Votes
create table public.event_game_votes (
  event_id uuid,
  game_id uuid,
  user_id uuid references public.profiles(id) on delete cascade,
  foreign key (event_id, game_id) references public.event_games(event_id, game_id) on delete cascade,
  primary key (event_id, game_id, user_id)
);

alter table public.event_game_votes enable row level security;
create policy "Votes are viewable by everyone." on event_game_votes for select using (true);
create policy "Users can vote." on event_game_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can remove vote." on event_game_votes for delete using (auth.uid() = user_id);

-- Event Matches
create table public.event_matches (
  id uuid default gen_random_uuid() primary key,
  event_id uuid,
  game_id uuid,
  winner_id text not null, -- text to allow guest strings or user uuids
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (event_id, game_id) references public.event_games(event_id, game_id) on delete cascade
);

alter table public.event_matches enable row level security;
create policy "Matches are viewable by everyone." on event_matches for select using (true);
create policy "Authenticated users can record matches." on event_matches for insert to authenticated with check (true);
create policy "Authenticated users can delete matches." on event_matches for delete to authenticated using (true);

-- Event Bring List
create table public.event_bring_list (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade,
  item text not null,
  assignee_id text, -- text to allow guest strings or user uuids
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_bring_list enable row level security;
create policy "Bring list viewable by everyone." on event_bring_list for select using (true);
create policy "Authenticated users can add items." on event_bring_list for insert to authenticated with check (true);
create policy "Authenticated users can delete items." on event_bring_list for delete to authenticated using (true);

-- Trigger for creating a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
