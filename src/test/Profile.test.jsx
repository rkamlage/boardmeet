import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../pages/Profile';
import * as StoreContext from '../context/StoreContext';

vi.mock('../context/StoreContext', () => ({
  useStore: vi.fn(),
}));

describe('Profile Component', () => {
  const mockStore = {
    currentUser: { id: 'u1', name: 'TestUser', email: 'test@example.com' },
    logout: vi.fn(),
    events: [
      {
        id: 'e1',
        attendees: ['u1'],
        games: [{ id: 'g1', name: 'Monopoly' }],
        matches: [{ id: 'm1', gameId: 'g1', winnerId: 'u1' }],
      }
    ],
    userProfiles: {
      'u1': { name: 'TestUser', accessory: 'none' }
    },
    updateUserProfile: vi.fn(),
  };

  beforeEach(() => {
    StoreContext.useStore.mockReturnValue(mockStore);
  });

  const renderProfile = () => {
    return render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  };

  it('renders user name correctly', () => {
    renderProfile();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('calculates stats correctly', () => {
    renderProfile();
    // u1 attended 1 event (2 points) + won 1 match (10 points) = 12 points
    expect(screen.getByText('12')).toBeInTheDocument();
    
    // 1 win and 1 match played (so 1 appears multiple times)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    
    // 100% win rate
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Favorite game is Monopoly
    expect(screen.getByText('Monopoly')).toBeInTheDocument();
  });
});
