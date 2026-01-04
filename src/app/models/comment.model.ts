export interface Comment {
  commentId: string;
  ticketId: string;
  userId: string;
  username: string;
  commentText: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  commentText: string;
  isInternal: boolean;
}
