import axios from 'axios';

// 创建一个 Axios 实例
const api = axios.create({
  baseURL: 'https://baby-dance-api.onrender.com/', // 替换为你的 API 基础 URL
  timeout: 10000, // 请求超时时间
  headers: { 
    'Content-Type': 'application/json', 
  },
});

export const addToNotion = async (data) => {
    const res = await api.post('/api/notion', data);
    console.log('res: ', res);
}
