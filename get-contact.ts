import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getContactId() {
  try {
    const contact = await prisma.contacts.findFirst({
      orderBy: { created_at: 'desc' }
    });
    
    if (contact) {
      console.log(JSON.stringify({ id: contact.id, name: contact.name, email: contact.email }, null, 2));
    } else {
      console.log('{"error": "No contacts found"}');
    }
  } catch (error) {
    console.error('{"error": "' + error.message + '"}');
  } finally {
    await prisma.$disconnect();
  }
}

getContactId();
