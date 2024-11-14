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
        <img src="/assets/logo/Group@1,5x.svg" alt="Marvel" className={styles['logo']} />
        <input type="text" placeholder="Procure por heróis" className={styles['search-bar']} />
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
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <p>{character.description || 'Sem descrição disponível'}</p>
          <div className={styles['additional-info']}>
          <div className={styles['info-row']}>
            <p><strong>Filmes</strong></p>
            <p><strong>Quadrinhos</strong></p>
          </div>

          <div className={styles['info-row']}>
            <p><strong>{movieCount}</strong></p>
            <p><strong>{comicCount}</strong></p>
          </div>
          <div className={styles['info-row']}>
            <p><strong>Avaliação:</strong> {rating ?? 'N/A'}</p>
          </div>
          <div className={styles['info-row']}>
            <p><strong>Data do Último Quadrinho:</strong> {lastComicDate ?? 'N/A'}</p>
          </div>
          </div>
        </div>
      </div>

      <div className={styles['character-comics']}>
        <h2>Últimos lançamentos</h2>
        <div className={styles['comics-grid']}>
          {comics.map((comic, index) => (
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
    </div>
  );
};

export default CharacterDetail;
