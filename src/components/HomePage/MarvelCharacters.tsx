import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarvelCharacters } from '../../services/marvelApi';
import styles from './MarvelCharacters.module.css';
import debounce from 'lodash.debounce'; // Importando o debounce

// Definição da interface para o personagem
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
  // Estado do componente
  const [characters, setCharacters] = useState<Character[]>([]);  // Lista de personagens
  const [loading, setLoading] = useState<boolean>(false);  // Estado de carregamento
  const [search, setSearch] = useState<string>('');  // Valor da busca
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');  // Ordem de ordenação
  const [favorites, setFavorites] = useState<number[]>([]);  // Lista de favoritos
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);  // Exibir apenas favoritos
  const [currentPage, setCurrentPage] = useState<number>(1);  // Página atual
  const [totalCharacters, setTotalCharacters] = useState<number>(0);  // Total de personagens
  const [totalPages, setTotalPages] = useState<number>(0);  // Total de páginas
  const itemsPerPage = 20; // Número de itens por página

  // Função para buscar os personagens
  const fetchCharacters = async () => {
    setLoading(true); // Ativa o carregamento
    const { results, total } = await getMarvelCharacters(currentPage, itemsPerPage, search); // Chama a API para obter os personagens
    setCharacters(results); // Atualiza a lista de personagens
    setTotalCharacters(total); // Atualiza o total de personagens
    setTotalPages(Math.ceil(total / itemsPerPage)); // Calcula o total de páginas
    setLoading(false); // Desativa o carregamento
  };

  // Debounce para otimizar a busca
  const debounceFetchCharacters = debounce(fetchCharacters, 750);

  // Função para alternar o status de favorito
  const toggleFavorite = (characterId: number) => {
    let newFavorites;
    if (favorites.includes(characterId)) {
      newFavorites = favorites.filter((id) => id !== characterId); // Remove dos favoritos
    } else {
      if (favorites.length < 5) {
        newFavorites = [...favorites, characterId]; // Adiciona aos favoritos
      } else {
        alert('Você pode favoritar no máximo 5 personagens.');
        return;
      }
    }
    setFavorites(newFavorites); // Atualiza o estado de favoritos
    localStorage.setItem('favorites', JSON.stringify(newFavorites)); // Salva os favoritos no localStorage
  };

  // Função para ordenar os personagens por nome
  const sortCharacters = (characters: Character[], order: 'asc' | 'desc') => {
    return characters.sort((a, b) => {
      if (a.name < b.name) return order === 'asc' ? -1 : 1;
      if (a.name > b.name) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Função para carregar os favoritos do localStorage
  const loadAllFavorites = () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites)); // Carrega os favoritos armazenados
    }
  };

  // Filtra os personagens com base na busca
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filtra os personagens para mostrar apenas os favoritos, se necessário
  const displayedCharacters = showFavoritesOnly
    ? characters.filter((character) => favorites.includes(character.id))
    : filteredCharacters;

  // Ordena e filtra os personagens
  const sortedAndFilteredCharacters = sortCharacters(displayedCharacters, sortOrder);

  // Efeito para buscar os personagens quando a página ou busca muda
  useEffect(() => {
    debounceFetchCharacters(); // Usando debounce ao invés de chamar fetchCharacters diretamente
  }, [currentPage, search]);

  // Efeito para carregar os favoritos ao iniciar o componente
  useEffect(() => {
    loadAllFavorites();
  }, []);

  // Exibe a tela de carregamento enquanto os dados não são carregados
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
      
      {/* Formulário de busca */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchCharacters();
        }}
        className={styles['search-form']}
      >
        <button disabled className={styles['search-btn']}>
          <img
            src="/assets/busca/Lupa/Shape@1,5x.svg"
            alt="Buscar"
            className={styles['search-btn-img']}
          />
        </button>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // O debounce será acionado aqui
          className={styles['search-input']}
        />
      </form>

      {/* Informações de filtro e ordenação */}
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

          {/* Alternar para mostrar apenas favoritos */}
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

      {/* Exibe a lista de personagens */}
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

      {/* Navegação de páginas */}
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
