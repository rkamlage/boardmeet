export const searchBgg = async (query) => {
  try {
    const res = await fetch(`https://api.geekdo.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame,boardgameexpansion`);
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 5); // get top 5
    
    const results = items.map(item => ({
      id: item.getAttribute('id'),
      type: item.getAttribute('type'),
      name: item.querySelector('name')?.getAttribute('value') || 'Unknown',
      year: item.querySelector('yearpublished')?.getAttribute('value') || ''
    }));

    return results;
  } catch (err) {
    console.error("BGG Search Error:", err);
    return [];
  }
};

export const getBggDetails = async (id) => {
  try {
    const res = await fetch(`https://api.geekdo.com/xmlapi2/thing?id=${id}`);
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    
    const item = doc.querySelector('item');
    if (!item) return null;

    let description = item.querySelector('description')?.textContent || '';
    // decode html entities and shorten
    description = description.replace(/&#10;/g, ' ').replace(/&mdash;/g, '-').replace(/<br\/>/g, ' ');
    if (description.length > 150) description = description.substring(0, 147) + '...';

    return {
      id,
      name: item.querySelector('name[type="primary"]')?.getAttribute('value') || 'Unknown',
      thumbnail: item.querySelector('thumbnail')?.textContent || null,
      image: item.querySelector('image')?.textContent || null,
      description
    };
  } catch (err) {
    console.error("BGG Detail Error:", err);
    return null;
  }
};
