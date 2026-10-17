import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { GateItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabaseAsync();
    return NextResponse.json({
      success: true,
      gates: db.gates || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to load gates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session || session.role === 'CHECK_IN_STAFF') {
      return NextResponse.json({ success: false, message: 'Access denied: Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, isActive = true } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Gate Name and Code are required' }, { status: 400 });
    }

    const db = await getDatabaseAsync();
    if (!db.gates) db.gates = [];

    const newGate: GateItem = {
      id: `gate-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      isActive: Boolean(isActive),
      assignedStaffIds: [],
      createdAt: new Date().toISOString(),
    };

    db.gates.push(newGate);
    await saveDatabaseAsync(db);

    await addAuditLogAsync(session.name, session.role, 'GATE_CREATED', newGate.code, `Created gate checkpoint ${newGate.name}`);

    return NextResponse.json({ success: true, gate: newGate, gates: db.gates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create gate' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session || session.role === 'CHECK_IN_STAFF') {
      return NextResponse.json({ success: false, message: 'Access denied: Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, message: 'Gate ID and updates required' }, { status: 400 });
    }

    const db = await getDatabaseAsync();
    const gateIndex = (db.gates || []).findIndex((g) => g.id === id);

    if (gateIndex === -1) {
      return NextResponse.json({ success: false, message: 'Gate not found' }, { status: 404 });
    }

    Object.assign(db.gates[gateIndex], updates);
    await saveDatabaseAsync(db);

    await addAuditLogAsync(
      session.name,
      session.role,
      'GATE_UPDATED',
      db.gates[gateIndex].code,
      `Updated gate ${db.gates[gateIndex].name}`
    );

    return NextResponse.json({ success: true, gate: db.gates[gateIndex], gates: db.gates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update gate' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session || session.role === 'CHECK_IN_STAFF') {
      return NextResponse.json({ success: false, message: 'Access denied: Admin required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Gate ID is required' }, { status: 400 });
    }

    const db = await getDatabaseAsync();
    const gate = (db.gates || []).find((g) => g.id === id);
    if (!gate) {
      return NextResponse.json({ success: false, message: 'Gate not found' }, { status: 404 });
    }

    db.gates = db.gates.filter((g) => g.id !== id);
    await saveDatabaseAsync(db);

    await addAuditLogAsync(session.name, session.role, 'GATE_DELETED', gate.code, `Removed gate checkpoint ${gate.name}`);

    return NextResponse.json({ success: true, gates: db.gates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete gate' }, { status: 500 });
  }
}
