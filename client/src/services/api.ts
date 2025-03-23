import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchCodeBlocks = async () => {
  const response = await axios.get(`${API_BASE}/api/code-blocks`);
  return response.data;
};
export const fetchCodeBlockById = async (id: string) => {
    const res = await axios.get(`${API_BASE}/api/code-blocks/${id}`);
    return res.data;
  };
  export const fetchActiveCodeBlockIds = async () => {
    const res = await axios.get(`${API_BASE}/api/code-blocks/active`);
    return res.data; 
  };