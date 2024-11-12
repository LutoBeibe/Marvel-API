import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  // Função para buscar personagens com base no search (só é chamada quando o formulário for enviado)
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
  }, [currentPage]); // Não dependa mais de search, para não buscar toda vez que search mudar

  useEffect(() => {
    loadAllFavorites(); // Carrega favoritos ao iniciar
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>
        {/* Ao clicar no título, recarrega a página */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => window.location.reload()}>
          Personagens da Marvel
        </Link>
      </h1>

      {/* Formulário de busca com botão de enviar */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Impede o comportamento padrão do formulário (não recarregar a página)
          fetchCharacters(); // Chama a função para buscar personagens com o termo de pesquisa
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Atualiza o valor do campo de busca
          style={{ padding: '5px', marginBottom: '20px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '5px 10px', marginLeft: '10px' }}>
          Buscar
        </button>
      </form>

      {/* Contador de personagens disponíveis na API */}
      <div>
        <p>Total de personagens disponíveis: {totalCharacters}</p>
      </div>

      {/* Botões de ordenação */}
      <div>
        <button onClick={() => setSortOrder('asc')}>Ordenar A-Z</button>
        <button onClick={() => setSortOrder('desc')}>Ordenar Z-A</button>
      </div>

      {/* Botão para alternar entre favoritos */}
      <div>
        <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          {showFavoritesOnly ? 'Mostrar Todos' : 'Mostrar Apenas Favoritos'}
        </button>
      </div>

      {/* Renderizando a lista de personagens */}
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

            <Link to={`/character/${character.id}`}>
              <button>Ver Detalhes</button>
            </Link>

            <button onClick={() => toggleFavorite(character.id)}>
              {favorites.includes(character.id) ? 'Desfavoritar' : 'Favoritar'}
            </button>
          </div>
        ))}
      </div>

      {/* Navegação entre as páginas */}
      <div>
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
