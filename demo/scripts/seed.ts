import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { sql } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'

/**
 * Seed script to create the first admin user.
 * Creates an admin user if no admin users exist in the database.
 * 
 * Configuration:
 * - ADMIN_EMAIL: Admin user email
 * - ADMIN_PASSWORD: Admin user password
 * - ADMIN_NAME: Admin user display name
 */
async function seed() {
  console.log('Starting seed process...')

  try {
    const payload = await getPayload({ config })

    // Check if admin user already exists
    const existingAdmins = await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'admin'
        }
      },
      limit: 1
    })

    if (existingAdmins.docs.length > 0) {
      console.log('Admin user already exists. Skipping seed.')
      process.exit(0)
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME

    // Validate required environment variables
    const missingVars = []
    if (!adminEmail) missingVars.push('ADMIN_EMAIL')
    if (!adminPassword) missingVars.push('ADMIN_PASSWORD')
    if (!adminName) missingVars.push('ADMIN_NAME')

    if (missingVars.length > 0) {
      console.error('Error: Missing required environment variables:')
      missingVars.forEach(varName => console.error(`  - ${varName}`))
      console.error('')
      console.error('Please set these variables in your .env file.')
      console.error('See .env.example for reference.')
      process.exit(1)
    }

    console.log(`Creating admin user with email: ${adminEmail}`)

    // Hash the password using Better Auth's hashPassword function
    const hashedPassword = await hashPassword(adminPassword as string)

    // Create the admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: adminEmail as string,
        name: adminName as string,
        role: 'admin',
        emailVerified: true,
      }
    })

    console.log('Admin user created with ID:', adminUser.id)

    // Create account entry for credential-based authentication
    // Use raw SQL to bypass Payload validation hooks
    const db = payload.db
    const now = new Date().toISOString()
    
    await db.drizzle.execute(
      sql`
        INSERT INTO accounts (account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES (${adminEmail}, ${'credential'}, ${adminUser.id}, ${hashedPassword}, ${now}, ${now})
      `
    )

    console.log('Account entry created for credential authentication')
    console.log('')
    console.log('Admin user created successfully!')
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Password: ${adminPassword}`)
    console.log(`  Role: admin`)
    console.log('')
    console.log('WARNING: Please change the admin password after first login if you use default config!')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

seed()
