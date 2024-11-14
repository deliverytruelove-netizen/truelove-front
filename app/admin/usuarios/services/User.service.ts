import axios from 'axios';
import { User } from '../types/User.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(API_URL + 'admin/user');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const changeStateUser = async (usuario: number): Promise<void> => {
  await axios.post(API_URL + `admin/users/change/state/${usuario}`);
};


export const createUser = async (newUser: {
  name: string;
  email: string;
  usuario: string;
  password: string;
}): Promise<void> => {
  await axios.post(API_URL + 'admin/users/create', newUser);
};