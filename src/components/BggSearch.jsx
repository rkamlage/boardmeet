import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ExternalLink, Search, Plus, Loader } from 'lucide-react';
import { TOP_GAMES } from '../data/gamesData';
import { searchBgg, getBggDetails } from '../utils/bggApi';

export default function GameSearch({ eventId }) {
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [bggQuery, setBggQuery] = useState('');
  const [bggResults, setBggResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { addGameToEvent, addGameToCatalog, events, gamesCatalog } = useStore();

  const event = events.find(e => e.id === eventId);
  const existingGameIds = event ? event.games.map(g => g.id) : [];

  const allGames = [...TOP_GAMES, ...gamesCatalog].reduce((acc, curr) => {
    if (!acc.find(g => g.id === curr.id)) acc.push(curr);
    return acc;
  }, []);

  const filteredGames = allGames.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase()) && !existingGameIds.includes(g.id)
  );

  const handleBggSearch = async (e) => {
    e.preventDefault();
    if (!bggQuery.trim()) return;
    setIsSearching(true);
    const results = await searchBgg(bggQuery);
    setBggResults(results);
    setIsSearching(false);
  };

  const handleAddBggGame = async (bggGame) => {
    setIsSearching(true);
    const details = await getBggDetails(bggGame.id);
    setIsSearching(false);
    
    if (details) {
      const addedGame = addGameToCatalog({
        name: details.name,
        icon: '🎲', // Default icon for BGG imported games
        description: details.description,
        isExpansion: bggGame.type === 'boardgameexpansion',
        bggImage: details.thumbnail
      });
      addGameToEvent(eventId, addedGame.id, addedGame.name);
      
      setQuery('');
      setBggQuery('');
      setBggResults([]);
      setShowAddForm(false);
    } else {
      alert("Fehler beim Laden der Details von BGG.");
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
        <Search size={16} className="text-primary" />
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Spiel suchen (z.B. Catan)..."
          style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.75rem', outline: 'none' }}
        />
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {filteredGames.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredGames.map(g => (
              <li key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, paddingRight: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {g.bggImage ? (
                    <img src={g.bggImage} alt={g.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ fontSize: '1.5rem' }}>{g.icon}</div>
                  )}
                  <div>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {g.name}
                      {g.isExpansion && <span className="badge" style={{ fontSize: '0.6rem' }}>Erweiterung</span>}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '0.2rem' }}>
                      {g.description}
                    </div>
                    <a href={g.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
                      BGG <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => {
                    addGameToEvent(eventId, g.id, g.name);
                    setQuery('');
                  }}
                >
                  Hinzufügen
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', textAlign: 'center', padding: '1rem 0' }}>
            Kein Spiel gefunden.
          </p>
        )}
      </div>
      
      {!showAddForm ? (
        <button 
          className="btn-secondary" 
          style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} /> Spiel fehlt? Aus Datenbank importieren
        </button>
      ) : (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px dashed var(--primary)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>BoardGameGeek Datenbank durchsuchen</h4>
          <form onSubmit={handleBggSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="z.B. Andor" 
              value={bggQuery}
              onChange={e => setBggQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={isSearching}>
              {isSearching ? <Loader size={16} className="spin" /> : 'Suchen'}
            </button>
          </form>

          {bggResults.length > 0 && (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bggResults.map(res => (
                <li key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                  <div>
                    <strong>{res.name}</strong> <span style={{ color: 'var(--muted-text)', fontSize: '0.8rem' }}>({res.year})</span>
                    {res.type === 'boardgameexpansion' && <span className="badge" style={{ fontSize: '0.6rem', marginLeft: '0.5rem' }}>Erweiterung</span>}
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => handleAddBggGame(res)}
                    disabled={isSearching}
                  >
                    Importieren
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => { setShowAddForm(false); setBggResults([]); setBggQuery(''); }}>
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
