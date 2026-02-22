import pdfplumber
import sys

def main():
    pdf_path = "input/U15/U15N.pdf"
    print(f"Opening {pdf_path}...")
    with pdfplumber.open(pdf_path) as pdf:
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        print("--- PAGE 1 TEXT ---")
        print(text)
        
        tables = first_page.extract_tables()
        print(f"--- PAGE 1 TABLES ({len(tables)}) ---")
        for i, table in enumerate(tables):
            print(f"Table {i}:")
            for row in table[:10]:
                print(row)

if __name__ == '__main__':
    main()
