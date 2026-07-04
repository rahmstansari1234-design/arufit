import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ChatSettings as BackendChatSettings } from "../backend.d";
import type {
  CallView,
  GroupChatView,
  GroupMessageView,
  PostReactionSummary,
} from "../types";
import type {
  ConversationPreview,
  Message,
  Notification,
  Post,
  Story,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

// ── Profiles ─────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile(userId as any);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateProfile() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      username: string;
      bio: string;
      avatarUrl?: string;
      coverUrl?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.upsertProfile({
        displayName: params.displayName,
        username: params.username,
        bio: params.bio,
        avatarUrl: params.avatarUrl,
        coverUrl: params.coverUrl,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useSearchUsers(query: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView[]>({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchUsers(query.trim());
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
  });
}

export function useSuggestedUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView[]>({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuggestedUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Follows ──────────────────────────────────────────────────────────────────

export function useFollowUser() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.follow(targetId as any);
    },
    onSuccess: (_data, targetId) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", targetId] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.unfollow(targetId as any);
    },
    onSuccess: (_data, targetId) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", targetId] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
  });
}

export function useIsFollowing(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isFollowing(userId as any);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFollowers(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView[]>({
    queryKey: ["followers", userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFollowers(userId as any);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFollowing(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView[]>({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFollowing(userId as any);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Posts ────────────────────────────────────────────────────────────────────

export function useHomeFeed() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Post[]>({
    queryKey: ["homeFeed"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getHomeFeed(null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserPosts(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Post[]>({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getUserPosts(userId as any, null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrendingPosts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Post[]>({
    queryKey: ["trendingPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getTrendingPosts(null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePost(postId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Post | null>({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      caption: string;
      mediaUrl?: string;
      moodTag?: string;
      visibility?: import("../backend.d").PostVisibility;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPost({
        caption: params.caption,
        mediaUrl: params.mediaUrl,
        moodTag: params.moodTag,
        visibility:
          params.visibility ??
          ("everyone" as import("../backend.d").PostVisibility),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
    },
  });
}

export function useLikePost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.unlikePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
    },
  });
}

// ── Comments ─────────────────────────────────────────────────────────────────

export function useComments(postId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").CommentView[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddComment() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      postId: string;
      content: string;
      parentId?: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addComment(
        params.postId,
        params.content,
        params.parentId ?? null,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
    },
  });
}

export function useLikeComment() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.likeComment(commentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

// ── Stories ──────────────────────────────────────────────────────────────────

export function useCreateStory() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mediaUrl?: string;
      moodTag?: string;
      caption?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStory({
        mediaUrl: params.mediaUrl,
        moodTag: params.moodTag,
        caption: params.caption,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

export function useActiveStories() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Story[]>({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useViewStory() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.viewStory(storyId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

export function useStoryViewers(storyId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").UserProfileView[]>({
    queryKey: ["storyViewers", storyId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStoryViewers(storyId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Messages ─────────────────────────────────────────────────────────────────

export function useSendMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      toId: string;
      content: string;
      mediaUrl?: string | null;
      replyToId?: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(
        params.toId as any,
        params.content,
        params.mediaUrl ?? null,
        params.replyToId ?? null,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.toId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useConversations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<import("../backend.d").Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessages(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Message[]>({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getMessages(userId as any, null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAsRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.markAsRead(otherUserId as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useReactToMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { messageId: string; reaction: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.reactToMessage(params.messageId, params.reaction);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ── Chat Settings ────────────────────────────────────────────────────────────

export function useChatSettings(userId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BackendChatSettings | null>({
    queryKey: ["chatSettings", userId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChatSettings(userId as any);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateChatSettings() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      settings: BackendChatSettings;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateChatSettings(params.userId as any, params.settings);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["chatSettings", vars.userId] });
    },
  });
}

// ── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getNotifications(null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadNotificationCount() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<number>({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getUnreadCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
}

// ── Group Chats ────────────────────────────────────────────────────────────

export function useGroupChats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<GroupChatView[]>({
    queryKey: ["groupChats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroupChats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      avatarUrl?: string;
      memberIds: import("@icp-sdk/core/principal").Principal[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createGroup({
        name: params.name,
        avatarUrl: params.avatarUrl,
        memberIds: params.memberIds,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useGroupMessages(groupId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<GroupMessageView[]>({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getGroupMessages(groupId, null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendGroupMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      content: string;
      mediaUrl?: string | null;
      replyToId?: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendGroupMessage(
        params.groupId,
        params.content,
        params.mediaUrl ?? null,
        params.replyToId ?? null,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["groupMessages", vars.groupId] });
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useAddGroupMember() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      userId: import("@icp-sdk/core/principal").Principal;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addGroupMember(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useRemoveGroupMember() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      userId: import("@icp-sdk/core/principal").Principal;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeGroupMember(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function usePromoteGroupAdmin() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      userId: import("@icp-sdk/core/principal").Principal;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.promoteGroupAdmin(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useDemoteGroupAdmin() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      userId: import("@icp-sdk/core/principal").Principal;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.demoteGroupAdmin(params.groupId, params.userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useUpdateGroupInfo() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      name?: string | null;
      avatarUrl?: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateGroupInfo(
        params.groupId,
        params.name ?? null,
        params.avatarUrl ?? null,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.leaveGroup(groupId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGroup(groupId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupChats"] });
    },
  });
}

// ── Post Reactions ───────────────────────────────────────────────────────────

export function useReactToPost() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { postId: string; emoji: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.reactToPost(params.postId, params.emoji);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
      qc.invalidateQueries({ queryKey: ["post", vars.postId] });
      qc.invalidateQueries({ queryKey: ["postReactions", vars.postId] });
    },
  });
}

export function useRemovePostReaction() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.removePostReaction(postId);
    },
    onSuccess: (_data, postId) => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["trendingPosts"] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["postReactions", postId] });
    },
  });
}

export function usePostReactions(postId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<PostReactionSummary[]>({
    queryKey: ["postReactions", postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostReactions(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Call State ───────────────────────────────────────────────────────────────

export function useStartCall() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      recipientId: import("@icp-sdk/core/principal").Principal,
    ) => {
      if (!actor) throw new Error("No actor");
      return actor.startCall(recipientId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    },
  });
}

export function useEndCall() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (callId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.endCall(callId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    },
  });
}

export function useUpdateCallStatus() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      callId: string;
      status: import("../backend.d").CallStatus;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCallStatus(params.callId, params.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callHistory"] });
    },
  });
}

export function useCallHistory() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<CallView[]>({
    queryKey: ["callHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const page = await actor.getCallHistory(null);
      return page.items;
    },
    enabled: !!actor && !isFetching,
  });
}

// Re-export types for consumer convenience
export type {
  Post,
  Story,
  Message,
  ConversationPreview,
  Notification,
  GroupChatView,
  GroupMessageView,
  PostReactionSummary,
  CallView,
};
