#!/usr/bin/env node

/**
 * Setup script for MediaFlow CRM Backend
 * 
 * This script helps developers quickly set up the backend by:
 * 1. Installing dependencies
 * 2. Setting up environment variables
 * 3. Initializing the database
 * 4. Seeding sample data (optional)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  log('\n📋 Setting up environment variables...', 'blue');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Skipping environment setup', 'yellow');
      return;
    }
  }
  
  log('\nPlease provide the following information:', 'yellow');
  
  const dbUser = await question('Database username (default: postgres): ') || 'postgres';
  const dbPassword = await question('Database password: ');
  const dbHost = await question('Database host (default: localhost): ') || 'localhost';
  const dbPort = await question('Database port (default: 5432): ') || '5432';
  const dbName = await question('Database name (default: mediaflow_crm): ') || 'mediaflow_crm';
  const port = await question('API server port (default: 4000): ') || '4000';
  
  // Generate random secrets
  const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const jwtRefreshSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const envContent = `# Environment Configuration
NODE_ENV=development

# Server
PORT=${port}
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public

# JWT
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Email (configure later)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Frontend URL
FRONTEND_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  log('✓ Environment variables configured', 'green');
}

async function main() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║                                            ║', 'cyan');
  log('║   🚀 MediaFlow CRM Backend Setup          ║', 'cyan');
  log('║                                            ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  // Step 1: Install dependencies
  const installDeps = await question('\n1. Install dependencies? (Y/n): ');
  if (installDeps.toLowerCase() !== 'n') {
    execCommand('npm install', 'Installing dependencies');
  }
  
  // Step 2: Setup environment
  const setupEnv = await question('\n2. Setup environment variables? (Y/n): ');
  if (setupEnv.toLowerCase() !== 'n') {
    await setupEnvironment();
  }
  
  // Step 3: Generate Prisma Client
  const genPrisma = await question('\n3. Generate Prisma Client? (Y/n): ');
  if (genPrisma.toLowerCase() !== 'n') {
    execCommand('npm run prisma:generate', 'Generating Prisma Client');
  }
  
  // Step 4: Run migrations
  const runMigrations = await question('\n4. Run database migrations? (Y/n): ');
  if (runMigrations.toLowerCase() !== 'n') {
    execCommand('npm run prisma:migrate', 'Running database migrations');
  }
  
  // Step 5: Seed database
  const seedDb = await question('\n5. Seed database with sample data? (y/N): ');
  if (seedDb.toLowerCase() === 'y') {
    execCommand('npm run prisma:seed', 'Seeding database');
  }
  
  log('\n╔════════════════════════════════════════════╗', 'green');
  log('║                                            ║', 'green');
  log('║   ✓ Setup completed successfully!         ║', 'green');
  log('║                                            ║', 'green');
  log('╚════════════════════════════════════════════╝', 'green');
  
  log('\n📚 Next steps:', 'cyan');
  log('  1. Review your .env file', 'yellow');
  log('  2. Start the development server:', 'yellow');
  log('     npm run dev', 'blue');
  log('  3. Visit http://localhost:4000', 'yellow');
  log('  4. Check API documentation at http://localhost:4000/api/docs', 'yellow');
  
  rl.close();
}

main().catch((error) => {
  log(`\n✗ Setup failed: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
