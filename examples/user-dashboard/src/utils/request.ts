import axios from 'axios';

export const $ = axios.create({
  timeout: 5000,
  baseURL: '/api'
});
