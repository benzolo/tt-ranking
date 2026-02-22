import pandas as pd
import os

categories = ['FelnőttN']

for cat in categories:
    csv_path = f"input/U15/{cat}.csv"
    xlsx_path = f"input/U15/{cat}_detailed_points.xlsx"
    
    if not os.path.exists(csv_path) or not os.path.exists(xlsx_path):
        print(f"[{cat}] Missing CSV or XLSX file.")
        continue
        
    try:
        df_csv = pd.read_csv(csv_path, sep=';')
        csv_players = set(df_csv['Engedélyszám'].astype(str).str.strip())
        # Filter out empty strings if any
        csv_players = {p for p in csv_players if p and p != 'nan'}
        
        df_xlsx = pd.read_excel(xlsx_path)
        xlsx_players = set(df_xlsx['Licence ID'].astype(str).str.strip())
        
        missing_in_xlsx = csv_players - xlsx_players
        
        print(f"[{cat}] CSV players: {len(csv_players)} | Extracted in XLSX: {len(xlsx_players)}")
        if missing_in_xlsx:
            print(f"    Missing {len(missing_in_xlsx)} players in XLSX: {missing_in_xlsx}")
            
            # Print names for missing players for easier debugging
            missing_names = df_csv[df_csv['Engedélyszám'].astype(str).str.strip().isin(missing_in_xlsx)]['Név'].tolist()
            print(f"    Names: {missing_names}")
    except Exception as e:
        print(f"[{cat}] Error during verification: {e}")
