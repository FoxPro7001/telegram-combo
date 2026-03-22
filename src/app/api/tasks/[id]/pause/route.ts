import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const task = await db.task.update({
      where: { id },
      data: { status: 'PAUSED' }
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error pausing task:', error)
    return NextResponse.json({ error: 'Failed to pause task' }, { status: 500 })
  }
}
