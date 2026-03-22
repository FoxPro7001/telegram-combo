import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if we already have projects
    const existingProjects = await db.project.count()
    
    if (existingProjects > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingProjects })
    }
    
    // Create initial projects
    const projects = await Promise.all([
      db.project.create({
        data: {
          name: 'Crypto Project',
          description: 'Криптовалютный проект',
          color: '#8B5CF6'
        }
      }),
      db.project.create({
        data: {
          name: 'Marketing Agency',
          description: 'Маркетинговое агентство',
          color: '#10B981'
        }
      }),
      db.project.create({
        data: {
          name: 'Personal',
          description: 'Личные нужды',
          color: '#F59E0B'
        }
      })
    ])
    
    // Create some accounts for first project
    await Promise.all([
      db.account.create({
        data: {
          phone: '+7 999 123 4567',
          name: 'Crypto Bot #1',
          projectId: projects[0].id,
          folder: 'WORK',
          status: 'ONLINE'
        }
      }),
      db.account.create({
        data: {
          phone: '+7 999 234 5678',
          name: 'Crypto Bot #2',
          projectId: projects[0].id,
          folder: 'WORK',
          status: 'ONLINE'
        }
      }),
      db.account.create({
        data: {
          phone: '+7 999 345 6789',
          name: 'Admin Crypto',
          projectId: projects[0].id,
          folder: 'ADMINS',
          status: 'ONLINE'
        }
      }),
      db.account.create({
        data: {
          phone: '+7 999 456 7890',
          name: 'Marketing Bot #1',
          projectId: projects[1].id,
          folder: 'WORK',
          status: 'ONLINE'
        }
      }),
      db.account.create({
        data: {
          phone: '+7 999 567 8901',
          name: 'Support Bot',
          projectId: projects[1].id,
          folder: 'WORK',
          status: 'WARMING',
          warmupProgress: 65,
          warmupDays: 7
        }
      }),
      db.account.create({
        data: {
          phone: '+7 999 789 0123',
          name: 'Personal Main',
          projectId: projects[2].id,
          folder: 'PERSONAL',
          status: 'OFFLINE'
        }
      })
    ])
    
    // Create initial settings
    await db.settings.create({
      data: {
        maxMessagesPerDay: 500,
        maxInvitesPerDay: 50,
        actionDelay: 30
      }
    })
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      projects: projects.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
