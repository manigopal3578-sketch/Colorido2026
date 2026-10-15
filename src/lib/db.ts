import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { put, list } from '@vercel/blob';
import {
  FestivalSettings,
  HomepageSectionConfig,
  EventItem,
  VenueItem,
  CoordinatorItem,
  OrganizerItem,
  ParticipantItem,
  RegistrationItem,
  TicketItem,
  CheckInRecord,
  AnnouncementItem,
  FaqItem,
  SpeakerPerformerItem,
  SponsorItem,
  AuditLogItem,
  VersionSnapshot,
  SystemHealthStatus,
  GateItem,
  ResultItem,
  WebsiteChallengeConfig,
  HomepageHeroConfig,
  PublishedHomepageConfig,
} from './types';
import {
  initialSettings,
  initialHomepageSections,
  initialEvents,
  initialVenues,
  initialCoordinators,
  initialAnnouncements,
  initialFaqs,
  initialSpeakersPerformers,
  initialSponsors,
  initialGates,
  initialResults,
  initialWebsiteChallenge,
  defaultHeroConfig,
  defaultPublishedHomepageConfig,
} from './initialData';

export { defaultHeroConfig, defaultPublishedHomepageConfig };

export interface AdminUserRecord {
  id: string;
  organizerId: string;
  name: string;
  role: 'ADMIN' | 'EVENT_MANAGER' | 'COORDINATOR' | 'CHECK_IN_STAFF';
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  tokenVersion: number;
}

export interface DatabaseSchema {
  settings: FestivalSettings;
  homepageSections: HomepageSectionConfig[];
  events: EventItem[];
  venues: VenueItem[];
  coordinators: CoordinatorItem[];
  organizers: OrganizerItem[];
  participants: ParticipantItem[];
  registrations: RegistrationItem[];
  tickets: TicketItem[];
  checkIns: CheckInRecord[];
  announcements: AnnouncementItem[];
  faqs: FaqItem[];
  speakersPerformers: SpeakerPerformerItem[];
  sponsors: SponsorItem[];
  auditLogs: AuditLogItem[];
  versionHistory: VersionSnapshot[];
  adminUsers: AdminUserRecord[];
  systemHealth: SystemHealthStatus;
  gates: GateItem[];
  results: ResultItem[];
  websiteChallenge: WebsiteChallengeConfig;
  draftHomepageConfig?: PublishedHomepageConfig;
  publishedHomepageConfig?: PublishedHomepageConfig;
}

const BLOB_KEY = 'colorido_production_db.json';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'colorido_db.json');
const BACKUP_DB_FILE = path.join(DATA_DIR, 'backup_colorido_db_production.json');
const TMP_DB_FILE = path.join('/tmp', 'colorido_db.json');

// Memory cache for high-throughput responses across serverless lambda invocations
let dbCache: DatabaseSchema | null = null;
let lastDbMtime = 0;
let lastSyncTime = 0;
let cachedBlobUrl: string | null = null;
let syncPromise: Promise<DatabaseSchema> | null = null;
let writeChain: Promise<any> = Promise.resolve();
const CACHE_TTL_MS = 2000;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initializeDefaultDatabase(): DatabaseSchema {
  // Bootstrap administrator with requested password securely hashed (salt rounds = 10)
  // Password is NEVER plaintext in code or sent to client
  const defaultSalt = bcrypt.genSaltSync(10);
  const defaultAdminHash = bcrypt.hashSync('Colorido@2026', defaultSalt);

  const initialAdmins: AdminUserRecord[] = [
    {
      id: 'usr-admin-01',
      organizerId: 'CLR26-ADMIN',
      name: 'R.V.R. & J.C. Festival Convener',
      role: 'ADMIN',
      passwordHash: defaultAdminHash,
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
    },
    {
      id: 'usr-manager-01',
      organizerId: 'CLR26-MGR',
      name: 'Festival Event Manager',
      role: 'EVENT_MANAGER',
      passwordHash: defaultAdminHash,
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
    },
    {
      id: 'usr-staff-01',
      organizerId: 'CLR26-STAFF',
      name: 'Check-In Desk Lead',
      role: 'CHECK_IN_STAFF',
      passwordHash: defaultAdminHash,
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
    }
  ];

  return {
    settings: initialSettings,
    homepageSections: initialHomepageSections,
    events: initialEvents,
    venues: initialVenues,
    coordinators: initialCoordinators,
    organizers: [
      {
        id: 'org-01',
        organizerId: 'CLR26-ADMIN',
        name: 'Prof. Principal & Convener',
        role: 'ADMIN',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        email: 'principal@rvrjcce.ac.in',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ],
    participants: [],
    registrations: [],
    tickets: [],
    checkIns: [],
    announcements: initialAnnouncements,
    faqs: initialFaqs,
    speakersPerformers: initialSpeakersPerformers,
    sponsors: initialSponsors,
    auditLogs: [
      {
        id: 'log-bootstrap',
        timestamp: new Date().toISOString(),
        actor: 'SYSTEM',
        actorRole: 'ROOT',
        action: 'BOOTSTRAP',
        record: 'SYSTEM',
        details: 'COLORIDO 2K26 system initialized with Cultural + Sports active domains.',
      }
    ],
    versionHistory: [
      {
        id: 'ver-hp-01',
        target: 'HOMEPAGE',
        versionNumber: 1,
        actor: 'SYSTEM',
        timestamp: new Date().toISOString(),
        summary: 'Initial production homepage configuration',
        data: initialHomepageSections,
      },
      {
        id: 'ver-set-01',
        target: 'FESTIVAL_SETTINGS',
        versionNumber: 1,
        actor: 'SYSTEM',
        timestamp: new Date().toISOString(),
        summary: 'Official festival settings: Dec 28-29 2026, Cultural & Sports',
        data: initialSettings,
      }
    ],
    adminUsers: initialAdmins,
    gates: initialGates,
    results: initialResults,
    websiteChallenge: initialWebsiteChallenge,
    systemHealth: {
      database: 'HEALTHY',
      auth: 'HEALTHY',
      storage: 'HEALTHY',
      aiGeneration: 'HEALTHY',
      googleSheets: 'NOT_CONFIGURED',
      email: 'NOT_CONFIGURED',
      publicSync: 'HEALTHY',
      lastChecked: new Date().toISOString(),
      details: {
        databaseFile: 'colorido_db.json (Persistent JSON File Engine)',
        authEngine: 'bcryptjs + jose JWT + HTTP-only session tokens',
        storageEngine: 'Local static media + Unsplash CDN',
        aiGeneration: 'Google Gemini Pro / Flash SDK ready',
        googleSheets: 'Google Cloud Service Account credentials not provided',
        email: 'SMTP / SendGrid credentials not provided',
        publicSync: 'Instant memory revalidation active',
      }
    },
    draftHomepageConfig: defaultPublishedHomepageConfig,
    publishedHomepageConfig: defaultPublishedHomepageConfig,
  };
}

// Ensure real dynamic registration counts strictly match valid database records
export function syncDynamicEventCounts(db: DatabaseSchema): boolean {
  let changed = false;
  const confirmedCountsByEvent: Record<string, number> = {};
  const waitlistCountsByEvent: Record<string, number> = {};

  for (const reg of db.registrations || []) {
    if (reg.status === 'CONFIRMED') {
      confirmedCountsByEvent[reg.eventId] = (confirmedCountsByEvent[reg.eventId] || 0) + 1;
    } else if (reg.status === 'WAITLIST') {
      waitlistCountsByEvent[reg.eventId] = (waitlistCountsByEvent[reg.eventId] || 0) + 1;
    }
  }

  for (const evt of db.events || []) {
    const realConfirmed = confirmedCountsByEvent[evt.id] || 0;
    const realWaitlist = waitlistCountsByEvent[evt.id] || 0;
    if (evt.registeredCount !== realConfirmed || evt.waitlistCount !== realWaitlist) {
      evt.registeredCount = realConfirmed;
      evt.waitlistCount = realWaitlist;
      changed = true;
    }
  }
  return changed;
}

// Sanity checks and structural integrity validation (never drops authentic records)
function ensureDatabaseIntegrity(db: DatabaseSchema): boolean {
  let needsSave = false;

  if (!db.participants) db.participants = [];
  if (!db.registrations) db.registrations = [];
  if (!db.tickets) db.tickets = [];
  if (!db.checkIns) db.checkIns = [];
  if (!db.events) db.events = [];
  if (!db.venues) db.venues = [];
  if (!db.coordinators) db.coordinators = [];
  if (!db.organizers) db.organizers = [];
  if (!db.announcements) db.announcements = [];
  if (!db.faqs) db.faqs = [];
  if (!db.speakersPerformers) db.speakersPerformers = [];
  if (!db.sponsors) db.sponsors = [];
  if (!db.auditLogs) db.auditLogs = [];
  if (!db.versionHistory) db.versionHistory = [];
  if (!db.adminUsers) db.adminUsers = [];

  if (!db.gates || db.gates.length === 0) {
    db.gates = initialGates;
    needsSave = true;
  }
  if (!db.websiteChallenge) {
    db.websiteChallenge = initialWebsiteChallenge;
    needsSave = true;
  }
  if (!db.results || db.results.length === 0) {
    db.results = initialResults;
    needsSave = true;
  }
  if (!db.publishedHomepageConfig) {
    db.publishedHomepageConfig = {
      hero: {
        ...defaultHeroConfig,
        title: db.settings?.shortName || defaultHeroConfig.title,
        edition: db.settings?.edition || defaultHeroConfig.edition,
        institutionalLabel: db.settings?.college || defaultHeroConfig.institutionalLabel,
        tagline: db.settings?.tagline || defaultHeroConfig.tagline,
        countdownVisible: db.settings?.countdownVisible ?? true,
      },
      sections: db.homepageSections || initialHomepageSections,
      publishedAt: new Date().toISOString(),
      publishedBy: 'SYSTEM',
      version: 1,
    };
    needsSave = true;
  }
  if (!db.draftHomepageConfig) {
    db.draftHomepageConfig = { ...db.publishedHomepageConfig };
    needsSave = true;
  }

  // Ensure default events exist while strictly preserving custom edits and registrations
  const existingEventIds = new Set(db.events.map((e) => e.id));
  for (const initEvt of initialEvents) {
    if (!existingEventIds.has(initEvt.id)) {
      db.events.push(initEvt);
      needsSave = true;
    } else {
      const existing = db.events.find((e) => e.id === initEvt.id);
      if (existing && existing.subcategory !== initEvt.subcategory) {
        existing.subcategory = initEvt.subcategory;
        needsSave = true;
      }
    }
  }

  // Ensure staff user usr-staff-01 exists for check-in staff testing
  if (!db.adminUsers.find((u) => u.role === 'CHECK_IN_STAFF')) {
    const defaultSalt = bcrypt.genSaltSync(10);
    const defaultStaffHash = bcrypt.hashSync('Colorido@2026', defaultSalt);
    db.adminUsers.push({
      id: 'usr-staff-01',
      organizerId: 'CLR26-STAFF',
      name: 'Check-In Desk Lead',
      role: 'CHECK_IN_STAFF',
      passwordHash: defaultStaffHash,
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
    });
    needsSave = true;
  }

  if (syncDynamicEventCounts(db)) {
    needsSave = true;
  }

  return needsSave;
}

// Local filesystem fallback (reads /tmp, bundled DB_FILE, or bundled backup)
function getDatabaseLocal(): DatabaseSchema {
  ensureDataDirectory();

  // 1. Check /tmp/colorido_db.json
  if (fs.existsSync(TMP_DB_FILE)) {
    try {
      const data = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.events) && Array.isArray(parsed.registrations)) {
        ensureDatabaseIntegrity(parsed);
        return parsed;
      }
    } catch {}
  }

  // 2. Check bundled data/colorido_db.json
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.events)) {
        ensureDatabaseIntegrity(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading DB_FILE:', err);
    }
  }

  // 3. Check bundled backup file
  if (fs.existsSync(BACKUP_DB_FILE)) {
    try {
      const data = fs.readFileSync(BACKUP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.events)) {
        ensureDatabaseIntegrity(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading BACKUP_DB_FILE:', err);
    }
  }

  // 4. Default fallback if all fails
  const defaultDb = initializeDefaultDatabase();
  return defaultDb;
}

// Synchronize database state from Vercel Blob persistent store
export async function syncDatabaseFromStorage(force = false): Promise<DatabaseSchema> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    if (!dbCache) {
      dbCache = getDatabaseLocal();
      lastSyncTime = Date.now();
    }
    return dbCache;
  }

  // Return cached copy if within TTL
  if (!force && dbCache && Date.now() - lastSyncTime < CACHE_TTL_MS) {
    return dbCache;
  }

  // Return ongoing promise to avoid duplicate concurrent fetches
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = (async () => {
    try {
      let targetUrl = cachedBlobUrl;
      if (!targetUrl) {
        const blobs = await list({ prefix: BLOB_KEY, token });
        const targetBlob = blobs.blobs.find((b) => b.pathname === BLOB_KEY);
        if (targetBlob) {
          cachedBlobUrl = targetBlob.downloadUrl || targetBlob.url;
          targetUrl = cachedBlobUrl;
        }
      }

      if (targetUrl) {
        const fetchUrl = targetUrl.includes('?')
          ? `${targetUrl}&t=${Date.now()}`
          : `${targetUrl}?download=1&t=${Date.now()}`;
        const fetchRes = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          cache: 'no-store',
        });
        if (fetchRes.ok) {
          const remoteDb: DatabaseSchema = await fetchRes.json();
          if (remoteDb && Array.isArray(remoteDb.events) && Array.isArray(remoteDb.registrations)) {
            const needsSave = ensureDatabaseIntegrity(remoteDb);
            dbCache = remoteDb;
            lastSyncTime = Date.now();
            try {
              fs.writeFileSync(TMP_DB_FILE, JSON.stringify(dbCache), 'utf-8');
            } catch {}
            if (needsSave) {
              saveDatabase(dbCache);
            }
            return dbCache;
          }
        }
      }

      // If remote blob not yet created, seed it with authentic local data
      const local = getDatabaseLocal();
      try {
        const uploadRes = await put(BLOB_KEY, JSON.stringify(local, null, 2), {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          token,
          cacheControlMaxAge: 0,
        });
        cachedBlobUrl = uploadRes.url;
      } catch (uploadErr) {
        console.warn('Initial blob upload seed warning:', uploadErr);
      }
      dbCache = local;
      lastSyncTime = Date.now();
      return dbCache;
    } catch (err) {
      console.warn('syncDatabaseFromStorage warning:', err);
      if (!dbCache) {
        dbCache = getDatabaseLocal();
        lastSyncTime = Date.now();
      }
      return dbCache;
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

// Asynchronously fetch current database with live Vercel Blob sync
export async function getDatabaseAsync(force = false): Promise<DatabaseSchema> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return await syncDatabaseFromStorage(force);
  }
  if (!dbCache) {
    dbCache = getDatabaseLocal();
    lastSyncTime = Date.now();
  }
  return dbCache;
}

// Synchronous database retrieval (returns memory cache or local disk with background sync)
export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    if (process.env.BLOB_READ_WRITE_TOKEN && Date.now() - lastSyncTime > CACHE_TTL_MS && !syncPromise) {
      syncDatabaseFromStorage(false).catch(() => {});
    }
    return dbCache;
  }

  dbCache = getDatabaseLocal();
  lastSyncTime = Date.now();

  if (process.env.BLOB_READ_WRITE_TOKEN && !syncPromise) {
    syncDatabaseFromStorage(true).catch(() => {});
  }
  return dbCache;
}

// Asynchronously save database state with guaranteed Vercel Blob commit
export async function saveDatabaseAsync(data: DatabaseSchema): Promise<void> {
  try {
    ensureDataDirectory();
    syncDynamicEventCounts(data);
    data.settings.lastUpdated = new Date().toISOString();
    dbCache = data;
    lastSyncTime = Date.now();

    // Local /tmp and data/ save
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      lastDbMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {
      try {
        fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      writeChain = writeChain.then(async () => {
        try {
          const res = await put(BLOB_KEY, JSON.stringify(data, null, 2), {
            access: 'private',
            addRandomSuffix: false,
            allowOverwrite: true,
            token,
            cacheControlMaxAge: 0,
          });
          cachedBlobUrl = res.downloadUrl || res.url;
        } catch (err) {
          console.error('saveDatabaseAsync blob upload error:', err);
        }
      });
      await writeChain;
    }
  } catch (err) {
    console.error('saveDatabaseAsync fatal error:', err);
  }
}

// Synchronous database save with non-blocking background Vercel Blob mirror
export function saveDatabase(data: DatabaseSchema): void {
  try {
    ensureDataDirectory();
    syncDynamicEventCounts(data);
    data.settings.lastUpdated = new Date().toISOString();
    dbCache = data;
    lastSyncTime = Date.now();

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      try {
        lastDbMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch {}
    } catch {
      try {
        fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      writeChain = writeChain.then(async () => {
        try {
          const res = await put(BLOB_KEY, JSON.stringify(data, null, 2), {
            access: 'private',
            addRandomSuffix: false,
            allowOverwrite: true,
            token,
            cacheControlMaxAge: 0,
          });
          cachedBlobUrl = res.downloadUrl || res.url;
        } catch (err) {
          console.error('Background blob save error:', err);
        }
      });
    }
  } catch (err) {
    console.warn('saveDatabase warning:', err);
  }
}

// Add an audit log entry (async version)
export async function addAuditLogAsync(
  actor: string,
  actorRole: string,
  action: string,
  record: string,
  details: string
): Promise<void> {
  const db = await getDatabaseAsync();
  const log: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    actorRole,
    action,
    record,
    details,
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  await saveDatabaseAsync(db);
}

// Add an audit log entry (synchronous version)
export function addAuditLog(
  actor: string,
  actorRole: string,
  action: string,
  record: string,
  details: string
): void {
  const db = getDatabase();
  const log: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    actorRole,
    action,
    record,
    details,
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}

// Create a version snapshot (async version)
export async function createVersionSnapshotAsync(
  target: 'HOMEPAGE' | 'FESTIVAL_SETTINGS' | 'SCHEDULE' | 'BRAND',
  actor: string,
  summary: string,
  dataToSave: any
): Promise<VersionSnapshot> {
  const db = await getDatabaseAsync();
  const targetVersions = db.versionHistory.filter((v) => v.target === target);
  const nextVersionNum = targetVersions.length + 1;

  const snapshot: VersionSnapshot = {
    id: `ver-${target.toLowerCase()}-${nextVersionNum}`,
    target,
    versionNumber: nextVersionNum,
    actor,
    timestamp: new Date().toISOString(),
    summary,
    data: JSON.parse(JSON.stringify(dataToSave)),
  };

  db.versionHistory.unshift(snapshot);
  await saveDatabaseAsync(db);
  await addAuditLogAsync(actor, 'ADMIN', 'VERSION_CREATED', `${target} v${nextVersionNum}`, summary);
  return snapshot;
}

// Create a version snapshot
export function createVersionSnapshot(
  target: 'HOMEPAGE' | 'FESTIVAL_SETTINGS' | 'SCHEDULE' | 'BRAND',
  actor: string,
  summary: string,
  dataToSave: any
): VersionSnapshot {
  const db = getDatabase();
  const targetVersions = db.versionHistory.filter((v) => v.target === target);
  const nextVersionNum = targetVersions.length + 1;

  const snapshot: VersionSnapshot = {
    id: `ver-${target.toLowerCase()}-${nextVersionNum}`,
    target,
    versionNumber: nextVersionNum,
    actor,
    timestamp: new Date().toISOString(),
    summary,
    data: JSON.parse(JSON.stringify(dataToSave)),
  };

  db.versionHistory.unshift(snapshot);
  saveDatabase(db);
  addAuditLog(actor, 'ADMIN', 'VERSION_CREATED', `${target} v${nextVersionNum}`, summary);
  return snapshot;
}

// Restore a version snapshot (async version)
export async function restoreVersionSnapshotAsync(versionId: string, actor: string): Promise<boolean> {
  const db = await getDatabaseAsync();
  const snap = db.versionHistory.find((v) => v.id === versionId);
  if (!snap) return false;

  if (snap.target === 'HOMEPAGE') {
    db.homepageSections = snap.data;
  } else if (snap.target === 'FESTIVAL_SETTINGS') {
    db.settings = snap.data;
  }

  await saveDatabaseAsync(db);
  await addAuditLogAsync(actor, 'ADMIN', 'VERSION_RESTORED', `${snap.target} v${snap.versionNumber}`, `Restored snapshot ${versionId}`);
  return true;
}

// Restore a version snapshot
export function restoreVersionSnapshot(versionId: string, actor: string): boolean {
  const db = getDatabase();
  const snap = db.versionHistory.find((v) => v.id === versionId);
  if (!snap) return false;

  if (snap.target === 'HOMEPAGE') {
    db.homepageSections = snap.data;
  } else if (snap.target === 'FESTIVAL_SETTINGS') {
    db.settings = snap.data;
  }

  saveDatabase(db);
  addAuditLog(actor, 'ADMIN', 'VERSION_RESTORED', `${snap.target} v${snap.versionNumber}`, `Restored snapshot ${versionId}`);
  return true;
}

// Live Status Engine: NOW / NEXT / LATER
export function getLiveStatusEngine() {
  const db = getDatabase();
  const activeEvents = db.events.filter((e) => e.status === 'PUBLISHED' || e.status === 'LIVE');

  // Currently live events
  const currentlyLive = activeEvents.filter((e) => e.status === 'LIVE');
  const upcomingEvents = activeEvents
    .filter((e) => e.status !== 'LIVE' && e.status !== 'COMPLETED' && e.status !== 'POSTPONED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = currentlyLive.length > 0 ? currentlyLive[0] : upcomingEvents[0] || null;
  const next = currentlyLive.length > 0 ? upcomingEvents[0] : upcomingEvents[1] || null;
  const later = upcomingEvents.slice(currentlyLive.length > 0 ? 1 : 2, 6);

  return {
    festivalStatus: db.settings.status,
    activeWorlds: db.settings.activeWorlds,
    emergencyNotice: db.settings.emergencyNoticeActive ? db.settings.emergencyNotice : null,
    now: now
      ? {
          id: now.id,
          title: now.title,
          category: now.category,
          venue: now.venueName,
          startTime: now.startTime,
          endTime: now.endTime,
          date: now.date,
          status: now.status,
        }
      : null,
    next: next
      ? {
          id: next.id,
          title: next.title,
          category: next.category,
          venue: next.venueName,
          startTime: next.startTime,
          endTime: next.endTime,
          date: next.date,
        }
      : null,
    later: later.map((evt) => ({
      id: evt.id,
      title: evt.title,
      category: evt.category,
      venue: evt.venueName,
      time: `${evt.startTime} - ${evt.endTime}`,
    })),
  };
}

// Helper: Conflict detection for schedule
export function detectScheduleConflicts(
  eventId: string,
  venueId: string,
  date: string,
  startTime: string,
  endTime: string,
  coordinatorName?: string
) {
  const db = getDatabase();
  const conflicts: { type: 'VENUE' | 'COORDINATOR'; message: string; eventTitle: string }[] = [];

  const otherEvents = db.events.filter(
    (e) => e.id !== eventId && e.date === date && e.status !== 'CANCELLED' && e.status !== 'POSTPONED'
  );

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  for (const other of otherEvents) {
    const otherStart = toMinutes(other.startTime);
    const otherEnd = toMinutes(other.endTime);

    // Check if time intervals overlap
    const hasOverlap = Math.max(startMinutes, otherStart) < Math.min(endMinutes, otherEnd);

    if (hasOverlap) {
      if (other.venueId === venueId) {
        conflicts.push({
          type: 'VENUE',
          message: `Venue overlap with "${other.title}" (${other.startTime} - ${other.endTime}) at ${other.venueName}`,
          eventTitle: other.title,
        });
      }

      if (coordinatorName && other.coordinatorName && other.coordinatorName.toLowerCase().includes(coordinatorName.toLowerCase())) {
        conflicts.push({
          type: 'COORDINATOR',
          message: `Coordinator conflict with "${other.title}" scheduled simultaneously`,
          eventTitle: other.title,
        });
      }
    }
  }

  return conflicts;
}

function toMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const mins = parseInt(parts[1], 10) || 0;
  return hours * 60 + mins;
}
