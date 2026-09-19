import requests
from bs4 import BeautifulSoup
from datetime import datetime
from database import get_db_connection

def scrape_rubber_prices():
    """
    ฟังก์ชันจำลองการดึงราคายางจากเว็บไซต์จริง
    (เนื่องจากเว็บไซต์ กยท. / Thainr อาจมีโครงสร้างที่ซับซ้อนและเปลี่ยนบ่อย 
    นี่คือโครงสร้างพื้นฐานในการดึงและบันทึกลง SQLite)
    """
    print("Scraping rubber prices...")
    # ตัวอย่าง: ดึงจาก API จำลอง หรือเว็บไซต์
    # response = requests.get('https://example-rubber-price.com')
    # soup = BeautifulSoup(response.text, 'html.parser')
    
    today = datetime.now().strftime('%Y-%m-%d')
    mock_scraped_data = [
        {"region": "south", "grade": "sheet", "price": 85.80, "source": "RAOT"},
        {"region": "south", "grade": "latex", "price": 78.30, "source": "RAOT"},
        {"region": "south", "grade": "cup", "price": 68.50, "source": "RAOT"},
        {"region": "south", "grade": "rss3", "price": 91.50, "source": "RAOT"},
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    for item in mock_scraped_data:
        try:
            cursor.execute('''
                INSERT INTO rubber_prices (date, region, grade, price, source)
                VALUES (?, ?, ?, ?, ?)
            ''', (today, item['region'], item['grade'], item['price'], item['source']))
        except sqlite3.IntegrityError:
            # ข้อมูลซ้ำ (มีในฐานข้อมูลแล้วของวันนี้)
            pass

    conn.commit()
    conn.close()
    return {"status": "success", "fetched": len(mock_scraped_data)}

def scrape_external_factors():
    print("Scraping external factors...")
    today = datetime.now().strftime('%Y-%m-%d')
    mock_factors = [
        {"factor_name": "brent_oil", "value": 78.90},
        {"factor_name": "usd_thb", "value": 33.39}
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    for item in mock_factors:
        try:
            cursor.execute('''
                INSERT INTO external_factors (date, factor_name, value)
                VALUES (?, ?, ?)
            ''', (today, item['factor_name'], item['value']))
        except sqlite3.IntegrityError:
            pass

    conn.commit()
    conn.close()
    return {"status": "success"}

if __name__ == '__main__':
    scrape_rubber_prices()
    scrape_external_factors()
