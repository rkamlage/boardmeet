import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ExternalLink, Search, Plus, Loader } from 'lucide-react';
import { TOP_GAMES } from '../data/gamesData';

export default function GameSearch({ eventId }) {
  const { gamesCatalog, addGameToCatalog, addGameToEvent, events } = useStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Manual Entry States
  const [manualName, setManualName] = useState('');
  const [manualLink, setManualLink] = useState('');
  const [manualIcon, setManualIcon] = useState('🎲');

  const event = events.find(e => e.id === eventId);
  const existingGameIds = event ? event.games.map(g => g.id) : [];

  const allGames = [...TOP_GAMES, ...gamesCatalog].reduce((acc, curr) => {
    if (!acc.find(g => g.id === curr.id)) acc.push(curr);
    return acc;
  }, []);

  const filteredGames = allGames.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase()) && !existingGameIds.includes(g.id)
  );



  const handleAddManualGame = async (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    setIsSearching(true);
    try {
      const addedGame = await addGameToCatalog({
        name: manualName,
        icon: manualIcon,
        description: manualLink ? `Link: ${manualLink}` : '',
        isExpansion: false,
        bggImage: null
      });
      await addGameToEvent(eventId, addedGame.id, addedGame.name);
      setManualName('');
      setManualLink('');
      setManualIcon('🎲');
      setShowAddForm(false);
    } catch (err) {
      // Error handled in StoreContext
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-background rounded-xl p-4 border border-slate-200">
      <div className="flex items-center bg-card border border-slate-300 rounded-xl px-3 mb-4 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Spiel suchen (z.B. Catan)..."
          className="w-full p-3 bg-transparent text-text outline-none font-medium"
        />
      </div>

      <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredGames.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {filteredGames.map(g => (
              <li key={g.id} className="flex justify-between items-center p-4 bg-card rounded-xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all">
                <div className="flex gap-4 items-start flex-1 pr-4">
                  {g.bggImage ? (
                    <img src={g.bggImage} alt={g.name} className="w-12 h-12 object-cover rounded-lg shadow-sm border border-slate-100" />
                  ) : (
                    <div className="text-3xl drop-shadow-sm w-12 text-center">{g.icon}</div>
                  )}
                  <div>
                    <strong className="flex items-center gap-2 text-text font-bold">
                      {g.name}
                      {g.isExpansion && <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide shadow-sm">Erweiterung</span>}
                    </strong>
                    <div className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                      {g.description}
                    </div>
                    {g.link && (
                      <a href={g.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2 font-bold uppercase tracking-wider">
                        BGG <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
                <button 
                  className="bg-primary hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center shadow-sm transition-all text-sm shrink-0" 
                  onClick={async () => {
                    let gameIdToUse = g.id;
                    const exists = gamesCatalog.some(c => c.id === g.id);
                    if (!exists) {
                      // Predefined game not in DB yet
                      try {
                        const added = await addGameToCatalog({
                          name: g.name,
                          icon: g.icon,
                          description: g.description,
                          isExpansion: g.isExpansion || false,
                          bggImage: null
                        });
                        gameIdToUse = added.id;
                      } catch (err) {
                        alert("Fehler beim Hinzufügen des Spiels zur Datenbank.");
                        return;
                      }
                    }
                    await addGameToEvent(eventId, gameIdToUse, g.name);
                    setQuery('');
                  }}
                >
                  <Plus size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted text-sm font-medium mb-3">Kein Spiel gefunden.</p>
            <button 
              className="text-primary hover:text-indigo-600 font-bold text-sm underline underline-offset-2"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              Nicht dabei? Spiel aus BoardGameGeek hinzufügen
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="mt-6 pt-6 border-t border-slate-200 bg-card -mx-4 -mb-4 p-6 rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-text">Spiel manuell zur Datenbank hinzufügen</h4>
            <button onClick={() => setShowAddForm(false)} className="text-xs font-bold text-muted hover:text-red-500">Abbrechen</button>
          </div>
          
          <form onSubmit={handleAddManualGame} className="flex flex-col gap-3">
            <input 
              type="text" 
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Name des Spiels (z.B. Monopoly)"
              className="w-full p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm font-medium"
              required
            />
            
            <div className="flex gap-3">
              <input 
                type="text" 
                value={manualIcon}
                onChange={(e) => setManualIcon(e.target.value)}
                placeholder="Emoji (🎲)"
                className="w-20 p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary text-center transition-all text-sm"
                maxLength={2}
              />
              <input 
                type="url" 
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                placeholder="Link zu Google / BGG (Optional)"
                className="flex-1 p-3 border border-slate-300 rounded-xl bg-background text-text focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
            
            <button type="submit" className="mt-2 bg-primary hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2" disabled={isSearching}>
              {isSearching ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSearching ? 'Speichern...' : 'Spiel erstellen & hinzufügen'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
