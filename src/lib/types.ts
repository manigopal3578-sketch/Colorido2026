export type FestivalWorld = 'ALL' | 'CULTURAL' | 'SPORTS';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'UPCOMING'
  | 'LIVE'
  | 'FULL'
  | 'COMPLETED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED';

export type EventCategory = 'cultural' | 'sports' | 'technical';

export type TeamRequirement = 'INDIVIDUAL' | 'TEAM' | 'BOTH';

export interface FestivalSettings {
  festivalName: string;
  shortName: string;
  edition: string;
  college: string;
  collegeShort: string;
  location: string;
  tagline: string;
  secondaryPhrase: string;
  startDate: string; // '2026-12-28'
  endDate: string; // '2026-12-29'
  startTime: string; // '09:00'
  endTime: string; // '22:00'
  timezone: string; // 'Asia/Kolkata'
  status: 'UPCOMING' | 'LIVE' | 'PAUSED' | 'COMPLETED';
  technicalStatusNotice: string;
  technicalPostponedDate: string; // '2026-10-09'
  technicalCardVisible: boolean;
  countdownVisible: boolean;
  activeWorlds: ('CULTURAL' | 'SPORTS')[];
  currentFestivalWorld: FestivalWorld;
  themePreset: 'EDITORIAL' | 'FESTIVAL' | 'ENERGETIC' | 'MINIMAL';
  colors: {
    primary: string;
    cultural: string;
    sports: string;
    cyan: string;
    gold: string;
  };
  contactEmail: string;
  contactPhone: string;
  emergencyNotice: string;
  emergencyNoticeActive: boolean;
  maintenanceMode: boolean;
  waitlistEnabled: boolean;
  demoMode: boolean;
  lastUpdated: string;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export interface HomepageHeroConfig {
  institutionalLabel: string;
  title: string;
  edition: string;
  tagline: string;
  datesText: string;
  targetDate: string;
  heroImage: string;
  countdownVisible: boolean;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaPrimaryVisible?: boolean;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  ctaSecondaryVisible?: boolean;
}

export interface PublishedHomepageConfig {
  hero: HomepageHeroConfig;
  sections: HomepageSectionConfig[];
  publishedAt: string;
  publishedBy?: string;
  version: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  subcategory: string;
  description: string;
  rules: string[];
  eligibility: string;
  date: string; // '2026-12-28' or '2026-12-29' or '2026-10-09'
  startTime: string; // '10:00'
  endTime: string; // '13:00'
  venueId: string;
  venueName: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  teamRequirement: TeamRequirement;
  minTeamSize: number;
  maxTeamSize: number;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  coverImage: string;
  galleryImages: string[];
  featured: boolean;
  waitlistCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VenueItem {
  id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  type: 'INDOOR' | 'OUTDOOR' | 'STADIUM' | 'AUDITORIUM';
  directions: string;
  mapCoords: { x: number; y: number };
  image: string;
  currentEventId?: string;
  nextEventId?: string;
  isAvailable: boolean;
}

export interface CoordinatorItem {
  id: string;
  name: string;
  role: string;
  category: 'CULTURAL' | 'SPORTS' | 'TECHNICAL' | 'CENTRAL' | 'STUDENT_LEAD';
  type: 'FACULTY' | 'STUDENT';
  email: string;
  phone: string;
  photo: string;
  assignedEventIds: string[];
  bio: string;
}

export interface OrganizerItem {
  id: string;
  organizerId: string;
  name: string;
  role: 'ADMIN' | 'EVENT_MANAGER' | 'COORDINATOR' | 'CHECK_IN_STAFF';
  photo: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  assignedModules?: string[];
  createdAt: string;
}

export interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  collegeType: 'RVRJC' | 'OTHER';
  collegeName: string;
  department: string;
  year: string;
  studentId: string;
  registeredEventIds: string[];
  createdAt: string;
}

export interface RegistrationItem {
  id: string; // e.g. CLR26-DANCE-4829
  eventId: string;
  eventTitle: string;
  category: EventCategory;
  participantId: string;
  participantName: string;
  email: string;
  phone: string;
  collegeType: 'RVRJC' | 'OTHER';
  collegeName: string;
  department: string;
  year: string;
  studentId: string;
  teamName?: string;
  teamMembers?: {
    name: string;
    email: string;
    phone: string;
    college: string;
    studentId: string;
  }[];
  status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
  checkInStatus: 'PENDING' | 'CHECKED_IN';
  checkedInAt?: string;
  checkedInBy?: string;
  ticketId: string;
  createdAt: string;
  notes?: string;
  accommodationRequired?: boolean;
  accommodationType?: 'BOYS_HOSTEL' | 'GIRLS_HOSTEL';
  accommodationDays?: string;
  accommodationNotes?: string;
}

export interface TicketItem {
  id: string; // TKT-CLR26-...
  registrationId: string;
  eventId: string;
  eventTitle: string;
  category: EventCategory;
  participantName: string;
  collegeName: string;
  collegeType: 'RVRJC' | 'OTHER';
  date: string;
  time: string;
  venueName: string;
  teamName?: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  qrPayload: string;
  generatedAt: string;
}

export interface GateItem {
  id: string; // e.g. 'gate-main', 'gate-sports', 'gate-cultural', 'gate-vip'
  name: string; // e.g. 'Main Gate (Quadrangle)', 'Sports Complex Gate'
  code: string;
  description?: string;
  isActive: boolean;
  assignedStaffIds?: string[];
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  registrationId: string;
  ticketId: string;
  eventId: string;
  eventTitle: string;
  participantName: string;
  collegeName: string;
  collegeType: 'RVRJC' | 'OTHER';
  timestamp: string;
  staffId: string;
  staffName: string;
  gateId?: string;
  gateName?: string;
  mode: 'CAMERA_SCAN' | 'MANUAL_ENTRY' | 'OFFLINE_SYNC';
}

export interface ResultItem {
  id: string;
  eventId: string;
  eventTitle: string;
  category: EventCategory;
  subcategory: string;
  published: boolean;
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  announcedAt?: string;
  winner?: {
    name: string;
    college: string;
    teamName?: string;
    scoreOrTime?: string;
    teamMembers?: string[];
  };
  runnerUp?: {
    name: string;
    college: string;
    teamName?: string;
    scoreOrTime?: string;
    teamMembers?: string[];
  };
  secondRunnerUp?: {
    name: string;
    college: string;
    teamName?: string;
    scoreOrTime?: string;
    teamMembers?: string[];
  };
  specialMentions?: {
    name: string;
    college: string;
    mentionTitle: string;
  }[];
  prizes?: {
    firstPrize?: string;
    secondPrize?: string;
    thirdPrize?: string;
    totalPrizePool?: string;
  };
  notes?: string;
  updatedAt: string;
}

export interface WebsiteChallengeConfig {
  title: string;
  subtitle: string;
  description: string;
  requirements: string[];
  deadline: string; // '30 SEPTEMBER 2026'
  teamSize: string; // '2 MEMBERS ONLY'
  technologies: string; // 'USE MODERN WEB TECHNOLOGIES'
  prizes: {
    first: string; // '₹3,000/-'
    second: string; // '₹2,000/-'
    third: string; // '₹1,500/-'
  };
  published: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  lastUpdated: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'IMPORTANT' | 'ALERT' | 'UPDATE' | 'DEADLINE';
  published: boolean;
  date: string;
  pinned?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Registration' | 'Events' | 'Teams' | 'Tickets' | 'Venues' | 'Schedule' | 'Accommodation' | 'General';
  published: boolean;
  order: number;
}

export interface SpeakerPerformerItem {
  id: string;
  name: string;
  role: string;
  type: 'SPEAKER' | 'PERFORMER' | 'CELEBRITY_GUEST';
  bio: string;
  photo: string;
  sessionTitle: string;
  date: string;
  time: string;
  venue: string;
  published: boolean;
}

export interface SponsorItem {
  id: string;
  name: string;
  tier: 'TITLE' | 'POWERED_BY' | 'ASSOCIATE' | 'MEDIA' | 'BEVERAGE';
  logo: string;
  url: string;
  order: number;
  published: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  record: string;
  details: string;
  ip?: string;
}

export interface VersionSnapshot {
  id: string;
  target: 'HOMEPAGE' | 'FESTIVAL_SETTINGS' | 'SCHEDULE' | 'BRAND';
  versionNumber: number;
  actor: string;
  timestamp: string;
  summary: string;
  data: any;
}

export interface SystemHealthStatus {
  database: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  auth: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  storage: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  aiGeneration: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  googleSheets: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  email: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  publicSync: 'HEALTHY' | 'WARNING' | 'ERROR' | 'NOT_CONFIGURED';
  lastChecked: string;
  details: Record<string, string>;
}
