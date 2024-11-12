import axios, { AxiosInstance } from 'axios';
import {md5 } from 'js-md5';

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

// Função para buscar todos os personagens
export const getMarvelCharacters = async () => {
  try {
    const response = await marvelApi.get('characters', {
      params: {
        limit: 20, // Limite de 20 personagens por requisição, pode ajustar conforme necessário
      },
    });
    return response.data.data.results;
  } catch (error) {
    console.error('Erro ao buscar personagens', error);
    return [];
  }
};

// Função para obter os detalhes de um personagem e seus quadrinhos
export const getMarvelCharacterDetails = async (characterId: number) => {
  try {
    // Buscar detalhes do personagem
    const characterResponse = await marvelApi.get(`characters/${characterId}`);
    const characterData = characterResponse.data.data.results[0];

    // Buscar quadrinhos deste personagem, limitando a 10 e ordenando por onSaleDate
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
