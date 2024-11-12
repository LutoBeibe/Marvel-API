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
}

// Função para buscar personagens com paginação e filtro por nome
export const getMarvelCharacters = async (page: number, limit: number, searchTerm?: string): Promise<{ results: Character[], total: number }> => {
  try {
    const offset = (page - 1) * limit; // Cálculo do offset para a página

    // Criar objeto de parâmetros para a requisição
    const params: { [key: string]: any } = {
      limit: limit,
      offset: offset,
    };

    // Se o termo de busca for fornecido, adicionar o filtro `nameStartsWith` nos parâmetros
    if (searchTerm) {
      params.nameStartsWith = searchTerm;
    }

    const response = await marvelApi.get('characters', {
      params: params,
    });

    const data = response.data.data;

    return {
      results: data.results as Character[], // Garantindo o tipo correto
      total: data.total, // Total de personagens
    };
  } catch (error) {
    console.error('Erro ao buscar personagens', error);
    return { results: [], total: 0 };
  }
};

// Função para obter os detalhes de um personagem e seus quadrinhos
export const getMarvelCharacterDetails = async (characterId: number) => {
  try {
    const characterResponse = await marvelApi.get(`characters/${characterId}`);
    const characterData = characterResponse.data.data.results[0];

    const comicsResponse = await marvelApi.get(`characters/${characterId}/comics`, {
      params: { limit: 10, orderBy: '-onsaleDate' },
    });
    const comicsData = comicsResponse.data.data.results;

    return { characterData, comicsData };
  } catch (error) {
    console.error('Erro ao buscar detalhes do personagem ou quadrinhos', error);
    return { characterData: null, comicsData: [] };
  }
};
