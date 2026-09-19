from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_db_connection, init_db
from scraper import scrape_rubber_prices, scrape_external_factors
import os
import sqlite3

app = FastAPI(title="ParaPredict API")

# อนุญาตให้ Frontend (Vite) เรียก API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # ตรวจสอบและสร้างตารางฐานข้อมูลเมื่อเริ่มรันเซิร์ฟเวอร์
    init_db()

@app.get("/api/prices")
def get_prices(region: str = "south", grade: str = "sheet", limit: int = 45):
    """ดึงข้อมูลราคาย้อนหลัง"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, price, source, fetched_at 
        FROM rubber_prices 
        WHERE region = ? AND grade = ?
        ORDER BY date DESC LIMIT ?
    ''', (region, grade, limit))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        # ถ้ายังไม่มีข้อมูลใน DB คืนค่า Mock กลับไปก่อนเพื่อให้ Frontend ไม่พัง
        return {"status": "empty", "message": "No data in database. Please run /api/scrape"}

    return [dict(row) for row in rows]

@app.post("/api/scrape")
def trigger_scrape():
    """สั่งดึงข้อมูลราคายางและปัจจัยตลาดโลก"""
    res_rubber = scrape_rubber_prices()
    res_factors = scrape_external_factors()
    return {
        "rubber_prices": res_rubber,
        "external_factors": res_factors
    }

@app.get("/api/forecast")
def get_forecast(horizon: int = 7):
    """
    คืนค่าผลลัพธ์การพยากรณ์และผล Backtest จากโมเดล
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    # ดึงข้อมูลยางแผ่นดิบภาคใต้เพื่อนำไปเข้าโมเดล
    cursor.execute('''
        SELECT date, price 
        FROM rubber_prices 
        WHERE region = 'south' AND grade = 'sheet'
        ORDER BY date ASC
    ''')
    rows = cursor.fetchall()
    conn.close()

    if len(rows) < 30:
        return {"status": "error", "message": "Not enough data for forecasting. Please run /api/scrape"}

    import pandas as pd
    from ml_models import run_all_models
    
    df = pd.DataFrame([dict(row) for row in rows])
    
    # รันโมเดล (ใช้แค่ horizon เดียวที่ Request มาเพื่อความรวดเร็ว)
    results = run_all_models(df, horizons=[horizon])
    
    forecasts = {}
    for r in results:
        forecasts[r['model_name']] = {
            "accuracy": r['accuracy'],
            "rmse": r['rmse']
        }

    return {
        "status": "success",
        "horizon": horizon,
        "forecasts": forecasts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
