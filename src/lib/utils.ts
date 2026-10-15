import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EventItem, RegistrationItem } from './types';
import type { DatabaseSchema } from './db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function generateRegistrationId(category: string, subcategory: string = ''): string {
  const prefix = 'CLR26';
  const catCode = category === 'cultural' ? 'CLT' : category === 'sports' ? 'SPT' : 'TCH';
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${catCode}-${randomHex}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateCsvContent(headers: string[], rows: (string | number)[][]): string {
  const escapedHeaders = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const escapedRows = rows.map((row) =>
    row
      .map((cell) => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [escapedHeaders, ...escapedRows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function calculateEventStats(eventId: string, db: DatabaseSchema) {
  const event = db.events.find((e) => e.id === eventId);
  const registrations = db.registrations.filter((r) => r.eventId === eventId);
  const checkIns = db.checkIns.filter((c) => c.eventId === eventId);

  const totalRegistrations = registrations.length;
  const rvrjcCount = registrations.filter((r) => r.collegeType === 'RVRJC').length;
  const otherCollegeCount = totalRegistrations - rvrjcCount;

  // Unique colleges
  const uniqueColleges = Array.from(new Set(registrations.map((r) => r.collegeName))).filter(Boolean);

  // Departments
  const deptMap: Record<string, number> = {};
  registrations.forEach((r) => {
    if (r.department) {
      deptMap[r.department] = (deptMap[r.department] || 0) + 1;
    }
  });

  // Year breakdown
  const yearMap: Record<string, number> = {};
  registrations.forEach((r) => {
    if (r.year) {
      yearMap[r.year] = (yearMap[r.year] || 0) + 1;
    }
  });

  const checkedInCount = checkIns.length;
  const pendingCheckIn = Math.max(0, totalRegistrations - checkedInCount);
  const capacity = event?.capacity || 50;
  const remainingCapacity = Math.max(0, capacity - totalRegistrations);
  const capacityUtilization = Math.min(100, Math.round((totalRegistrations / (capacity || 1)) * 100));

  // Teams
  const teams = registrations.filter((r) => r.teamName).length;

  return {
    totalRegistrations,
    rvrjcCount,
    otherCollegeCount,
    uniqueCollegesCount: uniqueColleges.length,
    checkedInCount,
    pendingCheckIn,
    capacity,
    remainingCapacity,
    capacityUtilization,
    teamsCount: teams,
    deptDistribution: deptMap,
    yearDistribution: yearMap,
    collegeDistribution: uniqueColleges,
  };
}
