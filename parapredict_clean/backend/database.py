import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'parapredict.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # ตารางเก็บราคายางพารา (Append-only)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rubber_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        region TEXT NOT NULL,
        grade TEXT NOT NULL,
        price REAL NOT NULL,
        source TEXT NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, region, grade, source)
    )
    ''')

    # ตารางเก็บปัจจัยแวดล้อม (External Factors)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS external_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        factor_name TEXT NOT NULL,
        value REAL NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, factor_name)
    )
    ''')

    # ตารางผลการทดสอบ Backtesting
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS backtest_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        horizon INTEGER NOT NULL,
        run_date TEXT NOT NULL,
        mae REAL,
        rmse REAL,
        accuracy REAL,
        UNIQUE(model_name, horizon, run_date)
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
