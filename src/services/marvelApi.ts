import axios, { AxiosInstance } from 'axios';
import { md5 } from 'js-md5';

const PUBLIC_KEY = '63484ecf52f4fdba3424ad7677ed4582';
const PRIVATE_KEY = 'a2ecf57067bff919e612e311268389107b2f4dcc';
const timestamp = new Date().getTime();
const hash = md5(timestamp + PRIVATE_KEY + PUBLIC_KEY);

const marvelApi: AxiosInstance = axios.create({
  baseURL: 'https://gateway.marvel.com/v1/public/',
  params: {
    ts: timestamp,
    apikey: PUBLIC_KEY,
    hash: hash,
  },
});

interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  comics: {
    available: number;
    id: number;
    title: string;
    dates: ComicDate[];
  };
}

interface ComicDate {
  type: string;
  date: string; // Change to 'Date' if 'date' is a Date object instead of a string
}


// Função para buscar personagens com paginação e filtro por nome
export const getMarvelCharacters = async (page: number, limit: number, searchTerm?: string): Promise<{ results: Character[], total: number }> => {
  try {
    const offset = (page - 1) * limit;

    const params: { [key: string]: any } = {
      limit: limit,
      offset: offset,
    };

    if (searchTerm) {
      params.nameStartsWith = searchTerm;
    }

    const response = await marvelApi.get('characters', {
      params: params,
    });

    const data = response.data.data;

    return {
      results: data.results as Character[],
      total: data.total,
    };
  } catch (error) {
    console.error('Erro ao buscar personagens', error);
    return { results: [], total: 0 };
  }
};

// Função para obter os detalhes de um personagem, incluindo quadrinhos e data do último quadrinho
export const getMarvelCharacterDetails = async (characterId: number) => {
  try {
    const characterResponse = await marvelApi.get(`characters/${characterId}`);
    const characterData = characterResponse.data.data.results[0];

    // Obter número total de quadrinhos disponíveis
    const comicCount = characterData.comics.available;

    // Obter os quadrinhos e ordenar pela data de venda para pegar a data do mais recente
    const comicsResponse = await marvelApi.get(`characters/${characterId}/comics`, {
      params: { limit: 10, orderBy: '-onsaleDate' },
    });
    const comicsData = comicsResponse.data.data.results;

    // Encontrar a data do último quadrinho disponível
    const lastComic = comicsData[0];
    const lastComicDate = lastComic?.dates?.find((date: ComicDate) => date.type === 'onsaleDate')?.date ?? null;

    // Definindo valores fictícios ou genéricos para movieCount e rating
    const movieCount = Math.floor(Math.random() * 5);  // Por exemplo, aleatório entre 0 e 4
    const rating = (Math.random() * 5).toFixed(1);     // Rating fictício entre 0.0 e 5.0

    return {
      characterData,
      comicsData,
      comicCount,
      lastComicDate,
      movieCount,
      rating,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do personagem ou quadrinhos', error);
    return { characterData: null, comicsData: [], comicCount: 0, lastComicDate: null, movieCount: 0, rating: 'N/A' };
  }
};


