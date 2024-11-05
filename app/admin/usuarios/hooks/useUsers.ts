'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/User.service';
import { User } from '@/types/User.types';

export const useUsers = () => {
  return useQuery<User[], Error>(['users'], fetchUsers);
};
