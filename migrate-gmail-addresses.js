const { sequelize } = require('./src/config/database');
const { QueryTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function migrateGmailAddresses() {
  try {
    console.log('Starting Gmail addresses migration...\n');
    
    // Array to store all Gmail addresses
    const gmailAddresses = [];
    const gmailUsers = [];
    
    // 1. Get Gmail addresses from Users table
    console.log('1. Extracting Gmail addresses from Users table...');
    const usersQuery = `
      SELECT id, firstName, lastName, email, phoneNumber, createdAt, updatedAt
      FROM Users 
      WHERE email LIKE '%@gmail.com'
      ORDER BY createdAt DESC
    `;
    
    const users = await sequelize.query(usersQuery, { type: QueryTypes.SELECT });
    console.log(`Found ${users.length} Gmail users in Users table`);
    
    users.forEach(user => {
      gmailAddresses.push(user.email);
      gmailUsers.push({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        source: 'Users'
      });
    });
    
    // 2. Get Gmail addresses from Companies table (if they have contact emails)
    console.log('\n2. Extracting Gmail addresses from Companies table...');
    const companiesQuery = `
      SELECT id, name, email, phone, createdAt, updatedAt
      FROM Companies 
      WHERE email LIKE '%@gmail.com'
      ORDER BY createdAt DESC
    `;
    
    const companies = await sequelize.query(companiesQuery, { type: QueryTypes.SELECT });
    console.log(`Found ${companies.length} Gmail companies in Companies table`);
    
    companies.forEach(company => {
      if (!gmailAddresses.includes(company.email)) {
        gmailAddresses.push(company.email);
        gmailUsers.push({
          id: company.id,
          firstName: company.name,
          lastName: '',
          email: company.email,
          phoneNumber: company.phone,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
          source: 'Companies'
        });
      }
    });
    
    // 3. Check if there are any other tables with email fields
    console.log('\n3. Checking for other tables with email fields...');
    
    // Check ContactInfos table if it exists
    try {
      const contactInfosQuery = `
        SELECT id, name, email, phone, createdAt, updatedAt
        FROM ContactInfos 
        WHERE email LIKE '%@gmail.com'
        ORDER BY createdAt DESC
      `;
      
      const contactInfos = await sequelize.query(contactInfosQuery, { type: QueryTypes.SELECT });
      console.log(`Found ${contactInfos.length} Gmail contacts in ContactInfos table`);
      
      contactInfos.forEach(contact => {
        if (!gmailAddresses.includes(contact.email)) {
          gmailAddresses.push(contact.email);
          gmailUsers.push({
            id: contact.id,
            firstName: contact.name,
            lastName: '',
            email: contact.email,
            phoneNumber: contact.phone,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
            source: 'ContactInfos'
          });
        }
      });
    } catch (error) {
      console.log('ContactInfos table not found or accessible');
    }
    
    // Check Contacts table if it exists
    try {
      const contactsQuery = `
        SELECT id, name, email, subject, message, status, createdAt, updatedAt
        FROM Contacts 
        WHERE email LIKE '%@gmail.com'
        ORDER BY createdAt DESC
      `;
      
      const contacts = await sequelize.query(contactsQuery, { type: QueryTypes.SELECT });
      console.log(`Found ${contacts.length} Gmail contacts in Contacts table`);
      
      contacts.forEach(contact => {
        if (!gmailAddresses.includes(contact.email)) {
          gmailAddresses.push(contact.email);
          gmailUsers.push({
            id: contact.id,
            firstName: contact.name,
            lastName: '',
            email: contact.email,
            phoneNumber: '',
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
            source: 'Contacts',
            subject: contact.subject,
            message: contact.message,
            status: contact.status
          });
        }
      });
    } catch (error) {
      console.log('Contacts table not found or accessible:', error.message);
    }
    
    // 4. Create backup directory
    const backupDir = path.join(__dirname, 'gmail-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // 5. Save Gmail addresses to different formats
    console.log('\n4. Saving Gmail addresses to files...');
    
    // Save as simple text file
    const textFile = path.join(backupDir, 'gmail-addresses.txt');
    fs.writeFileSync(textFile, gmailAddresses.join('\n'));
    console.log(`✅ Saved ${gmailAddresses.length} Gmail addresses to: ${textFile}`);
    
    // Save as JSON file with full user details
    const jsonFile = path.join(backupDir, 'gmail-users.json');
    fs.writeFileSync(jsonFile, JSON.stringify(gmailUsers, null, 2));
    console.log(`✅ Saved detailed Gmail user data to: ${jsonFile}`);
    
    // Save as CSV file
    const csvFile = path.join(backupDir, 'gmail-users.csv');
    const csvHeader = 'ID,First Name,Last Name,Email,Phone,Source,Created At,Updated At\n';
    const csvData = gmailUsers.map(user => 
      `${user.id},"${user.firstName}","${user.lastName}","${user.email}","${user.phoneNumber}","${user.source}","${user.createdAt}","${user.updatedAt}"`
    ).join('\n');
    fs.writeFileSync(csvFile, csvHeader + csvData);
    console.log(`✅ Saved Gmail user data as CSV to: ${csvFile}`);
    
    // 6. Create a summary report
    const summaryFile = path.join(backupDir, 'migration-summary.txt');
    const summary = `
Gmail Addresses Migration Summary
================================
Date: ${new Date().toISOString()}
Total Gmail Addresses Found: ${gmailAddresses.length}

Breakdown by Source:
- Users Table: ${gmailUsers.filter(u => u.source === 'Users').length}
- Companies Table: ${gmailUsers.filter(u => u.source === 'Companies').length}
- ContactInfos Table: ${gmailUsers.filter(u => u.source === 'ContactInfos').length}
- Contacts Table: ${gmailUsers.filter(u => u.source === 'Contacts').length}

Files Created:
- gmail-addresses.txt: Simple list of Gmail addresses
- gmail-users.json: Detailed user information in JSON format
- gmail-users.csv: Detailed user information in CSV format
- migration-summary.txt: This summary file

Sample Gmail Addresses:
${gmailAddresses.slice(0, 10).join('\n')}
${gmailAddresses.length > 10 ? `... and ${gmailAddresses.length - 10} more` : ''}
`;
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`✅ Created migration summary: ${summaryFile}`);
    
    // 7. Display results
    console.log('\n🎉 Gmail Migration Completed Successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- Total Gmail addresses: ${gmailAddresses.length}`);
    console.log(`- Users: ${gmailUsers.filter(u => u.source === 'Users').length}`);
    console.log(`- Companies: ${gmailUsers.filter(u => u.source === 'Companies').length}`);
    console.log(`- ContactInfos: ${gmailUsers.filter(u => u.source === 'ContactInfos').length}`);
    console.log(`- Contacts: ${gmailUsers.filter(u => u.source === 'Contacts').length}`);
    console.log(`\n📁 Files saved to: ${backupDir}`);
    
    // 8. Show sample data
    if (gmailUsers.length > 0) {
      console.log('\n📋 Sample Gmail Users:');
      gmailUsers.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.source}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await sequelize.close();
  }
}

migrateGmailAddresses();
