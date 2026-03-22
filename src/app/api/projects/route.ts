import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        _count: {
          select: { accounts: true, databases: true, tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(projects.map(p => ({
      ...p,
      accounts: Array(p._count.accounts).fill(null),
      databases: Array(p._count.databases).fill(null),
      tasks: Array(p._count.tasks).fill(null)
    })))
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, color } = body
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const project = await db.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#8B5CF6'
      }
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
