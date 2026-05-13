import { View, Pressable, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo, useCallback } from 'react';
import { useDeletePost, useUpdatePost } from '@/hooks/posts/usePosts';
import type { Post } from '@/services/posts/types';

type Props = {
  item: Post;
};

const PostCard = memo(({ item }: Props) => {
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePost(item.id),
      },
    ]);
  }, [item.id, deletePost]);

  const handleEdit = useCallback(() => {
    // In a real app this would open a modal/sheet with a form
    updatePost({
      id: item.id,
      input: { title: `${item.title} (edited)` },
    });
  }, [item.id, item.title, updatePost]);

  return (
    <View className="bg-app-surface rounded-2xl p-4 mb-3 border border-app-border">
      <Text
        className="text-app-text-primary font-semibold capitalize mb-1"
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text className="text-app-text-muted text-xs" numberOfLines={3}>
        {item.body}
      </Text>

      <View className="flex-row items-center justify-between mt-3">
        <View className="bg-app-bg rounded px-2 py-0.5">
          <Text className="text-app-text-secondary text-xs">#{item.id}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={handleEdit}
            disabled={isUpdating}
            className="bg-app-brand/20 rounded-lg px-3 py-1"
          >
            <Text className="text-app-brand text-xs font-semibold">
              {isUpdating ? 'Saving...' : 'Edit'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            disabled={isDeleting}
            className="bg-app-danger/20 rounded-lg px-3 py-1"
          >
            <Text className="text-app-danger text-xs font-semibold">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export default PostCard;