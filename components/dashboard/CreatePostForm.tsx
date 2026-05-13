import { View, TextInput, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo, useState } from 'react';
import { useCreatePost } from '@/hooks/posts/usePosts';
import { useDashboardStore } from '@/store/dashboardStore';

const CreatePostForm = memo(() => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { selectedUser } = useDashboardStore();
  const { mutate: createPost, isPending } = useCreatePost();

  const handleSubmit = () => {
    if (!title.trim() || !body.trim() || !selectedUser) return;
    createPost(
      { title, body, userId: selectedUser.id },
      {
        onSuccess: () => {
          setTitle('');
          setBody('');
          setExpanded(false);
        },
      },
    );
  };

  if (!selectedUser) return null;

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        className="bg-app-surface border border-app-border rounded-2xl px-4 py-3 mb-3 flex-row items-center gap-2"
      >
        <Text className="text-app-text-muted text-sm flex-1">
          Write a post as {selectedUser.name}...
        </Text>
        <View className="bg-app-brand rounded-lg px-3 py-1">
          <Text className="text-app-text-primary text-xs font-bold">+</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="bg-app-surface border border-app-border rounded-2xl p-4 mb-3">
      <Text className="text-app-text-muted text-xs mb-2">
        Post as {selectedUser.name}
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#52525b"
        className="bg-app-bg rounded-xl px-3 py-2 text-app-text-primary text-sm mb-2"
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Body"
        placeholderTextColor="#52525b"
        multiline
        numberOfLines={3}
        className="bg-app-bg rounded-xl px-3 py-2 text-app-text-primary text-sm mb-3"
      />
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setExpanded(false)}
          className="flex-1 bg-app-bg rounded-xl py-2 items-center"
        >
          <Text className="text-app-text-muted text-sm">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isPending || !title.trim() || !body.trim()}
          className="flex-1 bg-app-brand rounded-xl py-2 items-center"
        >
          <Text className="text-app-text-primary text-sm font-bold">
            {isPending ? 'Posting...' : 'Post'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

export default CreatePostForm;