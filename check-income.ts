import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIncomeData() {
  try {
    console.log('🔍 Checking Income Data...\n');
    
    const allIncome = await prisma.income.findMany({
      orderBy: { received_date: 'desc' },
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        expected_date: true,
        received_date: true,
        income_type: true,
      }
    });

    console.log('📊 All Income Records:');
    allIncome.forEach(income => {
      console.log(`  - ${income.title}`);
      console.log(`    Amount: $${income.amount}`);
      console.log(`    Status: ${income.status}`);
      console.log(`    Expected: ${income.expected_date?.toDateString() || 'N/A'}`);
      console.log(`    Received: ${income.received_date?.toDateString() || 'N/A'}`);
      console.log(`    Type: ${income.income_type}`);
      console.log('');
    });

    // Calculate December 2025 revenue
    const decemberStart = new Date('2025-12-01');
    const decemberEnd = new Date('2025-12-31');
    
    const decemberRevenue = await prisma.income.findMany({
      where: {
        received_date: {
          gte: decemberStart,
          lte: decemberEnd,
        },
        status: 'Received',
      }
    });

    const decemberTotal = decemberRevenue.reduce((sum, inc) => sum + Number(inc.amount), 0);
    
    console.log('💰 December 2025 Received Revenue:');
    decemberRevenue.forEach(income => {
      console.log(`  - ${income.title}: $${income.amount}`);
    });
    console.log(`  TOTAL: $${decemberTotal.toLocaleString()}\n`);

    // Calculate November 2025 revenue
    const novemberStart = new Date('2025-11-01');
    const novemberEnd = new Date('2025-11-30');
    
    const novemberRevenue = await prisma.income.findMany({
      where: {
        received_date: {
          gte: novemberStart,
          lte: novemberEnd,
        },
        status: 'Received',
      }
    });

    const novemberTotal = novemberRevenue.reduce((sum, inc) => sum + Number(inc.amount), 0);
    
    console.log('💰 November 2025 Received Revenue:');
    if (novemberRevenue.length === 0) {
      console.log('  - No income received in November');
    } else {
      novemberRevenue.forEach(income => {
        console.log(`  - ${income.title}: $${income.amount}`);
      });
    }
    console.log(`  TOTAL: $${novemberTotal.toLocaleString()}\n`);

    // Calculate percentage change
    let percentageChange;
    if (novemberTotal > 0) {
      percentageChange = Math.round(((decemberTotal - novemberTotal) / novemberTotal) * 100);
    } else {
      percentageChange = decemberTotal > 0 ? 100 : 0;
    }

    console.log('📈 Calculated Revenue Change:');
    console.log(`  December: $${decemberTotal.toLocaleString()}`);
    console.log(`  November: $${novemberTotal.toLocaleString()}`);
    console.log(`  Change: ${percentageChange >= 0 ? '+' : ''}${percentageChange}%`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIncomeData();
