import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJsonPath = path.join(__dirname, '../package.json')

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Check if we're in a CI environment or production build
const isProduction = process.env.CI || process.env.VERCEL || process.env.NODE_ENV === 'production'

// Set the payload-auth version based on environment
packageJson.dependencies['payload-auth'] = isProduction ? 'latest' : 'workspace:*'

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

console.log(`Using ${isProduction ? 'published' : 'workspace'} version of payload-auth`)
