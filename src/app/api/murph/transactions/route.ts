import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  return NextResponse.json({
    address,
    transactions: [
      { id:'tx1', type:'prediction_win', amount:320, timestamp:'2025-03-20T14:00:00Z', description:'Won prediction: ORACLE survives to Turn 50' },
      { id:'tx2', type:'prediction_loss', amount:-200, timestamp:'2025-03-19T10:00:00Z', description:'Lost prediction: CERBERUS wins Match #139' },
      { id:'tx3', type:'checkin_reward', amount:100, timestamp:'2025-03-21T08:00:00Z', description:'Daily check-in reward' },
    ],
    total: 3,
  });
}
