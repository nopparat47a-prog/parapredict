import traceback
import sys
from ml_models import run_all_models
import pandas as pd
from database import get_db_connection

def debug():
    try:
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT date, price FROM rubber_prices WHERE region='south' AND grade='sheet' ORDER BY date ASC", conn)
        conn.close()
        print("Data loaded, rows:", len(df))
        run_all_models(df, [7])
        print("Success")
    except Exception as e:
        print("Error:")
        traceback.print_exc()

if __name__ == '__main__':
    debug()
