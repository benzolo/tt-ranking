import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

def main():
    load_dotenv('.env.local')
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    supabase = create_client(url, key)

    # Pre-load players
    players = []
    page = 0
    size = 1000
    while True:
        res = supabase.table('players').select('id, license_id').range(page*size, (page+1)*size - 1).execute()
        players.extend(res.data)
        if len(res.data) < size:
            break
        page += 1
        
    license_to_player_id = {str(p['license_id']).strip(): p['id'] for p in players if p.get('license_id')}
    print(f"Loaded {len(license_to_player_id)} players from Supabase.")
    
    # Pre-load events
    events_res = supabase.table('events').select('id, name, date').execute()
    existing_events = {(e['name'].strip(), e['date']): e['id'] for e in events_res.data}
    
    categories = ["U11", "U13", "U19"]
    all_missing_players = {}

    for cat in categories:
        print(f"\n--- Importing {cat} ---")
        f_path = f'input/U15/{cat}F_detailed_points.xlsx'
        n_path = f'input/U15/{cat}N_detailed_points.xlsx'
        
        if not os.path.exists(f_path) or not os.path.exists(n_path):
            print(f"Skipping {cat}: files not found.")
            continue
            
        df_f = pd.read_excel(f_path)
        df_n = pd.read_excel(n_path)
        
        df_f = df_f[df_f['Competition Name'] != 'No tournaments']
        df_n = df_n[df_n['Competition Name'] != 'No tournaments']
        
        df_combined = pd.concat([df_f, df_n], ignore_index=True)
        print(f"[{cat}] Total results to import: {len(df_combined)}")
        
        # 1. New Events
        unique_events_df = df_combined[['Competition Name', 'Date']].drop_duplicates().dropna()
        events_to_insert = []
        for _, row in unique_events_df.iterrows():
            comp_name = row['Competition Name'].strip()
            comp_date = row['Date']
            
            if (comp_name, comp_date) not in existing_events:
                try:
                    year = int(comp_date[:4])
                    validity_date = f"{year+1}{comp_date[4:]}"
                except:
                    validity_date = comp_date
                    
                events_to_insert.append({
                    'name': comp_name,
                    'date': comp_date,
                    'validity_date': validity_date,
                    'age_category': cat,
                    'type': 'Ranglista',
                    'has_egyes': True,
                    'has_csapat': False,
                    'has_paros': False,
                    'has_vegyes': False,
                    'gender': 'Both'
                })
                existing_events[(comp_name, comp_date)] = "pending"
                
        if events_to_insert:
            print(f"[{cat}] Inserting {len(events_to_insert)} new events...")
            try:
                insert_res = supabase.table('events').insert(events_to_insert).execute()
                for e in insert_res.data:
                    existing_events[(e['name'].strip(), e['date'])] = e['id']
                print(f"[{cat}] Successfully inserted events.")
            except Exception as e:
                print(f"[{cat}] Error inserting events: {e}")
                # Fetch fresh existing events
                fresh_events = supabase.table('events').select('id, name, date').execute()
                existing_events = {(e['name'].strip(), e['date']): e['id'] for e in fresh_events.data}

        # 2. Insert Results
        results_to_insert = []
        missing_cat_players = set()
        
        for _, row in df_combined.iterrows():
            comp_name = row['Competition Name'].strip()
            comp_date = row['Date']
            player_licence = str(row['Licence ID']).strip()
            points = row['Points']
            
            if pd.isna(comp_date) or not player_licence or player_licence == 'nan':
                continue
                
            event_id = existing_events.get((comp_name, comp_date))
            if not event_id or event_id == "pending":
                continue
                
            player_id = license_to_player_id.get(player_licence)
            if not player_id:
                missing_cat_players.add(f"{row['Name']} ({player_licence})")
                continue
                
            results_to_insert.append({
                'event_id': event_id,
                'player_id': player_id,
                'category': 'Egyes',
                'points': int(points),
                'position': '-'
            })

        all_missing_players[cat] = missing_cat_players
        print(f"[{cat}] Preparing to insert {len(results_to_insert)} results...")
        
        if results_to_insert:
            batch_size = 500
            for i in range(0, len(results_to_insert), batch_size):
                batch = results_to_insert[i:i+batch_size]
                try:
                    supabase.table('results').insert(batch).execute()
                except Exception as e:
                    print(f"[{cat}] Error inserting results batch {i//batch_size + 1}: {e}")
            print(f"[{cat}] Done importing results!")
            
    # Write all missing players to file
    out_file = 'input/missing_players.txt'
    with open(out_file, 'a', encoding='utf-8') as f:
        for cat in categories:
            missing = sorted(all_missing_players[cat])
            if missing:
                f.write(f"\nMissing Players in Supabase DB ({cat}):\n")
                f.write("-" * 40 + "\n")
                for p in missing:
                    f.write(p + '\n')
            print(f"[{cat}] Wrote {len(missing)} missing players to {out_file}")

if __name__ == '__main__':
    main()
