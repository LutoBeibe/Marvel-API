import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMarvelCharacterDetails } from '../../services/marvelApi';
import styles from './CharacterDetail.module.css'; // CSS Module

// Tipos para o personagem e quadrinho
interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

interface Comic {
  title: string;
  onSaleDate: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtém o ID do parâmetro da URL
  const [character, setCharacter] = useState<Character | null>(null); // Estado do personagem
  const [comics, setComics] = useState<Comic[]>([]); // Estado dos quadrinhos
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento
  const [favorites, setFavorites] = useState<number[]>([]); // Estado dos favoritos
  const [comicCount, setComicCount] = useState<number>(0); // Contagem de quadrinhos
  const [movieCount, setMovieCount] = useState<number>(0); // Contagem de filmes
  const [rating, setRating] = useState<number | null>(null); // Avaliação do personagem
  const [lastComicDate, setLastComicDate] = useState<string | null>(null); // Data do último quadrinho
  const [search, setSearch] = useState<string>(''); // Estado para armazenar o texto da pesquisa

  // Efeito para buscar detalhes do personagem quando o componente for montado ou quando o ID mudar
  useEffect(() => {
    const fetchCharacterDetails = async () => {
      if (id) {
        setLoading(true);
        const {
          characterData,
          comicsData,
          comicCount,
          movieCount,
          rating,
          lastComicDate: lastComicDateFromApi,
        } = await getMarvelCharacterDetails(Number(id));
  
        setCharacter(characterData);
        setComics(comicsData);
        setComicCount(comicCount);
        setMovieCount(movieCount);
        setRating(rating ? Number(rating) : null); // Certifique-se de que `rating` é do tipo correto
        setLastComicDate(lastComicDateFromApi); // Atribuindo a data do último quadrinho
        setLoading(false);
      }
    };
  
    // Recupera os favoritos do localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  
    fetchCharacterDetails();
  }, [id]);
  


  // Função para alternar o estado de favorito
  const toggleFavorite = (characterId: number) => {
    const newFavorites = favorites.includes(characterId)
      ? favorites.filter((id) => id !== characterId)
      : [...favorites, characterId];

    if (newFavorites.length > 5) {
      alert('Você pode favoritar no máximo 5 personagens.');
    } else {
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };
  

  // Função para formatar a data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  };

  // Se estiver carregando, exibe o indicador de carregamento
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

  // Se o personagem não for encontrado, exibe uma mensagem
  if (!character) {
    return <div>Personagem não encontrado.</div>;
  }

  // Verifica se o personagem está nos favoritos
  const isFavorite = favorites.includes(character.id);

  return (
    <div className={styles['character-detail-page']}>
      <header className={styles['header']}>
        <Link to="/" className={styles['logo-link']}>
          <img 
            src="/assets/logo/Group@1,5x.svg" 
            alt="Marvel" 
            className={styles['logo']} 
          />
        </Link>

        {/* Barra de pesquisa */}
        <div className={styles['search-bar-container']}>
          <input
            type="text"
            placeholder="Procure por heróis - Ainda não funcionando"
            className={styles['search-bar']}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className={styles['character-container']}>
        {/* Imagem e detalhes do personagem */}
        <div className={styles['character-image']}>
          <img
            src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
            alt={character.name}
          />
        </div>

        <div className={styles['character-details']}>
          <div className={styles['character-name-container']}>
            <h1>{character.name}</h1>
            <button className={styles['favorite-button']} onClick={() => toggleFavorite(character.id)}>
              <img
                src={isFavorite ? '/assets/icones/heart/Path.svg' : '/assets/icones/heart/Path Copy 2@1,5x.svg'}
                alt={isFavorite ? 'Favorito' : 'Não Favorito'}
                className={styles['favorite-icon']}
              />
            </button>
          </div>

          <p>{character.description || 'Sem descrição disponível'}</p>

          <div className={styles['additional-info']}>
            {/* Informações adicionais sobre filmes e quadrinhos */}
            <div className={styles['info-row']}>
              <div className={styles['info-item']}>
                <p><strong>Filmes</strong></p>
                <img 
                  src="/assets/icones/book/Group@1,5x.svg" 
                  alt="Filmes" 
                  className={styles['info-icon']}
                />
                <span><strong>{movieCount}</strong></span>
              </div>
              <div className={styles['info-item']}>
                <p><strong>Quadrinhos</strong></p>
                <img 
                  src="/assets/icones/video/Shape@1,5x.svg" 
                  alt="Quadrinhos" 
                  className={styles['info-icon']}
                />
                <span><strong>{comicCount}</strong></span>
              </div>
            </div>

            {/* Exibe a avaliação */}
            <div className={styles['info-row']}>
              <div className={styles['rating']}>
                <p><strong>Avaliação:</strong></p>
                
                {rating && rating > 3 ? (
                  <img 
                    src="/assets/review/Group 4@1,5x.svg" 
                    alt="Avaliação Alta"
                    className={styles['rating-image']}
                  />
                ) : (
                  <img 
                    src="/assets/review/Path@1,5x.svg" 
                    alt="Avaliação Baixa"
                    className={styles['rating-image']}
                  />
                )}
              </div>
            </div>

            {/* Data do último quadrinho */}
            <div className={styles['info-row']}>
              <span><strong>Data do Último Quadrinho:</strong></span>
              <span>{formatDate(lastComicDate) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quadrinhos do personagem */}
      <div className={styles['character-comics']}>
        <h2>Últimos lançamentos</h2>
        <div className={styles['comics-grid']}>
          {comics.slice(0, 10).map((comic, index) => (
            <div key={index} className={styles['comic-item']}>
              <img
                src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                alt={comic.title}
              />
              <h3>{comic.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <footer className={styles['footer']}>
        <p>Feito por Guilherme Medeiros 💜</p>
      </footer>
    </div>
  );
};

export default CharacterDetail;
