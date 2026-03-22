import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const database = await db.database.findUnique({
      where: { id }
    })
    
    if (!database) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }
    
    return NextResponse.json(database)
  } catch (error) {
    console.error('Failed to fetch database:', error)
    return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, source, count, data } = body
    
    const database = await db.database.update({
      where: { id },
      data: {
        name: name?.trim(),
        source,
        count,
        data
      }
    })
    
    return NextResponse.json(database)
  } catch (error) {
    console.error('Failed to update database:', error)
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.database.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete database:', error)
    return NextResponse.json({ error: 'Failed to delete database' }, { status: 500 })
  }
}
