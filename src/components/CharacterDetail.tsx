import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getMarvelCharacterDetails } from '../services/marvelApi';
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

interface Comic {
  title: string;
  onSaleDate: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID do personagem passado pela URL
  const [character, setCharacter] = useState<Character | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<number[]>([]); // Lista de favoritos

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      if (id) {
        setLoading(true);
        const { characterData, comicsData } = await getMarvelCharacterDetails(Number(id));
        setCharacter(characterData);
        setComics(comicsData);
        setLoading(false);
      }
    };

    // Carregar favoritos do localStorage ao montar o componente
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    fetchCharacterDetails();
  }, [id]);

   // Função para favoritar ou desfavoritar um personagem
   const toggleFavorite = (characterId: number) => {
    // Verifica se o personagem já está nos favoritos
    if (favorites.includes(characterId)) {
      // Se já estiver, desfavorece (remove)
      const newFavorites = favorites.filter((id) => id !== characterId);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites)); // Atualiza no localStorage
    } else {
      // Se não estiver, verifica o limite de 5 favoritos
      if (favorites.length < 5) {
        const newFavorites = [...favorites, characterId];
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites)); // Atualiza no localStorage
      } else {
        alert('Você pode favoritar no máximo 5 personagens.');
      }
    }
  };


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
  

  if (!character) return <div>Personagem não encontrado.</div>;

   // Verifica se o personagem está nos favoritos
   const isFavorite = favorites.includes(character.id);


  return (
    <div>
        {/* Texto "Personagens da Marvel" clicável que direciona para a página inicial */}
      <h1>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Personagens da Marvel
        </Link>
      </h1>
      <h1>{character.name}</h1>
      <img
        src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
        alt={character.name}
        style={{ width: '200px', height: 'auto' }}
      />
      <p>{character.description || 'Sem descrição disponível'}</p>

       {/* Botão para favoritar ou desfavoritar */}
       <button onClick={() => toggleFavorite(character.id)}>
        {isFavorite ? 'Desfavoritar' : 'Favoritar'}
      </button>

      <h2>Últimos 10 Quadrinhos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {comics.map((comic, index) => (
          <div key={index} style={{ margin: 10, width: 200 }}>
            <img
              src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
              alt={comic.title}
              style={{ width: '100%', height: 'auto' }}
            />
            <h3>{comic.title}</h3>
            {/* <p>{new Date(comic.onSaleDate).toLocaleDateString()}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterDetail;