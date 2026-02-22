import pdfplumber
import pandas as pd
import re
import os

def process_category(cat):
    pdf_path = f"input/U15/{cat}.pdf"
    csv_path = f"input/U15/{cat}.csv"
    output_xlsx = f"input/U15/{cat}_detailed_points.xlsx"
    
    try:
        df_base = pd.read_csv(csv_path, sep=';')
        licence_to_name = dict(zip(df_base['Engedélyszám'].astype(str), df_base['Név']))
    except Exception as e:
        print(f"[{cat}] Error reading CSV: {e}")
        return
    
    parsed_data = [] 
    
    print(f"[{cat}] Processing PDF...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            current_player = None
            current_player_has_tournaments = False
            
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if not row:
                            continue
                            
                        # Filter out None and empty strings
                        clean_row = [str(c).strip() for c in row if c is not None and str(c).strip() != '']
                        if not clean_row:
                            continue
                        
                        tournament_detected = False
                        for cell in clean_row:
                            if '--' in cell and 'pont' in cell:
                                tournament_detected = True
                                if current_player:
                                    lines = cell.split('\n')
                                    for line in lines:
                                        line = line.strip()
                                        parts = line.split(' -- ', 1)
                                        if len(parts) == 2:
                                            date_str = parts[0].strip()
                                            rest = parts[1].strip()
                                            match = re.search(r'^(.*?)\s+(\d+)\s+pont$', rest)
                                            if match:
                                                comp_name = match.group(1).strip().replace("\\", "fi")
                                                points = int(match.group(2))
                                                parsed_data.append({
                                                    'Rank': current_player['Rank'],
                                                    'Licence ID': current_player['Licence ID'],
                                                    'Name': current_player['Name'],
                                                    'Date': date_str,
                                                    'Competition Name': comp_name,
                                                    'Points': points
                                                })
                                                current_player_has_tournaments = True
                                        
                        if not tournament_detected and clean_row[0].isdigit():
                            rank = int(clean_row[0])
                            licence_id = ""
                            for cell in clean_row[1:]:
                                if cell.isdigit() and cell in licence_to_name:
                                    licence_id = cell
                                    break
                                    
                            if licence_id:
                                # Process the PREVIOUS player if they had no tournaments
                                if current_player and not current_player_has_tournaments:
                                    parsed_data.append({
                                        'Rank': current_player['Rank'],
                                        'Licence ID': current_player['Licence ID'],
                                        'Name': current_player['Name'],
                                        'Date': None,
                                        'Competition Name': 'No tournaments',
                                        'Points': 0
                                    })
                                
                                name = licence_to_name.get(licence_id, clean_row[-2] if len(clean_row)>=2 else "")
                                current_player = {
                                    'Rank': rank,
                                    'Licence ID': licence_id,
                                    'Name': name
                                }
                                current_player_has_tournaments = False

            # Add the LAST player if they had no tournaments
            if current_player and not current_player_has_tournaments:
                parsed_data.append({
                    'Rank': current_player['Rank'],
                    'Licence ID': current_player['Licence ID'],
                    'Name': current_player['Name'],
                    'Date': None,
                    'Competition Name': 'No tournaments',
                    'Points': 0
                })

    except Exception as e:
        print(f"[{cat}] Error reading PDF: {e}")
        return

    df_detailed = pd.DataFrame(parsed_data)
    df_detailed.to_excel(output_xlsx, index=False)
    print(f"[{cat}] Successfully extracted {len(df_detailed)} detailed records to {output_xlsx}\n")

def main():
    categories = ['FelnőttN']
    for cat in categories:
        process_category(cat)

if __name__ == '__main__':
    main()
