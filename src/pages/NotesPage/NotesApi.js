import axios from "axios";

const API_BASE_URL = "https://";

export const getNotes = (id) => axios.get(`${API_BASE_URL}/data`);
export const putNotes = () => axios.get(`${API_BASE_URL}/data`);
export const postData = (data) => axios.post(`${API_BASE_URL}/data`, data);
export const deleteData = (id) => axios.delete(`${API_BASE_URL}/data/${id}`);
