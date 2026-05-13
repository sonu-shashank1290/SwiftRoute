import { FlatList, ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo, useCallback } from 'react';
import { usePosts, usePostsByUser } from '@/hooks/posts/usePosts';
import { useDashboardStore } from '@/store/dashboardStore';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import type { Post } from '@/services/posts/types';

const PostsTab = memo(() => {
  const { selectedUser } = useDashboardStore();
  const allPosts = usePosts();
  const userPosts = usePostsByUser(selectedUser?.id ?? 0);
  const { data, isLoading, isError } = selectedUser ? userPosts : allPosts;

  const keyExtractor = useCallback((item: Post) => String(item.id), []);
  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard item={item} />
  ), []);

  if (isLoading) return <ActivityIndicator color="#6366f1" className="mt-8" />;
  if (isError) return (
    <Text className="text-app-danger text-center mt-8">Failed to load posts</Text>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={
        <>
          {selectedUser && (
            <View className="bg-app-brand/20 border border-app-brand rounded-xl px-3 py-2 mb-3">
              <Text className="text-app-brand text-xs font-semibold">
                Showing posts by {selectedUser.name}
              </Text>
            </View>
          )}
          <CreatePostForm />
        </>
      }
    />
  );
});

export default PostsTab;