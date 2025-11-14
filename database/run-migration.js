#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs the AI analysis columns migration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Read the migration SQL file
    const migrationFile = path.join(__dirname, 'add_ai_analysis_columns.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationFile);
    
    // Split SQL into individual statements and filter out comments/empty lines
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 80)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // Try direct query as fallback
        console.log('   Trying alternative execution method...');
        const result = await supabase.from('_sql').select('*').limit(0);
        
        // If that doesn't work either, show instructions
        console.error('❌ Error executing statement:', error.message);
        console.log('\n⚠️  Direct SQL execution via API may not be available.');
        console.log('📋 Please run the migration manually:');
        console.log('   1. Go to your Supabase project dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste the contents of:');
        console.log(`      ${migrationFile}`);
        console.log('   4. Click "Run" to execute the migration\n');
        process.exit(1);
      }
      
      console.log('   ✅ Statement executed successfully');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Added columns to job_applications table:');
    console.log('   - ai_analysis_score (INTEGER)');
    console.log('   - ai_analysis_data (JSONB)');
    console.log('   - ai_analyzed_at (TIMESTAMP)');
    console.log('   - Indexes for performance');
    console.log('\n🎉 Your AI analysis system is now ready to use!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 Manual migration instructions:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of:');
    console.log(`      ${path.join(__dirname, 'add_ai_analysis_columns.sql')}`);
    console.log('   4. Click "Run" to execute the migration\n');
    process.exit(1);
  }
}

// Check if required environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Required environment variables not found');
  console.error('   Make sure backend/.env contains:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

runMigration();
