const { Client } = require('pg');

async function fixChannels() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/revnet'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Update all channels to be active
    const result = await client.query('UPDATE channels SET "isActive" = true WHERE "isActive" = false');
    console.log(`Updated ${result.rowCount} channels to be active`);
    
    // Verify the update
    const channels = await client.query('SELECT id, name, "isActive" FROM channels');
    console.log('Channels after update:');
    channels.rows.forEach(channel => {
      console.log(`- ${channel.name} (${channel.id}): active=${channel.isActive}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixChannels();
