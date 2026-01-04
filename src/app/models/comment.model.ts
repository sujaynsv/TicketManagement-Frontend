export interface Comment {
  commentId: string;
  ticketId: string;
  commentText: string;
  isInternal: boolean;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  commentText: string;
  isInternal: boolean;
}
