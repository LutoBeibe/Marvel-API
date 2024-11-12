import axios, { AxiosInstance } from 'axios';
import { md5 } from 'js-md5';

// Substitua pelas suas chaves
const PUBLIC_KEY = '63484ecf52f4fdba3424ad7677ed4582'; //chave publica
const PRIVATE_KEY = 'a2ecf57067bff919e612e311268389107b2f4dcc'; // chave privada
const timestamp = new Date().getTime();
const hash = md5(timestamp + PRIVATE_KEY + PUBLIC_KEY);

// Tipando a instância do axios
const marvelApi: AxiosInstance = axios.create({
  baseURL: 'https://gateway.marvel.com/v1/public/',
  params: {
    ts: timestamp,
    apikey: PUBLIC_KEY,
    hash: hash,
  },
});

// Função para obter personagens
export const getMarvelCharacters = async (limit: number = 20) => {
  try {
    const response = await marvelApi.get('characters', { params: { limit } });
    return response.data.data.results;
  } catch (error) {
    console.error('Erro ao buscar personagens', error);
    return [];
  }
};
