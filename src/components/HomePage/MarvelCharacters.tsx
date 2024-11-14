import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarvelCharacters } from '../../services/marvelApi';
import styles from './MarvelCharacters.module.css';
import debounce from 'lodash.debounce'; // Importando o debounce

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
  const [search, setSearch] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCharacters, setTotalCharacters] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const itemsPerPage = 20;

  const fetchCharacters = async () => {
    setLoading(true);
    const { results, total } = await getMarvelCharacters(currentPage, itemsPerPage, search);
    setCharacters(results);
    setTotalCharacters(total);
    setTotalPages(Math.ceil(total / itemsPerPage));
    setLoading(false);
  };

  const debounceFetchCharacters = debounce(fetchCharacters, 1000); // 500ms de delay

  const toggleFavorite = (characterId: number) => {
    let newFavorites;
    if (favorites.includes(characterId)) {
      newFavorites = favorites.filter((id) => id !== characterId);
    } else {
      if (favorites.length < 5) {
        newFavorites = [...favorites, characterId];
      } else {
        alert('Você pode favoritar no máximo 5 personagens.');
        return;
      }
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const sortCharacters = (characters: Character[], order: 'asc' | 'desc') => {
    return characters.sort((a, b) => {
      if (a.name < b.name) return order === 'asc' ? -1 : 1;
      if (a.name > b.name) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadAllFavorites = () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  };

  const displayedCharacters = showFavoritesOnly
    ? characters.filter((character) => favorites.includes(character.id))
    : filteredCharacters;

  const sortedAndFilteredCharacters = sortCharacters(displayedCharacters, sortOrder);

  useEffect(() => {
    debounceFetchCharacters(); // Usando o debounce ao invés de chamar fetchCharacters diretamente
  }, [currentPage, search]);

  useEffect(() => {
    loadAllFavorites();
  }, []);

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <img 
          src="/assets/icones/heroi/noun_Superhero_2227044@1,5x.svg" 
          alt="Carregando..."
        />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>
        <Link to="/" onClick={() => window.location.reload()} className={styles['logo-container']}>
          <img 
            src="/assets/logo/Group@1,5x.svg" 
            alt="Personagens da Marvel" 
            className={styles['logo']}
          />
        </Link>
      </h1>
      <div className={styles['explore-text']}>
        <p className={styles['explore-title']}>EXPLORE O UNIVERSO</p>
        <p className={styles['explore-description']}>
          Mergulhe no domínio deslumbrante de todos os personagens clássicos que você ama - e aqueles que você descobrirá em breve.
        </p>
      </div>
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchCharacters();
        }}
        className={styles['search-form']}
      >
        <button disabled className={styles['search-btn']}>
          <img src="/assets/busca/Lupa/Shape@1,5x.svg" alt="Buscar" className={styles['search-btn-img']} />
        </button>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // O debounce será acionado aqui
          className={styles['search-input']}
        />
      </form>

      <div className={styles['info-container']}>
        <p>Total de personagens disponíveis: {totalCharacters}</p>
        <div className={styles['right-items']}>
          <div className={styles['switch-container']}>
            <img 
              src="/assets/icones/heroi/noun_Superhero_2227044@1,5x.svg"
              alt="Ícone de Ordenação"
              className={styles['sort-icon']}
            />
            <span className={styles['switch-label']}>
              Ordenar A-Z
            </span>
            <label className={styles['switch']}>
              <input
                type="checkbox"
                checked={sortOrder === 'desc'}
                onChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              />
              <span className={styles['slider']}></span>
            </label>
          </div>

          <div className={styles['favorites-toggle']} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
            <span className={styles['favorites-icon']}>
              <img
                src={showFavoritesOnly ? '/assets/icones/heart/Path.svg' : '/assets/icones/heart/Path Copy 2@1,5x.svg'}
                alt="Coração"
                className={styles['heart-icon']}
              />
            </span>
            <span className={styles['favorites-text']}>{showFavoritesOnly ? 'Mostrar Todos' : 'Somente Favoritos'}</span>
          </div>
        </div>
      </div>

      <div className={styles['character-container']}>
        {sortedAndFilteredCharacters.map((character) => (
          <div key={character.id} className={styles['character-card']}>
            <Link to={`/character/${character.id}`}>
              <img
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt={character.name}
              />
            </Link>
            <div className={styles['character-header']}>
              <h3>{character.name}</h3>
              <button onClick={() => toggleFavorite(character.id)} className={styles['favorite-button']}>
                <img
                  src={favorites.includes(character.id)
                    ? '/assets/icones/heart/Path@1,5x.svg'
                    : '/assets/icones/heart/Path Copy 2@1,5x.svg'}
                  alt={favorites.includes(character.id) ? 'Favoritado' : 'Não favoritado'}
                  className={styles['favorite-icon']}
                  style={{ width: '25px', height: '25px' }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles['footer']}>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>
    </div>
  );
};

export default MarvelCharacters;
