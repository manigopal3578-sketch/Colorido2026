import { NextResponse } from 'next/server';
import {
  getDatabaseAsync,
  saveDatabaseAsync,
  createVersionSnapshotAsync,
  restoreVersionSnapshotAsync,
  defaultHeroConfig,
} from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabaseAsync();
    return NextResponse.json({
      success: true,
      draft: db.draftHomepageConfig || db.publishedHomepageConfig,
      published: db.publishedHomepageConfig,
      sections: db.homepageSections,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, hero, sections, sectionId, enabled, order, title, subtitle, restoreVersionId } = body;

    const db = await getDatabaseAsync();

    if (action === 'RESTORE_VERSION' && restoreVersionId) {
      const restored = await restoreVersionSnapshotAsync(restoreVersionId, session.name);
      if (!restored) {
        return NextResponse.json({ success: false, message: 'Version not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Homepage restored successfully!' });
    }

    if (action === 'SAVE_DRAFT') {
      const currentDraft = db.draftHomepageConfig || db.publishedHomepageConfig;
      db.draftHomepageConfig = {
        hero: { ...(currentDraft?.hero || defaultHeroConfig), ...(hero || {}) },
        sections: Array.isArray(sections) ? sections : (currentDraft?.sections || db.homepageSections),
        publishedAt: currentDraft?.publishedAt || new Date().toISOString(),
        publishedBy: session.name,
        version: currentDraft?.version || 1,
      };
      await saveDatabaseAsync(db);
      return NextResponse.json({
        success: true,
        message: 'Draft configuration saved successfully! (Not yet published to public website)',
        draft: db.draftHomepageConfig,
      });
    }

    if (action === 'PUBLISH' || (action === 'UPDATE_ALL' && Array.isArray(sections))) {
      const newVersion = (db.publishedHomepageConfig?.version || 0) + 1;
      const publishedAt = new Date().toISOString();
      const resolvedSections = Array.isArray(sections) ? sections : db.homepageSections;
      const resolvedHero = {
        ...(db.publishedHomepageConfig?.hero || defaultHeroConfig),
        ...(db.draftHomepageConfig?.hero || {}),
        ...(hero || {}),
      };

      // Create snapshot before publishing
      await createVersionSnapshotAsync(
        'HOMEPAGE',
        session.name,
        `Published Homepage v${newVersion} (${resolvedHero.title} ${resolvedHero.edition})`,
        { hero: resolvedHero, sections: resolvedSections }
      );

      // Save published configuration
      db.publishedHomepageConfig = {
        hero: resolvedHero,
        sections: resolvedSections,
        publishedAt,
        publishedBy: session.name,
        version: newVersion,
      };
      db.draftHomepageConfig = { ...db.publishedHomepageConfig };
      db.homepageSections = resolvedSections;

      // Sync settings for global consistency
      if (resolvedHero.title) {
        db.settings.shortName = resolvedHero.title;
      }
      if (resolvedHero.edition) {
        db.settings.edition = resolvedHero.edition;
      }
      if (resolvedHero.title && resolvedHero.edition) {
        db.settings.festivalName = `${resolvedHero.title} ${resolvedHero.edition}`;
      }
      if (resolvedHero.institutionalLabel) {
        db.settings.college = resolvedHero.institutionalLabel;
      }
      if (resolvedHero.tagline) {
        db.settings.tagline = resolvedHero.tagline;
      }
      if (resolvedHero.countdownVisible !== undefined) {
        db.settings.countdownVisible = resolvedHero.countdownVisible;
      }
      if (resolvedHero.targetDate) {
        const datePart = resolvedHero.targetDate.split('T')[0];
        if (datePart) db.settings.startDate = datePart;
      }

      await saveDatabaseAsync(db);

      return NextResponse.json({
        success: true,
        message: `Homepage configuration v${newVersion} published live to public website!`,
        publishedAt,
        version: newVersion,
        config: db.publishedHomepageConfig,
      });
    }

    if (action === 'TOGGLE_SECTION' && sectionId) {
      const target = db.homepageSections.find((s) => s.id === sectionId);
      if (!target) {
        return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
      }
      target.enabled = typeof enabled === 'boolean' ? enabled : !target.enabled;
      if (db.publishedHomepageConfig?.sections) {
        const pubSec = db.publishedHomepageConfig.sections.find((s) => s.id === sectionId);
        if (pubSec) pubSec.enabled = target.enabled;
      }
      await saveDatabaseAsync(db);
      return NextResponse.json({ success: true, section: target });
    }

    if (action === 'UPDATE_SECTION' && sectionId) {
      const target = db.homepageSections.find((s) => s.id === sectionId);
      if (!target) {
        return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
      }
      if (title !== undefined) target.title = title;
      if (subtitle !== undefined) target.subtitle = subtitle;
      if (order !== undefined) target.order = order;
      if (enabled !== undefined) target.enabled = enabled;

      if (db.publishedHomepageConfig?.sections) {
        const pubSec = db.publishedHomepageConfig.sections.find((s) => s.id === sectionId);
        if (pubSec) {
          if (title !== undefined) pubSec.title = title;
          if (subtitle !== undefined) pubSec.subtitle = subtitle;
          if (order !== undefined) pubSec.order = order;
          if (enabled !== undefined) pubSec.enabled = enabled;
        }
      }

      await saveDatabaseAsync(db);
      return NextResponse.json({ success: true, section: target });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
