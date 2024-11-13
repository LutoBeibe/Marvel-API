import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarvelCharacters } from '../services/marvelApi';
import './MarvelCharacters.css';

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
  const [characters, setCharacters] = useState<Character[]>([]);  // Lista de personagens
  const [loading, setLoading] = useState<boolean>(false);  // Indicador de carregamento
  const [search, setSearch] = useState<string>('');  // Filtro de busca
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');  // Ordenação
  const [favorites, setFavorites] = useState<number[]>([]);  // Favoritos
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);  // Mostrar apenas favoritos
  const [currentPage, setCurrentPage] = useState<number>(1);  // Página atual
  const [totalCharacters, setTotalCharacters] = useState<number>(0);  // Total de personagens
  const [totalPages, setTotalPages] = useState<number>(0); // Total de páginas
  const itemsPerPage = 20; // Número de personagens por página

  // Função para buscar personagens com base no search (somente chamada quando o botão for pressionado)
  const fetchCharacters = async () => {
    setLoading(true);
    const { results, total } = await getMarvelCharacters(currentPage, itemsPerPage, search); // Passa o searchTerm para a API
    setCharacters(results);
    setTotalCharacters(total);  // Atualiza o total de personagens
    setTotalPages(Math.ceil(total / itemsPerPage)); // Atualiza o total de páginas
    setLoading(false);
  };

  // Função para favoritar ou desfavoritar um personagem
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
    localStorage.setItem('favorites', JSON.stringify(newFavorites));  // Armazenar no localStorage
  };

  // Função para ordenar os personagens por nome
  const sortCharacters = (characters: Character[], order: 'asc' | 'desc') => {
    return characters.sort((a, b) => {
      if (a.name < b.name) return order === 'asc' ? -1 : 1;
      if (a.name > b.name) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Função para filtrar os personagens pelo nome (busca em todos os carregados)
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.toLowerCase())
  );

  // Carregar todos os favoritos, independentemente da página
  const loadAllFavorites = () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  };

  // Filtrando para mostrar apenas os favoritos se o estado `showFavoritesOnly` for true
  const displayedCharacters = showFavoritesOnly
    ? characters.filter((character) => favorites.includes(character.id)) // Exibe todos os favoritos, não apenas os da página atual
    : filteredCharacters;

  // Aplicar ordenação após filtrar
  const sortedAndFilteredCharacters = sortCharacters(displayedCharacters, sortOrder);

  // Recarregar personagens quando a página mudar
  useEffect(() => {
    fetchCharacters(); // Só chamamos fetchCharacters aqui
  }, [currentPage, search]); // Agora vai atualizar quando a pesquisa ou página mudar

  useEffect(() => {
    loadAllFavorites(); // Carrega favoritos ao iniciar
  }, []);
  if (loading) {
    return (
      <div className="loading-container">
        <img 
          src="/assets/icones/heroi/noun_Superhero_2227044@1,5x.svg" // Coloque o caminho correto para sua imagem
          alt="Carregando..."
        />
        <p>Carregando...</p> {/* Texto abaixo da imagem */}
      </div>
    );
  }
  

  return (
    <div>
      <h1>
        <Link to="/" onClick={() => window.location.reload()} className="logo-container">
          <img 
            src="/assets/logo/Group@1,5x.svg" 
            alt="Personagens da Marvel" 
            className="logo"
          />
        </Link>
      </h1>
      <div className="explore-text">
        <p className="explore-title">EXPLORE O UNIVERSO</p>
        <p className="explore-description">
          Mergulhe no domínio deslumbrante de todos os personagens clássicos que você ama - e aqueles que você descobrirá em breve.
        </p>
      </div>
      
      {/* Formulário de busca */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Impede o comportamento padrão do formulário
          fetchCharacters(); // Passa o valor do termo de pesquisa para a função
        }}
        className="search-form"
      >
        <button disabled className="search-btn">
          <img src="/assets/busca/Lupa/Shape@1,5x.svg" alt="Buscar" className="search-btn-img" />
        </button>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Atualiza o valor do campo de busca
          className="search-input"
        />
      </form>

      <div className="info-container">
        <p>Total de personagens disponíveis: {totalCharacters}</p>
        <div className="right-items">
        <div className="switch-container">
        <img 
    src="/assets/icones/heroi/noun_Superhero_2227044@1,5x.svg"  // Caminho para sua imagem
    alt="Ícone de Ordenação"
    className="sort-icon"  // Classe para o ícone
  />
  <span className="switch-label">
    Ordenar A-Z
  </span>
 
  <label className="switch">
    <input
      type="checkbox"
      checked={sortOrder === 'desc'}
      onChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
    />
    <span className="slider"></span>
  </label>
</div>

          <div className="favorites-toggle" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
            <span className="favorites-icon">
              <img
                src={showFavoritesOnly ? '/assets/icones/heart/Path.svg' : '/assets/icones/heart/Path Copy 2@1,5x.svg'}
                alt="Coração"
                className="heart-icon"
              />
            </span>
            <span className="favorites-text">{showFavoritesOnly ? 'Mostrar Todos' : 'Somente Favoritos'}</span>
          </div>
        </div>
      </div>

      <div className="character-container">
        {sortedAndFilteredCharacters.map((character) => (
          <div key={character.id} className="character-card">
            <Link to={`/character/${character.id}`}>
              <img
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt={character.name}
              />
            </Link>
            <div className="character-header">
              <h3>{character.name}</h3>
              <button onClick={() => toggleFavorite(character.id)} className="favorite-button">
                <img
                  src={favorites.includes(character.id)
                    ? '/assets/icones/heart/Path@1,5x.svg'
                    : '/assets/icones/heart/Path Copy 2@1,5x.svg'}
                  alt={favorites.includes(character.id) ? 'Favoritado' : 'Não favoritado'}
                  className="favorite-icon"
                  style={{ width: '25px', height: '25px' }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
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
