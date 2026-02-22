import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

def main():
    load_dotenv('.env.local')
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    supabase = create_client(url, key)

    # 1. Load data
    f_path = 'input/U15/U15F_detailed_points.xlsx'
    n_path = 'input/U15/U15N_detailed_points.xlsx'
    
    df_f = pd.read_excel(f_path)
    df_n = pd.read_excel(n_path)
    
    print(f"Loaded {len(df_f)} U15F rows and {len(df_n)} U15N rows.")
    
    # Filter out dummy 'No tournaments' entries
    df_f = df_f[df_f['Competition Name'] != 'No tournaments']
    df_n = df_n[df_n['Competition Name'] != 'No tournaments']
    
    # Combine datasets
    df_combined = pd.concat([df_f, df_n], ignore_index=True)
    print(f"Total results to import after filtering: {len(df_combined)}")

    # 2. Get Players Mapping
    # Paginate through players if > 1000
    players = []
    page = 0
    size = 1000
    while True:
        res = supabase.table('players').select('id, license_id').range(page*size, (page+1)*size - 1).execute()
        players.extend(res.data)
        if len(res.data) < size:
            break
        page += 1
        
    # Create dict: license_id to id
    license_to_player_id = {str(p['license_id']).strip(): p['id'] for p in players if p.get('license_id')}
    print(f"Loaded {len(license_to_player_id)} players from Supabase.")
    
    # 3. Handle Events
    events_res = supabase.table('events').select('id, name, date').execute()
    existing_events = {(e['name'].strip(), e['date']): e['id'] for e in events_res.data}
    
    # Extract unique events from our dataframe
    unique_events_df = df_combined[['Competition Name', 'Date']].drop_duplicates().dropna()
    
    events_to_insert = []
    for _, row in unique_events_df.iterrows():
        comp_name = row['Competition Name'].strip()
        comp_date = row['Date']
        
        if (comp_name, comp_date) not in existing_events:
            # Calculate validity date (add 1 year)
            try:
                year = int(comp_date[:4])
                validity_date = f"{year+1}{comp_date[4:]}"
            except:
                validity_date = comp_date # fallback
                
            events_to_insert.append({
                'name': comp_name,
                'date': comp_date,
                'validity_date': validity_date,
                'age_category': 'U15',
                'type': 'Ranglista',
                'has_egyes': True,
                'has_csapat': False,
                'has_paros': False,
                'has_vegyes': False,
                'gender': 'Both'
            })
            # Add a placeholder so we don't insert duplicate events if same event is encountered again
            existing_events[(comp_name, comp_date)] = "pending"
            
    if events_to_insert:
        print(f"Inserting {len(events_to_insert)} new events...")
        try:
            # Insert events and get their IDs
            insert_res = supabase.table('events').insert(events_to_insert).execute()
            for e in insert_res.data:
                existing_events[(e['name'].strip(), e['date'])] = e['id']
            print("Successfully inserted events.")
        except Exception as e:
            print(f"Error inserting events: {e}")
            # Try to fetch events again to see if they were inserted anyway
            events_res = supabase.table('events').select('id, name, date').execute()
            existing_events = {(e['name'].strip(), e['date']): e['id'] for e in events_res.data}
            
    # 4. Insert Results
    results_to_insert = []
    missing_players = set()
    
    for _, row in df_combined.iterrows():
        comp_name = row['Competition Name'].strip()
        comp_date = row['Date']
        player_licence = str(row['Licence ID']).strip()
        points = row['Points']
        
        # Skip if missing basic data
        if pd.isna(comp_date) or not player_licence:
            continue
            
        event_id = existing_events.get((comp_name, comp_date))
        if not event_id or event_id == "pending":
            print(f"Skipping result: Event not found for {comp_name}")
            continue
            
        player_id = license_to_player_id.get(player_licence)
        if not player_id:
            missing_players.add(f"{row['Name']} ({player_licence})")
            continue
            
        results_to_insert.append({
            'event_id': event_id,
            'player_id': player_id,
            'category': 'Egyes',
            'points': int(points),
            'position': '-'
        })

    if missing_players:
        print(f"Warning: {len(missing_players)} players in excel not found in DB by licence ID.")
        print(f"Example missing: {list(missing_players)[:5]}")
        
    print(f"Preparing to insert {len(results_to_insert)} results...")
    
    if results_to_insert:
        # Batch insert results (Supabase handles up to thousands usually, but let's batch by 500)
        batch_size = 500
        for i in range(0, len(results_to_insert), batch_size):
            batch = results_to_insert[i:i+batch_size]
            try:
                supabase.table('results').insert(batch).execute()
                print(f"Inserted batch {i//batch_size + 1}/{(len(results_to_insert)-1)//batch_size + 1}")
            except Exception as e:
                print(f"Error inserting results batch {i//batch_size + 1}: {e}")
        print("Done importing results!")

if __name__ == '__main__':
    main()
