import React, { useEffect, useState } from 'react';
import { getMarvelCharacters } from '../services/marvelApi';

interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

const MarvelCharacters: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(''); // Estado para o filtro de busca
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Estado para a ordenação

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      const data = await getMarvelCharacters();
      setCharacters(data);
      setLoading(false);
    };
    fetchCharacters();
  }, []);

  // Função para ordenar os personagens
  const sortCharacters = (characters: Character[], order: 'asc' | 'desc') => {
    return characters.sort((a, b) => {
      if (a.name < b.name) return order === 'asc' ? -1 : 1;
      if (a.name > b.name) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Função para filtrar os personagens pelo nome
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.toLowerCase())
  );

  // Aplicar ordenação após filtrar
  const sortedAndFilteredCharacters = sortCharacters(filteredCharacters, sortOrder);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Personagens da Marvel</h1>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '5px', marginBottom: '20px', width: '200px' }}
      />

      {/* Botões de ordenação */}
      <div>
        <button onClick={() => setSortOrder('asc')}>Ordenar A-Z</button>
        <button onClick={() => setSortOrder('desc')}>Ordenar Z-A</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {sortedAndFilteredCharacters.map((character) => (
          <div key={character.id} style={{ margin: 10, width: 200 }}>
            <img
              src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
              alt={character.name}
              style={{ width: '100%' }}
            />
            <h3>{character.name}</h3>
            <p>{character.description || 'Sem descrição'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarvelCharacters;
