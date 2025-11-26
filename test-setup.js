const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🔍 Checking existing contacts...\n');
    
    // Find contacts
    const contacts = await prisma.contact.findMany({ take: 5 });
    
    if (contacts.length === 0) {
      console.log('❌ No contacts found. Creating test contact...\n');
      
      const testContact = await prisma.contact.create({
        data: {
          name: 'Test Client',
          email: 'testclient@example.com',
          phone: '+1234567890',
          company: 'Test Company',
          type: 'LEAD',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Test contact created:', testContact);
      contacts.push(testContact);
    } else {
      console.log(`✅ Found ${contacts.length} contacts:\n`);
      contacts.forEach((c, i) => {
        console.log(`${i + 1}. ${c.name} (${c.email}) - ID: ${c.id}`);
      });
    }
    
    console.log('\n📋 Test Data Summary:');
    console.log('─────────────────────────────────────');
    console.log(`Contact ID to use: ${contacts[0].id}`);
    console.log(`Contact Name: ${contacts[0].name}`);
    console.log(`Contact Email: ${contacts[0].email}`);
    console.log('─────────────────────────────────────\n');
    
    // Check if client user already exists
    const existingClientUser = await prisma.clientUser.findFirst({
      where: { contact_id: contacts[0].id }
    });
    
    if (existingClientUser) {
      console.log('ℹ️  Client user already exists for this contact');
      console.log(`   Email: ${existingClientUser.email}`);
      console.log(`   Status: ${existingClientUser.status}\n`);
    } else {
      console.log('💡 Use this contact_id to register a new client user\n');
    }
    
    console.log('📝 Test Registration Command:');
    console.log('─────────────────────────────────────');
    console.log(`$body = @{ 
  email = "client${contacts[0].id}@test.com"
  password = "Client123!@#"
  contact_id = ${contacts[0].id}
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/client/auth/register" -Method POST -Body $body -ContentType "application/json"
$response`);
    console.log('─────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
