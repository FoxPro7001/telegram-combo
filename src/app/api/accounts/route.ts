import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json([])
    }
    
    const accounts = await db.account.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, name, folder, projectId, proxyType, proxyHost, proxyPort } = body
    
    if (!phone?.trim() || !name?.trim() || !projectId) {
      return NextResponse.json({ error: 'Phone, name and projectId are required' }, { status: 400 })
    }
    
    const account = await db.account.create({
      data: {
        phone: phone.trim(),
        name: name.trim(),
        folder: folder || 'WORK',
        projectId,
        proxyType: proxyType || null,
        proxyHost: proxyHost || null,
        proxyPort: proxyPort || null,
        status: 'OFFLINE'
      }
    })
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('Failed to create account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
