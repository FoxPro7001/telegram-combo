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
      data: { 
        status: 'COMPLETED',
        progress: 100
      }
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error stopping task:', error)
    return NextResponse.json({ error: 'Failed to stop task' }, { status: 500 })
  }
}
