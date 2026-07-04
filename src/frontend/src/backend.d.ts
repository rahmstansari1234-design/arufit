import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface GroupMessageView {
    id: string;
    status: MessageStatus;
    senderAvatarUrl?: string;
    content: string;
    createdAt: Timestamp;
    senderUsername: string;
    senderDisplayName: string;
    mediaUrl?: string;
    groupId: string;
    fromId: Principal;
    replyToId?: string;
    reactions: Array<[string, Array<Principal>]>;
}
export interface PostView {
    id: string;
    authorUsername: string;
    authorId: Principal;
    moodTag?: string;
    createdAt: Timestamp;
    mediaUrl?: string;
    authorAvatarUrl?: string;
    caption: string;
    commentsCount: bigint;
    likesCount: bigint;
    visibility: PostVisibility;
    authorDisplayName: string;
    reactions: Array<PostReactionSummary>;
    likedByMe: boolean;
}
export interface Page_2 {
    hasMore: boolean;
    items: Array<MessageView>;
    nextCursor?: string;
}
export interface CreatePostInput {
    moodTag?: string;
    mediaUrl?: string;
    caption: string;
    visibility: PostVisibility;
}
export interface ChatSettings {
    wallpaper?: string;
    isArchived: boolean;
    muteUntil?: Timestamp;
    bubbleColorReceived?: string;
    isMuted: boolean;
    disappearingMode: DisappearingMode;
    chatName?: string;
    bubbleColorSent?: string;
}
export interface Page_1 {
    hasMore: boolean;
    items: Array<NotificationView>;
    nextCursor?: string;
}
export interface CommentView {
    id: string;
    authorUsername: string;
    content: string;
    authorId: Principal;
    createdAt: Timestamp;
    authorAvatarUrl?: string;
    parentId?: string;
    likesCount: bigint;
    authorDisplayName: string;
    likedByMe: boolean;
    postId: string;
}
export interface UpsertProfileInput {
    bio: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    coverUrl?: string;
}
export interface NotificationView {
    id: string;
    notifType: NotificationType;
    actorAvatarUrl?: string;
    createdAt: Timestamp;
    referenceId?: string;
    isRead: boolean;
    actorId: Principal;
    actorUsername: string;
    recipientId: Principal;
}
export interface GroupChatView {
    members: Array<Principal>;
    lastMessageAt?: Timestamp;
    adminIds: Array<Principal>;
    name: string;
    createdAt: Timestamp;
    createdBy: Principal;
    lastMessage?: string;
    memberProfiles: Array<UserProfileView>;
    groupId: string;
    avatarUrl?: string;
    unreadCount: bigint;
}
export interface Page_3 {
    hasMore: boolean;
    items: Array<GroupMessageView>;
    nextCursor?: string;
}
export interface Page {
    hasMore: boolean;
    items: Array<PostView>;
    nextCursor?: string;
}
export interface CallView {
    status: CallStatus;
    startedAt: Timestamp;
    callerAvatarUrl?: string;
    endedAt?: Timestamp;
    recipientDisplayName: string;
    recipientAvatarUrl?: string;
    callerId: Principal;
    groupId?: string;
    callerUsername: string;
    callId: string;
    recipientUsername: string;
    recipientId: Principal;
    callerDisplayName: string;
}
export interface StoryView {
    id: string;
    authorUsername: string;
    expiresAt: Timestamp;
    viewedByMe: boolean;
    authorId: Principal;
    moodTag?: string;
    createdAt: Timestamp;
    mediaUrl?: string;
    authorAvatarUrl?: string;
    caption?: string;
    authorDisplayName: string;
    viewsCount: bigint;
}
export interface UserProfileView {
    id: Principal;
    bio: string;
    username: string;
    displayName: string;
    followersCount: bigint;
    createdAt: Timestamp;
    isVerified: boolean;
    avatarUrl?: string;
    isFollowing: boolean;
    followingCount: bigint;
    coverUrl?: string;
    postsCount: bigint;
}
export interface MessageView {
    id: string;
    status: MessageStatus;
    content: string;
    createdAt: Timestamp;
    toId: Principal;
    emojiReaction?: string;
    mediaUrl?: string;
    disappearsAt?: Timestamp;
    fromId: Principal;
    replyToId?: string;
}
export interface CreateStoryInput {
    moodTag?: string;
    mediaUrl?: string;
    caption?: string;
}
export interface PostReactionSummary {
    reactedByMe: boolean;
    count: bigint;
    emoji: string;
}
export interface Page_4 {
    hasMore: boolean;
    items: Array<CallView>;
    nextCursor?: string;
}
export interface Conversation {
    lastMessageAt: Timestamp;
    lastMessage?: string;
    participantId: Principal;
    unreadCount: bigint;
}
export interface CreateGroupInput {
    name: string;
    avatarUrl?: string;
    memberIds: Array<Principal>;
}
export enum CallStatus {
    active = "active",
    ringing = "ringing",
    missed = "missed",
    ended = "ended",
    declined = "declined"
}
export enum DisappearingMode {
    d7 = "d7",
    h24 = "h24",
    off = "off"
}
export enum MessageStatus {
    read = "read",
    sent = "sent",
    sending = "sending",
    delivered = "delivered"
}
export enum NotificationType {
    incomingCall = "incomingCall",
    groupInvite = "groupInvite",
    storyReply = "storyReply",
    like = "like",
    postReaction = "postReaction",
    comment = "comment",
    message = "message",
    missedCall = "missedCall",
    follow = "follow"
}
export enum PostVisibility {
    everyone = "everyone",
    followers = "followers"
}
export interface backendInterface {
    addComment(postId: string, content: string, parentId: string | null): Promise<CommentView>;
    addGroupMember(groupId: string, userId: Principal): Promise<void>;
    createGroup(input: CreateGroupInput): Promise<GroupChatView>;
    createPost(input: CreatePostInput): Promise<PostView>;
    createStory(input: CreateStoryInput): Promise<StoryView>;
    deleteComment(id: string): Promise<void>;
    deleteGroup(groupId: string): Promise<void>;
    deletePost(id: string): Promise<void>;
    demoteGroupAdmin(groupId: string, userId: Principal): Promise<void>;
    endCall(callId: string): Promise<CallView>;
    follow(userId: Principal): Promise<void>;
    getActiveStories(): Promise<Array<StoryView>>;
    getCallHistory(cursor: string | null): Promise<Page_4>;
    getChatSettings(userId: Principal): Promise<ChatSettings>;
    getComments(postId: string): Promise<Array<CommentView>>;
    getConversations(): Promise<Array<Conversation>>;
    getFollowers(userId: Principal): Promise<Array<Principal>>;
    getFollowing(userId: Principal): Promise<Array<Principal>>;
    getGroupChats(): Promise<Array<GroupChatView>>;
    getGroupMessages(groupId: string, cursor: string | null): Promise<Page_3>;
    getHomeFeed(cursor: string | null): Promise<Page>;
    getMessages(userId: Principal, cursor: string | null): Promise<Page_2>;
    getMyProfile(): Promise<UserProfileView | null>;
    getNotifications(cursor: string | null): Promise<Page_1>;
    getPost(id: string): Promise<PostView | null>;
    getPostReactions(postId: string): Promise<Array<PostReactionSummary>>;
    getProfile(userId: Principal): Promise<UserProfileView | null>;
    getStoryViewers(id: string): Promise<Array<UserProfileView>>;
    getSuggestedUsers(): Promise<Array<UserProfileView>>;
    getTrendingPosts(cursor: string | null): Promise<Page>;
    getUnreadCount(): Promise<bigint>;
    getUserPosts(userId: Principal, cursor: string | null): Promise<Page>;
    isFollowing(userId: Principal): Promise<boolean>;
    leaveGroup(groupId: string): Promise<void>;
    likeComment(id: string): Promise<void>;
    likePost(id: string): Promise<void>;
    listFollowers(userId: Principal): Promise<Array<UserProfileView>>;
    listFollowing(userId: Principal): Promise<Array<UserProfileView>>;
    markAllNotificationsRead(): Promise<void>;
    markAsRead(userId: Principal): Promise<void>;
    markNotificationRead(id: string): Promise<void>;
    promoteGroupAdmin(groupId: string, userId: Principal): Promise<void>;
    reactToMessage(messageId: string, emoji: string): Promise<void>;
    reactToPost(postId: string, emoji: string): Promise<void>;
    removeGroupMember(groupId: string, userId: Principal): Promise<void>;
    removePostReaction(postId: string): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfileView>>;
    sendGroupMessage(groupId: string, content: string, mediaUrl: string | null, replyToId: string | null): Promise<GroupMessageView>;
    sendMessage(toId: Principal, content: string, mediaUrl: string | null, replyToId: string | null): Promise<MessageView>;
    startCall(recipientId: Principal): Promise<CallView>;
    unfollow(userId: Principal): Promise<void>;
    unlikePost(id: string): Promise<void>;
    updateCallStatus(callId: string, status: CallStatus): Promise<CallView>;
    updateChatSettings(userId: Principal, settings: ChatSettings): Promise<void>;
    updateGroupInfo(groupId: string, name: string | null, avatarUrl: string | null): Promise<GroupChatView>;
    upsertProfile(input: UpsertProfileInput): Promise<UserProfileView>;
    viewStory(id: string): Promise<void>;
}
