 import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/crypto';

const prisma = new PrismaClient();
console.log(prisma)

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.project_assignments.deleteMany();
  await prisma.team_project_assignments.deleteMany();
  await prisma.team_invitations.deleteMany();
  await prisma.financial_transactions.deleteMany();
  await prisma.expenses.deleteMany();
  await prisma.income.deleteMany();
  await prisma.proposals.deleteMany();
  await prisma.events.deleteMany();
  await prisma.assets.deleteMany();
  await prisma.tasks.deleteMany();
  await prisma.projects.deleteMany();
  await prisma.contacts.deleteMany();
  await prisma.teams.deleteMany();
  await prisma.team_members.deleteMany();
  console.log('✓ Cleaned existing data\n');

  // 1. Create Team Members (Users)
  console.log('👥 Creating team members...');
  const hashedPassword = await hashPassword('Password123');

  const admin = await prisma.team_members.create({
    data: {
      email: 'admin@mediaflow.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Admin',
      phone: '+1-555-0101',
      role: 'admin',
      position: 'CEO',
      department: 'Management',
      status: 'active',
      permissions: {
        can_manage_projects: true,
        can_send_proposals: true,
        can_approve_expenses: true,
        can_manage_team: true,
        can_view_financials: true,
        can_manage_assets: true,
        can_access_client_portal: true,
      },
      hourly_rate: 150,
      bio: 'Founder and CEO of MediaFlow',
      skills: ['Leadership', 'Project Management', 'Business Development'],
    },
  });

  const producer = await prisma.team_members.create({
    data: {
      email: 'sarah.producer@mediaflow.com',
      password: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+1-555-0102',
      role: 'producer',
      position: 'Senior Producer',
      department: 'Production',
      status: 'active',
      permissions: {
        can_manage_projects: true,
        can_send_proposals: true,
        can_approve_expenses: true,
        can_manage_team: false,
        can_view_financials: true,
        can_manage_assets: true,
        can_access_client_portal: true,
      },
      hourly_rate: 120,
      bio: 'Experienced producer with 10+ years in commercial production',
      skills: ['Production Management', 'Budgeting', 'Client Relations'],
    },
  });

  const director = await prisma.team_members.create({
    data: {
      email: 'mike.director@mediaflow.com',
      password: hashedPassword,
      first_name: 'Mike',
      last_name: 'Williams',
      phone: '+1-555-0103',
      role: 'director',
      position: 'Creative Director',
      department: 'Creative',
      status: 'active',
      permissions: {
        can_manage_projects: true,
        can_send_proposals: false,
        can_approve_expenses: false,
        can_manage_team: false,
        can_view_financials: false,
        can_manage_assets: true,
        can_access_client_portal: false,
      },
      hourly_rate: 130,
      bio: 'Award-winning director specializing in commercials and music videos',
      skills: ['Directing', 'Creative Vision', 'Cinematography'],
    },
  });

  const editor = await prisma.team_members.create({
    data: {
      email: 'emily.editor@mediaflow.com',
      password: hashedPassword,
      first_name: 'Emily',
      last_name: 'Chen',
      phone: '+1-555-0104',
      role: 'editor',
      position: 'Lead Editor',
      department: 'Post-Production',
      status: 'active',
      permissions: {
        can_manage_projects: false,
        can_send_proposals: false,
        can_approve_expenses: false,
        can_manage_team: false,
        can_view_financials: false,
        can_manage_assets: true,
        can_access_client_portal: false,
      },
      hourly_rate: 90,
      bio: 'Expert video editor with mastery in Adobe Premiere and DaVinci Resolve',
      skills: ['Video Editing', 'Color Grading', 'Motion Graphics'],
    },
  });

  const coordinator = await prisma.team_members.create({
    data: {
      email: 'alex.coordinator@mediaflow.com',
      password: hashedPassword,
      first_name: 'Alex',
      last_name: 'Martinez',
      phone: '+1-555-0105',
      role: 'member',
      position: 'Production Coordinator',
      department: 'Production',
      status: 'active',
      permissions: {
        can_manage_projects: false,
        can_send_proposals: false,
        can_approve_expenses: false,
        can_manage_team: false,
        can_view_financials: false,
        can_manage_assets: false,
        can_access_client_portal: false,
      },
      hourly_rate: 60,
      bio: 'Organized coordinator keeping productions on schedule',
      skills: ['Scheduling', 'Logistics', 'Communication'],
    },
  });

  console.log(`✓ Created ${5} team members\n`);

  // 2. Create Teams
  console.log('🏢 Creating teams...');
  const productionTeam = await prisma.teams.create({
    data: {
      name: 'Commercial Production Team',
      description: 'Primary team handling commercial video production',
      manager_id: producer.id,
      member_ids: [producer.id, director.id, coordinator.id],
      created_by: admin.id,
    },
  });

  const postProductionTeam = await prisma.teams.create({
    data: {
      name: 'Post-Production Team',
      description: 'Team handling video editing and post-production',
      manager_id: editor.id,
      member_ids: [editor.id],
      created_by: admin.id,
    },
  });

  console.log(`✓ Created ${2} teams\n`);

  // 3. Create Contacts (Clients & Vendors)
  console.log('📇 Creating contacts...');
  const client1 = await prisma.contacts.create({
    data: {
      name: 'David Thompson',
      email: 'david@techcorp.com',
      phone: '+1-555-1001',
      company: 'TechCorp Industries',
      role: 'Client',
      status: 'Active',
      notes: 'Large tech company, frequently orders corporate videos',
      tags: ['Corporate', 'Technology', 'High-Value'],
    },
  });

  const client2 = await prisma.contacts.create({
    data: {
      name: 'Lisa Anderson',
      email: 'lisa@fashionbrand.com',
      phone: '+1-555-1002',
      company: 'Fashion Forward Inc',
      role: 'Client',
      status: 'Active',
      notes: 'Fashion brand, interested in commercial and social media content',
      tags: ['Fashion', 'Social Media', 'Recurring'],
    },
  });

  const client3 = await prisma.contacts.create({
    data: {
      name: 'Robert Miller',
      email: 'robert@startup.io',
      phone: '+1-555-1003',
      company: 'Startup Innovations',
      role: 'Client',
      status: 'Prospect',
      notes: 'Startup company, exploring video marketing options',
      tags: ['Startup', 'Small Business'],
    },
  });

  const vendor1 = await prisma.contacts.create({
    data: {
      name: 'Equipment Rentals Pro',
      email: 'rentals@equipmentpro.com',
      phone: '+1-555-2001',
      company: 'Equipment Rentals Pro',
      role: 'Vendor',
      status: 'Active',
      notes: 'Primary equipment rental supplier',
      tags: ['Equipment', 'Rental', 'Preferred Vendor'],
    },
  });

  const freelancer1 = await prisma.contacts.create({
    data: {
      name: 'Tom Jackson',
      email: 'tom@freelancer.com',
      phone: '+1-555-3001',
      company: 'Independent',
      role: 'Freelancer',
      status: 'Active',
      notes: 'Experienced cinematographer available for hire',
      tags: ['Cinematographer', 'Freelance'],
    },
  });

  console.log(`✓ Created ${5} contacts\n`);

  // 4. Create Projects
  console.log('📁 Creating projects...');
  const project1 = await prisma.projects.create({
    data: {
      title: 'TechCorp Product Launch Video',
      description: 'High-end commercial for new product launch. 60-second spot for TV and digital.',
      type: 'Commercial',
      status: 'Active',
      phase: 'Production',
      client_id: client1.id,
      budget: 50000,
      start_date: new Date('2025-11-01'),
      end_date: new Date('2025-12-15'),
      team_members: [],
    },
  });

  const project2 = await prisma.projects.create({
    data: {
      title: 'Fashion Forward Spring Collection',
      description: 'Social media video series showcasing spring fashion collection. 10 short videos.',
      type: 'Commercial',
      status: 'Active',
      phase: 'Pre-production',
      client_id: client2.id,
      budget: 25000,
      start_date: new Date('2025-12-01'),
      end_date: new Date('2026-01-30'),
      team_members: [],
    },
  });

  const project3 = await prisma.projects.create({
    data: {
      title: 'Corporate Training Series',
      description: 'Internal training video series for TechCorp employees. 5 modules.',
      type: 'Corporate',
      status: 'Active',
      phase: 'Post-production',
      client_id: client1.id,
      budget: 30000,
      start_date: new Date('2025-10-01'),
      end_date: new Date('2025-11-30'),
      team_members: [],
    },
  });

  const project4 = await prisma.projects.create({
    data: {
      title: 'Music Video - Local Artist',
      description: 'Creative music video for emerging artist',
      type: 'Music Video',
      status: 'Completed',
      phase: 'Delivered',
      client_id: null,
      budget: 15000,
      start_date: new Date('2025-09-01'),
      end_date: new Date('2025-10-15'),
      team_members: [],
    },
  });

  console.log(`✓ Created ${4} projects\n`);

  // 5. Create Project Assignments
  console.log('👔 Creating project assignments...');
  await prisma.project_assignments.createMany({
    data: [
      {
        project_id: project1.id,
        team_member_id: producer.id,
        role_in_project: 'Producer',
        is_lead: true,
        assigned_by: admin.id,
        responsibilities: ['Budget Management', 'Client Communication', 'Schedule Oversight'],
      },
      {
        project_id: project1.id,
        team_member_id: director.id,
        role_in_project: 'Director',
        is_lead: false,
        assigned_by: producer.id,
        responsibilities: ['Creative Direction', 'Shot Planning', 'On-Set Management'],
      },
      {
        project_id: project1.id,
        team_member_id: editor.id,
        role_in_project: 'Editor',
        is_lead: false,
        assigned_by: producer.id,
        responsibilities: ['Video Editing', 'Color Correction', 'Final Delivery'],
      },
    ],
  });

  console.log(`✓ Created project assignments\n`);

  // 6. Create Tasks
  console.log('✅ Creating tasks...');
  await prisma.tasks.createMany({
    data: [
      {
        title: 'Pre-production meeting with client',
        description: 'Review script, shot list, and production schedule',
        status: 'Completed',
        project_id: project1.id,
        assigned_to: client1.id,
        due_date: new Date('2025-11-05'),
        priority: 'High',
        type: 'Creative',
      },
      {
        title: 'Scout locations',
        description: 'Find and secure 3 shooting locations',
        status: 'Completed',
        project_id: project1.id,
        assigned_to: client1.id,
        due_date: new Date('2025-11-10'),
        priority: 'High',
        type: 'Technical',
      },
      {
        title: 'Equipment rental booking',
        description: 'Book camera package and lighting for 3-day shoot',
        status: 'In Progress',
        project_id: project1.id,
        assigned_to: vendor1.id,
        due_date: new Date('2025-11-20'),
        priority: 'High',
        type: 'Administrative',
      },
      {
        title: 'Principal photography - Day 1',
        description: 'Shoot main product sequences',
        status: 'To Do',
        project_id: project1.id,
        assigned_to: freelancer1.id,
        due_date: new Date('2025-11-25'),
        priority: 'High',
        type: 'Creative',
      },
      {
        title: 'Rough cut edit',
        description: 'Assemble first cut for client review',
        status: 'To Do',
        project_id: project1.id,
        assigned_to: client1.id,
        due_date: new Date('2025-12-01'),
        priority: 'Medium',
        type: 'Technical',
      },
      {
        title: 'Initial concept development',
        description: 'Create mood boards and style references',
        status: 'In Progress',
        project_id: project2.id,
        assigned_to: client2.id,
        due_date: new Date('2025-12-05'),
        priority: 'High',
        type: 'Creative',
      },
      {
        title: 'Final color grade',
        description: 'Complete color grading on all training modules',
        status: 'In Review',
        project_id: project3.id,
        assigned_to: client1.id,
        due_date: new Date('2025-11-28'),
        priority: 'High',
        type: 'Technical',
      },
    ],
  });

  console.log(`✓ Created ${7} tasks\n`);

  // 7. Create Expenses
  console.log('💰 Creating expenses...');
  await prisma.expenses.createMany({
    data: [
      {
        project_id: project1.id,
        title: 'Camera Equipment Rental',
        description: 'RED camera package for 3-day shoot',
        amount: 4500,
        category: 'Equipment Rental',
        expense_date: new Date('2025-11-15'),
        vendor: 'Equipment Rentals Pro',
        status: 'Approved',
        submitted_by: coordinator.id,
        approved_by: producer.id,
        approved_at: new Date('2025-11-16'),
        receipt_url: '/uploads/receipts/camera-rental-001.pdf',
      },
      {
        project_id: project1.id,
        title: 'Location Fee - Downtown Studio',
        description: 'Studio rental for 2 days',
        amount: 2000,
        category: 'Location',
        expense_date: new Date('2025-11-18'),
        vendor: 'Downtown Studios LLC',
        status: 'Approved',
        submitted_by: coordinator.id,
        approved_by: producer.id,
        approved_at: new Date('2025-11-18'),
      },
      {
        project_id: project1.id,
        title: 'Crew Catering',
        description: 'Lunch and snacks for 15 crew members, 3 days',
        amount: 1200,
        category: 'Catering',
        expense_date: new Date('2025-11-20'),
        vendor: 'Film Craft Catering',
        status: 'Submitted',
        submitted_by: coordinator.id,
      },
      {
        project_id: project2.id,
        title: 'Freelance Stylist',
        description: 'Fashion stylist for pre-production',
        amount: 800,
        category: 'Crew',
        expense_date: new Date('2025-12-02'),
        vendor: null,
        status: 'Draft',
        submitted_by: producer.id,
      },
      {
        project_id: project3.id,
        title: 'Stock Footage License',
        description: 'Corporate stock footage for training videos',
        amount: 500,
        category: 'Post Production',
        expense_date: new Date('2025-11-10'),
        vendor: 'Shutterstock',
        status: 'Paid',
        submitted_by: editor.id,
        approved_by: producer.id,
        approved_at: new Date('2025-11-11'),
      },
    ],
  });

  console.log(`✓ Created ${5} expenses\n`);

  // 8. Create Income
  console.log('💵 Creating income records...');
  await prisma.income.createMany({
    data: [
      {
        project_id: project1.id,
        client_id: client1.id,
        title: 'TechCorp Product Launch - Deposit',
        description: '50% deposit payment',
        amount: 25000,
        income_type: 'Deposit',
        expected_date: new Date('2025-11-01'),
        received_date: new Date('2025-11-01'),
        status: 'Received',
        invoice_number: 'INV-2025-001',
      },
      {
        project_id: project1.id,
        client_id: client1.id,
        title: 'TechCorp Product Launch - Final Payment',
        description: 'Final 50% payment upon delivery',
        amount: 25000,
        income_type: 'Final Payment',
        expected_date: new Date('2025-12-15'),
        status: 'Expected',
        invoice_number: 'INV-2025-002',
      },
      {
        project_id: project2.id,
        client_id: client2.id,
        title: 'Fashion Forward Spring - Deposit',
        description: '40% deposit payment',
        amount: 10000,
        income_type: 'Deposit',
        expected_date: new Date('2025-12-01'),
        received_date: new Date('2025-12-01'),
        status: 'Received',
        invoice_number: 'INV-2025-003',
      },
      {
        project_id: project3.id,
        client_id: client1.id,
        title: 'Corporate Training Series - Full Payment',
        description: 'Full payment for training video series',
        amount: 30000,
        income_type: 'Project Payment',
        expected_date: new Date('2025-11-30'),
        status: 'Expected',
        invoice_number: 'INV-2025-004',
      },
      {
        project_id: project4.id,
        client_id: null,
        title: 'Music Video Project - Payment',
        description: 'Payment for completed music video',
        amount: 15000,
        income_type: 'Final Payment',
        expected_date: new Date('2025-10-15'),
        received_date: new Date('2025-10-15'),
        status: 'Received',
        invoice_number: 'INV-2025-005',
      },
    ],
  });

  console.log(`✓ Created ${5} income records\n`);

  // 9. Create Proposals
  console.log('📄 Creating proposals...');
  await prisma.proposals.createMany({
    data: [
      {
        title: 'TechCorp Product Launch Video - Proposal',
        client_id: client1.id,
        project_id: project1.id,
        status: 'Accepted',
        total_amount: 50000,
        valid_until: new Date('2025-11-15'),
        terms: 'Payment terms: 50% deposit, 50% upon delivery. Copyright transferred upon final payment.',
        notes: 'Includes 2 rounds of revisions',
        items: [
          { description: 'Pre-production & Planning', quantity: 1, rate: 5000, amount: 5000 },
          { description: 'Production (3-day shoot)', quantity: 3, rate: 8000, amount: 24000 },
          { description: 'Post-production & Editing', quantity: 1, rate: 15000, amount: 15000 },
          { description: 'Music Licensing', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Revisions (2 rounds)', quantity: 1, rate: 3000, amount: 3000 },
        ],
        sent_at: new Date('2025-10-20'),
        viewed_at: new Date('2025-10-21'),
        accepted_at: new Date('2025-10-25'),
      },
      {
        title: 'Fashion Forward Spring Collection - Proposal',
        client_id: client2.id,
        project_id: project2.id,
        status: 'Accepted',
        total_amount: 25000,
        valid_until: new Date('2025-12-15'),
        terms: '40% deposit, 60% upon final delivery. All content deliverables included.',
        items: [
          { description: 'Concept Development', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Production (10 videos)', quantity: 10, rate: 1500, amount: 15000 },
          { description: 'Editing & Color Grading', quantity: 1, rate: 5000, amount: 5000 },
          { description: 'Social Media Formatting', quantity: 1, rate: 2000, amount: 2000 },
        ],
        sent_at: new Date('2025-11-15'),
        viewed_at: new Date('2025-11-16'),
        accepted_at: new Date('2025-11-18'),
      },
      {
        title: 'Startup Innovations - Brand Video Proposal',
        client_id: client3.id,
        status: 'Sent',
        total_amount: 12000,
        valid_until: new Date('2025-12-31'),
        terms: 'Startup-friendly payment plan: 3 installments',
        items: [
          { description: 'Brand Story Video (90 sec)', quantity: 1, rate: 8000, amount: 8000 },
          { description: 'Team Interview Sequences', quantity: 1, rate: 2000, amount: 2000 },
          { description: 'Motion Graphics Package', quantity: 1, rate: 2000, amount: 2000 },
        ],
        sent_at: new Date('2025-11-20'),
        viewed_at: new Date('2025-11-21'),
      },
    ],
  });

  console.log(`✓ Created ${3} proposals\n`);

  // 10. Create Events
  console.log('📅 Creating events...');
  await prisma.events.createMany({
    data: [
      {
        title: 'Production Day 1 - TechCorp Launch',
        description: 'First day of principal photography',
        type: 'Shoot',
        start_time: new Date('2025-11-25T08:00:00'),
        end_time: new Date('2025-11-25T18:00:00'),
        location: 'Downtown Studios, Studio A',
        project_id: project1.id,
        attendees: [],
        color: '#FF5733',
        status: 'Scheduled',
      },
      {
        title: 'Client Review Meeting - TechCorp',
        description: 'Review rough cut with client',
        type: 'Meeting',
        start_time: new Date('2025-12-02T14:00:00'),
        end_time: new Date('2025-12-02T15:30:00'),
        location: 'Virtual - Zoom',
        project_id: project1.id,
        attendees: [],
        color: '#3498DB',
        status: 'Scheduled',
      },
      {
        title: 'Pre-production Meeting - Fashion Forward',
        description: 'Discuss creative direction and mood boards',
        type: 'Meeting',
        start_time: new Date('2025-12-05T10:00:00'),
        end_time: new Date('2025-12-05T12:00:00'),
        location: 'MediaFlow Office',
        project_id: project2.id,
        attendees: [],
        color: '#E74C3C',
        status: 'Scheduled',
      },
      {
        title: 'Equipment Pickup',
        description: 'Pick up camera package from rental house',
        type: 'Task',
        start_time: new Date('2025-11-24T09:00:00'),
        end_time: new Date('2025-11-24T10:00:00'),
        location: 'Equipment Rentals Pro',
        project_id: project1.id,
        attendees: [],
        color: '#9B59B6',
        status: 'Scheduled',
      },
      {
        title: 'Team Lunch',
        description: 'Monthly team bonding lunch',
        type: 'Meeting',
        start_time: new Date('2025-11-29T12:00:00'),
        end_time: new Date('2025-11-29T13:30:00'),
        location: 'Restaurant District',
        attendees: [],
        color: '#2ECC71',
        status: 'Scheduled',
      },
    ],
  });

  console.log(`✓ Created ${5} events\n`);

  // 11. Create Assets
  console.log('🎬 Creating assets...');
  await prisma.assets.createMany({
    data: [
      {
        name: 'RED Komodo 6K Camera',
        description: 'Primary cinema camera for high-end productions',
        type: 'Camera',
        category: 'Production Equipment',
        status: 'Available',
        location: 'Equipment Room A',
        purchase_date: new Date('2024-03-15'),
        purchase_price: 8000,
        current_value: 7000,
        serial_number: 'RED-KMD-12345',
        manufacturer: 'RED Digital Cinema',
        model: 'Komodo 6K',
        condition: 'Excellent',
        notes: 'Includes cage, batteries, and media',
      },
      {
        name: 'DJI Ronin 2 Gimbal',
        description: 'Professional 3-axis camera stabilizer',
        type: 'Stabilization',
        category: 'Production Equipment',
        status: 'Available',
        location: 'Equipment Room A',
        purchase_date: new Date('2024-05-20'),
        purchase_price: 4500,
        current_value: 3800,
        serial_number: 'DJI-RN2-67890',
        manufacturer: 'DJI',
        model: 'Ronin 2',
        condition: 'Good',
        maintenance_schedule: { interval: '3 months', last_service: '2025-09-01' },
        last_maintenance: new Date('2025-09-01'),
        next_maintenance: new Date('2025-12-01'),
      },
      {
        name: 'ARRI SkyPanel S60-C LED Light',
        description: 'High-output LED panel light',
        type: 'Lighting',
        category: 'Production Equipment',
        status: 'In Use',
        location: 'On Set - Project #1',
        assigned_project: project1.id,
        purchase_date: new Date('2023-11-10'),
        purchase_price: 2200,
        current_value: 1800,
        serial_number: 'ARRI-SKY-11223',
        manufacturer: 'ARRI',
        model: 'SkyPanel S60-C',
        condition: 'Good',
      },
      {
        name: 'MacBook Pro M3 Max - Editing Station 1',
        description: 'Primary video editing workstation',
        type: 'Computer',
        category: 'Post-Production',
        status: 'In Use',
        location: 'Edit Bay 1',
        purchase_date: new Date('2024-12-01'),
        purchase_price: 4000,
        current_value: 3500,
        serial_number: 'APPL-MBP-99887',
        manufacturer: 'Apple',
        model: 'MacBook Pro 16" M3 Max',
        condition: 'Excellent',
        notes: 'Adobe Creative Cloud & DaVinci Resolve installed',
      },
      {
        name: 'Sennheiser MKH 416 Shotgun Mic',
        description: 'Industry-standard shotgun microphone',
        type: 'Audio',
        category: 'Production Equipment',
        status: 'Available',
        location: 'Equipment Room B',
        purchase_date: new Date('2023-08-15'),
        purchase_price: 1000,
        current_value: 850,
        serial_number: 'SENN-416-55443',
        manufacturer: 'Sennheiser',
        model: 'MKH 416',
        condition: 'Excellent',
      },
    ],
  });

  console.log(`✓ Created ${5} assets\n`);

  // 12. Create Financial Transactions
  console.log('💳 Creating financial transactions...');
  await prisma.financial_transactions.createMany({
    data: [
      {
        project_id: project1.id,
        type: 'Income',
        income_id: (await prisma.income.findFirst({ where: { invoice_number: 'INV-2025-001' } }))?.id,
        amount: 25000,
        description: 'TechCorp deposit payment received',
        transaction_date: new Date('2025-11-01'),
        status: 'Reconciled',
        reference_number: 'TXN-2025-001',
      },
      {
        project_id: project1.id,
        type: 'Expense',
        expense_id: (await prisma.expenses.findFirst({ where: { title: 'Camera Equipment Rental' } }))?.id,
        amount: -4500,
        description: 'Camera rental payment',
        transaction_date: new Date('2025-11-15'),
        status: 'Reconciled',
        reference_number: 'TXN-2025-002',
      },
      {
        project_id: project2.id,
        type: 'Income',
        income_id: (await prisma.income.findFirst({ where: { invoice_number: 'INV-2025-003' } }))?.id,
        amount: 10000,
        description: 'Fashion Forward deposit received',
        transaction_date: new Date('2025-12-01'),
        status: 'Reconciled',
        reference_number: 'TXN-2025-003',
      },
    ],
  });

  console.log(`✓ Created ${3} financial transactions\n`);

  console.log('✅ Database seeding completed successfully!\n');

  // Print summary
  const counts = {
    teamMembers: await prisma.team_members.count(),
    teams: await prisma.teams.count(),
    contacts: await prisma.contacts.count(),
    projects: await prisma.projects.count(),
    tasks: await prisma.tasks.count(),
    expenses: await prisma.expenses.count(),
    income: await prisma.income.count(),
    proposals: await prisma.proposals.count(),
    events: await prisma.events.count(),
    assets: await prisma.assets.count(),
    transactions: await prisma.financial_transactions.count(),
  };

  console.log('📊 Database Summary:');
  console.log('═══════════════════════════════════════');
  console.log(`   Team Members:          ${counts.teamMembers}`);
  console.log(`   Teams:                 ${counts.teams}`);
  console.log(`   Contacts:              ${counts.contacts}`);
  console.log(`   Projects:              ${counts.projects}`);
  console.log(`   Tasks:                 ${counts.tasks}`);
  console.log(`   Expenses:              ${counts.expenses}`);
  console.log(`   Income Records:        ${counts.income}`);
  console.log(`   Proposals:             ${counts.proposals}`);
  console.log(`   Events:                ${counts.events}`);
  console.log(`   Assets:                ${counts.assets}`);
  console.log(`   Transactions:          ${counts.transactions}`);
  console.log('═══════════════════════════════════════\n');

  console.log('🔐 Test Login Credentials:');
  console.log('═══════════════════════════════════════');
  console.log('   Email:    admin@mediaflow.com');
  console.log('   Password: Password123');
  console.log('   Role:     Admin\n');
  console.log('   Other test users:');
  console.log('   - sarah.producer@mediaflow.com');
  console.log('   - mike.director@mediaflow.com');
  console.log('   - emily.editor@mediaflow.com');
  console.log('   - alex.coordinator@mediaflow.com');
  console.log('   (All with password: Password123)');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
