import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMarvelCharacterDetails } from '../../services/marvelApi';
import styles from './CharacterDetail.module.css'; // Modificando para usar o CSS Module

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
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [comicCount, setComicCount] = useState<number>(0);
  const [movieCount, setMovieCount] = useState<number>(0);
  const [rating, setRating] = useState<number | null>(null);
  const [lastComicDate, setLastComicDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      if (id) {
        setLoading(true);
        const { characterData, comicsData, comicCount, movieCount, rating, lastComicDate } = await getMarvelCharacterDetails(Number(id));
        
        setCharacter(characterData);
        setComics(comicsData);
        setComicCount(comicCount);
        setMovieCount(movieCount);
        setRating(rating);
        setLastComicDate(lastComicDate);
        setLoading(false);
      }
    };

    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    fetchCharacterDetails();
  }, [id]);

  const toggleFavorite = (characterId: number) => {
    if (favorites.includes(characterId)) {
      const newFavorites = favorites.filter((id) => id !== characterId);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      if (favorites.length < 5) {
        const newFavorites = [...favorites, characterId];
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
      } else {
        alert('Você pode favoritar no máximo 5 personagens.');
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long', // Exibe o nome completo do mês
      day: '2-digit', // Exibe o dia com dois dígitos
    });
  };

  
  <div className={styles['info-row']}>
    <p><strong>Data do Último Quadrinho:</strong> {formatDate(lastComicDate)}</p>
  </div>
  
  const [search, setSearch] = useState<string>(''); // Estado para armazenar o texto da pesquisa
  
  const fetchCharacters = async () => {
    setLoading(true);  // Inicia o carregamento
    const { results, total } = await getMarvelCharacters(currentPage, itemsPerPage, search);  // Chama a API
    setCharacters(results);  // Atualiza os personagens
    setTotalCharacters(total);  // Atualiza o número total de personagens
    setTotalPages(Math.ceil(total / itemsPerPage));  // Atualiza o total de páginas
    setLoading(false);  // Finaliza o carregamento
  };
  

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

  if (!character) return <div>Personagem não encontrado.</div>;

  const isFavorite = favorites.includes(character.id);

  return (
    <div className={styles['character-detail-page']}>
    <header className={styles['header']}>
  <Link to="/" className={styles['logo-link']}>
    <img src="/assets/logo/Group@1,5x.svg" alt="Marvel" className={styles['logo']} />
  </Link>

  <div className={styles['search-bar-container']}>
    <input
      type="text"
      placeholder="Procure por heróis - Não ta funcionando ainda =("
      className={styles['search-bar']}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    
  </div>
</header>




      <div className={styles['character-container']}>
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
          <div className={styles['info-row']}>
            <span><strong>Data do Último Quadrinho</strong></span>
          </div>
          <span><strong>{formatDate(lastComicDate) ?? 'N/A'}</strong></span>  

          </div>
        </div>
      </div>

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
<footer className={styles['footer']}>
    <p>Feito por Guilherme Medeiros 💜</p>
  </footer>
    </div>
  );
};

export default CharacterDetail;
