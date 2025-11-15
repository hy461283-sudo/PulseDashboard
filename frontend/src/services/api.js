import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const searchTweets = async (keyword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/search`, { keyword });
    return response.data;
  } catch (error) {
    console.error('Error searching tweets:', error);
    throw error;
  }
};

export const getTweets = async (keyword) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tweets/${keyword}`);
    return response.data;
  } catch (error) {
    console.error('Error getting tweets:', error);
    throw error;
  }
};
