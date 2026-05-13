import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, fetchPostsByUser, createPost, updatePost, deletePost } from '@/services/posts/api';
import type { CreatePostInput } from '@/services/posts/types';

export const postKeys = {
  all: ['posts'] as const,
  byUser: (userId: number) => ['posts', 'user', userId] as const,
};

export const usePosts = () =>
  useQuery({ queryKey: postKeys.all, queryFn: fetchPosts });

export const usePostsByUser = (userId: number) =>
  useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => fetchPostsByUser(userId),
    enabled: !!userId,
  });

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreatePostInput> }) =>
      updatePost(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};