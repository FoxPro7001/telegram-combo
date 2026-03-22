import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json([])
    }
    
    const databases = await db.database.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(databases)
  } catch (error) {
    console.error('Failed to fetch databases:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, source, count, data, projectId } = body
    
    if (!name?.trim() || !projectId) {
      return NextResponse.json({ error: 'Name and projectId are required' }, { status: 400 })
    }
    
    const database = await db.database.create({
      data: {
        name: name.trim(),
        source: source || '',
        count: count || 0,
        data: data || null,
        projectId
      }
    })
    
    return NextResponse.json(database)
  } catch (error) {
    console.error('Failed to create database:', error)
    return NextResponse.json({ error: 'Failed to create database' }, { status: 500 })
  }
}
