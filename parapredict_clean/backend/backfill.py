import sqlite3
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from database import get_db_connection

def generate_backfill_data(days=365):
    """
    สร้างข้อมูลประวัติราคายางและปัจจัยตลาดโลกย้อนหลัง 1 ปี (เพื่อจำลองข้อมูลจริง)
    """
    print(f"Generating backfill data for {days} days...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # 1. จำลองราคายาง 4 ชนิด (เพิ่ม Noise และ Trend)
    trend = np.linspace(60, 85, len(dates))
    seasonality = np.sin(np.arange(len(dates)) * (2 * np.pi / 180)) * 5
    
    for i, date in enumerate(dates):
        date_str = date.strftime('%Y-%m-%d')
        base_price = trend[i] + seasonality[i]
        
        # ยางแผ่นดิบ
        price_sheet = base_price + random.uniform(-1, 1)
        # น้ำยางสด
        price_latex = base_price - 8 + random.uniform(-1, 1)
        # ยางก้อนถ้วย
        price_cup = base_price - 15 + random.uniform(-1, 1)
        # ยางแผ่นรมควัน
        price_rss3 = base_price + 5 + random.uniform(-1, 1)
        
        items = [
            ("south", "sheet", price_sheet),
            ("south", "latex", price_latex),
            ("south", "cup", price_cup),
            ("south", "rss3", price_rss3)
        ]
        
        for region, grade, price in items:
            try:
                cursor.execute('''
                    INSERT INTO rubber_prices (date, region, grade, price, source)
                    VALUES (?, ?, ?, ?, ?)
                ''', (date_str, region, grade, round(price, 2), "RAOT"))
            except sqlite3.IntegrityError:
                pass
                
        # 2. จำลองปัจจัยแวดล้อม (External factors)
        oil_price = 70 + np.sin(i / 10) * 10 + random.uniform(-2, 2)
        usd_thb = 35 + np.cos(i / 20) * 2 + random.uniform(-0.2, 0.2)
        
        try:
            cursor.execute('''INSERT INTO external_factors (date, factor_name, value) VALUES (?, ?, ?)''', (date_str, 'brent_oil', round(oil_price, 2)))
            cursor.execute('''INSERT INTO external_factors (date, factor_name, value) VALUES (?, ?, ?)''', (date_str, 'usd_thb', round(usd_thb, 2)))
        except sqlite3.IntegrityError:
            pass

    conn.commit()
    conn.close()
    print("Backfill completed successfully!")

if __name__ == '__main__':
    generate_backfill_data(365)
