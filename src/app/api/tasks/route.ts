import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json([])
    }
    
    const tasks = await db.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, projectId, target, config, accountId } = body
    
    if (!name?.trim() || !type || !projectId) {
      return NextResponse.json({ error: 'Name, type and projectId are required' }, { status: 400 })
    }
    
    const task = await db.task.create({
      data: {
        name: name.trim(),
        type,
        projectId,
        target: target || 0,
        config: config || null,
        accountId: accountId || null,
        status: 'PAUSED'
      }
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
