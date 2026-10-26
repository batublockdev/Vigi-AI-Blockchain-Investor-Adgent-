import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;

    const action = searchParams.get('action') || '';
    const asset = searchParams.get('asset') || '';
    const search = searchParams.get('search') || '';

    const client = await pool.connect();
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (action && action !== 'ALL') {
        conditions.push(`action = $${paramIndex++}`);
        values.push(action);
      }

      if (asset && asset !== 'ALL') {
        conditions.push(`(asset_symbol = $${paramIndex} OR asset = $${paramIndex})`);
        paramIndex++;
        values.push(asset);
      }

      if (search) {
        conditions.push(`(reason ILIKE $${paramIndex} OR asset_symbol ILIKE $${paramIndex} OR action ILIKE $${paramIndex})`);
        paramIndex++;
        values.push(`%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count query
      const countRes = await client.query(
        `SELECT COUNT(*) as count FROM stockwallet_activity ${whereClause}`,
        values
      );
      const total = parseInt(countRes.rows[0].count, 10);

      // Data query
      const dataQuery = `
        SELECT 
          id,
          timestamp,
          type,
          asset,
          asset_symbol,
          balance,
          estimated_value,
          invested,
          action,
          reason,
          tx_hash,
          pool_fee,
          confidence
        FROM stockwallet_activity
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      values.push(limit, offset);

      const dataRes = await client.query(dataQuery, values);

      return NextResponse.json({
        success: true,
        data: dataRes.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('API /api/activity error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Database Error' },
      { status: 500 }
    );
  }
}
