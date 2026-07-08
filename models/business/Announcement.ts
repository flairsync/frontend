export type AnnouncementKind = "ANNOUNCEMENT" | "MESSAGE";
export type AnnouncementAudienceType = "ALL_STAFF" | "TEAM" | "STAFF";

export interface SentAnnouncement {
  id: string;
  kind: AnnouncementKind;
  audienceType: AnnouncementAudienceType;
  title: string;
  content: string;
  teamId: string | null;
  teamName: string | null;
  authorId: string | null;
  authorName: string | null;
  recipientCount: number;
  readCount: number;
  createdAt: string;
  expiresAt: string | null;
  isExpired: boolean;
}

export interface AnnouncementInboxItem {
  id: string; // recipient id — used to mark as read
  announcementId: string;
  kind: AnnouncementKind;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  authorName: string | null;
}

export interface GlobalInboxBusiness {
  businessId: string;
  businessName: string;
  businessLogo: string | null;
  unreadCount: number;
  latest: AnnouncementInboxItem[];
}
