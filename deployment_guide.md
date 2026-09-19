# ขั้นตอนการนำ Backend ขึ้นออนไลน์แบบฟรีด้วย Render.com

เพื่อให้โปรเจกต์สมบูรณ์และใช้งานได้จริงแบบ 100% เราจะอัปโหลดโฟลเดอร์โปรเจกต์ขึ้น GitHub และเชื่อมกับ Render (บริการ Cloud ฟรี) ครับ

## ขั้นที่ 1: นำโค้ดขึ้น GitHub
1. สมัครสมาชิกที่ [GitHub.com](https://github.com/) (ถ้ายังไม่มี)
2. สร้าง Repository ใหม่ ตั้งชื่อว่า `parapredict` (เลือกเป็น Public)
3. เปิด Terminal แล้วพิมพ์คำสั่งเหล่านี้ทีละบรรทัด (เปลี่ยน `<YOUR_USERNAME>` เป็นชื่อผู้ใช้ GitHub ของคุณ):
```bash
git init
git add .
git commit -m "Initial commit for Production"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/parapredict.git
git push -u origin main
```

## ขั้นที่ 2: นำขึ้น Render.com (ฟรี)
1. ไปที่เว็บ [Render.com](https://render.com/) และเข้าสู่ระบบด้วยบัญชี GitHub ของคุณ
2. กดปุ่ม **New +** ที่มุมขวาบน แล้วเลือก **Web Service**
3. เลือกเมนู **Build and deploy from a Git repository** และเลือกโปรเจกต์ `parapredict` ของคุณ
4. ตั้งค่าหน้า Deploy ดังนี้:
   - **Name**: `parapredict-backend`
   - **Region**: Singapore หรือที่ใกล้ไทย
   - **Root Directory**: `backend` *(สำคัญมาก ต้องพิมพ์คำนี้)*
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backfill.py && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. เลื่อนลงมาล่างสุด เลือก **Free Plan** ($0/month) แล้วกดปุ่ม **Create Web Service**

## ขั้นที่ 3: รอและนำ URL กลับมาใส่ในเว็บหลัก
- รอให้ Render ทำการ Build ระบบ (ใช้เวลาประมาณ 3-5 นาที) เมื่อแถบสถานะเปลี่ยนเป็นแถบสีเขียว (Live)
- ให้ก๊อปปี้ URL ที่ได้จาก Render (เช่น `https://parapredict-backend.onrender.com`)
- สร้างไฟล์ชื่อ `.env` ในโฟลเดอร์ `rubber-dashboard` ของคุณ (โฟลเดอร์หลัก) แล้วใส่โค้ดนี้ลงไป:
```
VITE_API_URL=https://parapredict-backend.onrender.com
```
- จากนั้นสั่ง Deploy เว็บหน้าบ้านอีกครั้งด้วยคำสั่ง:
```bash
npm run build && npx firebase deploy --only hosting
```

เพียงเท่านี้ เว็บหลักของคุณ `parapredict.web.app` ก็จะเชื่อมข้อมูล AI กับ Backend ออนไลน์ได้ตลอด 24 ชั่วโมง โดยไม่ต้องเปิดคอมทิ้งไว้เลยครับ!
