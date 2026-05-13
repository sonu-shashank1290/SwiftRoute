import { apiClient } from '@/services/api/client';
import type { Post, CreatePostInput } from './types';

export const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await apiClient.get('/posts');
  return data;
};

export const fetchPostsByUser = async (userId: number): Promise<Post[]> => {
  const { data } = await apiClient.get('/posts', { params: { userId } });
  return data;
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const { data } = await apiClient.post('/posts', input);
  return data;
};

export const updatePost = async (id: number, input: Partial<CreatePostInput>): Promise<Post> => {
console.log('Updating post with id:', id, 'and input:', input);
  const { data } = await apiClient.put(`/posts/${id}`, input);
  console.log('Received response data:', data);
  return data;
};

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};