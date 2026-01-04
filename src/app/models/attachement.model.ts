export interface Attachment {
  attachmentId: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  s3Url: string;
  uploadedByUserId: string;
  uploadedByUsername: string;
  uploadedAt: string;
}

export interface AttachmentUploadResponse {
  attachmentId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  message: string;
}
