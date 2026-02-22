import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

def main():
    load_dotenv('.env.local')
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    supabase = create_client(url, key)

    f_path = 'input/U15/U15F_detailed_points.xlsx'
    n_path = 'input/U15/U15N_detailed_points.xlsx'
    
    df_f = pd.read_excel(f_path)
    df_n = pd.read_excel(n_path)
    df_combined = pd.concat([df_f, df_n], ignore_index=True)
    
    players = []
    page = 0
    size = 1000
    while True:
        res = supabase.table('players').select('license_id').range(page*size, (page+1)*size - 1).execute()
        players.extend(res.data)
        if len(res.data) < size:
            break
        page += 1
        
    db_licenses = {str(p['license_id']).strip() for p in players if p.get('license_id')}
    
    missing_players = set()
    for _, row in df_combined.iterrows():
        player_licence = str(row['Licence ID']).strip()
        if not player_licence or player_licence == 'nan':
            continue
        if player_licence not in db_licenses:
            missing_players.add(f"{row['Name']} ({player_licence})")
            
    output_path = 'input/missing_u15_players.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("Missing Players in Supabase DB (U15):\n")
        f.write("-" * 40 + "\n")
        for p in sorted(missing_players):
            f.write(p + '\n')
            
    print(f"Successfully wrote {len(missing_players)} missing players to {output_path}")

if __name__ == '__main__':
    main()
