const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ensure you have these environment variables set when running the script
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importPlayers() {
    const csvPath = path.join(__dirname, '../male.csv');
    
    try {
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split('\n');
        
        // Skip header
        const dataLines = lines.slice(1);
        
        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const line of dataLines) {
            if (!line.trim()) continue;
            
            const columns = line.split(';');
            if (columns.length < 3) {
                console.warn(`Skipping invalid line: ${line}`);
                errorCount++;
                continue;
            }

            const license_id = columns[0].trim();
            const name = columns[1].trim();
            const club = columns[2].trim();
            const gender = 'Male';

            // Check if player exists
            const { data: existingPlayer, error: fetchError } = await supabase
                .from('players')
                .select('id')
                .eq('license_id', license_id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is no rows returned
                console.error(`Error checking player ${name} (${license_id}):`, fetchError.message);
                errorCount++;
                continue;
            }

            if (existingPlayer) {
                console.log(`Skipping existing player: ${name} (${license_id})`);
                skippedCount++;
                continue;
            }

            // Insert new player
            const { error: insertError } = await supabase
                .from('players')
                .insert({
                    name,
                    license_id,
                    club,
                    gender,
                    // birth_date is nullable, so we skip it
                });

            if (insertError) {
                console.error(`Error inserting player ${name} (${license_id}):`, insertError.message);
                errorCount++;
            } else {
                console.log(`Inserted: ${name} (${license_id})`);
                insertedCount++;
            }
        }

        console.log('\nImport Summary:');
        console.log(`Inserted: ${insertedCount}`);
        console.log(`Skipped (Already Exists): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (err) {
        console.error('Failed to read or process CSV:', err);
    }
}

importPlayers();
