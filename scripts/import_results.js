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

async function importResults() {
    const csvPath = path.join(__dirname, '../input/csv_import1.csv');
    
    try {
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split('\n');
        
        // Skip header
        const dataLines = lines.slice(1);
        
        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        let mappingErrorCount = 0;

        for (const line of dataLines) {
            if (!line.trim()) continue;
            
            const columns = line.split(';');
            if (columns.length < 4) {
                console.warn(`Skipping invalid line: ${line}`);
                errorCount++;
                continue;
            }

            const event_id = columns[0].trim();
            const license_id = columns[1].trim();
            const category = columns[2].trim();
            let position = columns[3].trim();

            // Handle special parsing cases for position (cs3/cs4)
            if (position.toLowerCase() === 'cs3') {
                position = 'CS3';
            } else if (position.toLowerCase() === 'cs4') {
                position = 'CS4';
            }

            // Map license_id to player_id
            const { data: player, error: fetchError } = await supabase
                .from('players')
                .select('id, name')
                .eq('license_id', license_id)
                .single();

            if (fetchError || !player) {
                console.error(`Error finding player with license_id ${license_id}: ${fetchError?.message || 'Player not found'}`);
                mappingErrorCount++;
                continue;
            }

            const player_id = player.id;

            // Check if result already exists for this event and player in this category
            const { data: existingResult, error: existingResultError } = await supabase
                .from('results')
                .select('id')
                .eq('event_id', event_id)
                .eq('player_id', player_id)
                .eq('category', category)
                .single();

            if (existingResultError && existingResultError.code !== 'PGRST116') {
                 console.error(`Error checking existing result for ${player.name} (${license_id}) in ${category}:`, existingResultError.message);
                 errorCount++;
                 continue;
            }

            if (existingResult) {
                console.log(`Skipping existing result: ${player.name} (${license_id}) in ${category}`);
                skippedCount++;
                continue;
            }

            // Insert new result
            const { error: insertError } = await supabase
                .from('results')
                .insert({
                    event_id,
                    player_id,
                    category,
                    position
                });

            if (insertError) {
                console.error(`Error inserting result for ${player.name} (${license_id}):`, insertError.message);
                errorCount++;
            } else {
                console.log(`Inserted result for: ${player.name} (${license_id}) - Category: ${category}, Position: ${position}`);
                insertedCount++;
            }
        }

        console.log('\nImport Summary:');
        console.log(`Inserted: ${insertedCount}`);
        console.log(`Skipped (Already Exists): ${skippedCount}`);
        console.log(`Mapping Errors (Player Not Found): ${mappingErrorCount}`);
        console.log(`Other Errors: ${errorCount}`);

    } catch (err) {
        console.error('Failed to read or process CSV:', err);
    }
}

importResults();
