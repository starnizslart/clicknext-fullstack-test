ClickNext Full-Stack Developer Test

โปรเจกต์แบบทดสอบตำแหน่ง Full-Stack Developer ของบริษัท ClickNext (ระบบจัดการเงินทุน ฝาก-ถอน)

Tech Stack

Frontend:

React (Vite)

Tailwind CSS

Context API (สำหรับจัดการ Global State)

Backend:

Node.js

Express.js

CORS

รายละเอียดระบบ (Features)

Login: หน้าเข้าสู่ระบบ มีการ Validate รูปแบบ Email (เข้าสู่ระบบแล้วเก็บ Session ไว้ ไม่ต้อง Login ใหม่เมื่อ Refresh)

Deposit / Withdraw: ระบบฝาก/ถอนเงิน

กรอกตัวเลขได้เฉพาะ 1 - 100,000 บาท

มีระบบป้องกันการถอนเงินเกินยอดคงเหลือในบัญชี

Transaction History: หน้าแสดงประวัติการทำรายการ

Edit: แก้ไขจำนวนเงินฝาก-ถอนได้ โดยระบบจะคำนวณยอดเงินคงเหลือใหม่ทันที และป้องกันการแก้ไขที่ส่งผลให้ยอดเงินติดลบ

Delete: ลบรายการได้ (มี Modal Confirm ยืนยันก่อนลบ) และป้องกันการลบที่ส่งผลให้ยอดเงินรวมติดลบ

State Management: ใช้ Context API ในการจัดการข้อมูลระหว่าง Component ทำให้ข้อมูลอัปเดตตรงกันทุกหน้า

Responsive Design: รองรับการแสดงผลทั้งบน Desktop และ Mobile (Mobile จะมี Drawer Menu)

Backend API: รองรับ HTTP Request (GET, POST, PUT, DELETE) จากหน้าบ้าน พร้อมแสดง Log การทำงานใน Terminal

การติดตั้งและรันโปรเจกต์

ระบบแบ่งออกเป็น 2 ส่วน (Frontend และ Backend) จำเป็นต้องรันแยกกันคนละ Terminal

1. การรัน Backend (Node.js)

เปิด Terminal ที่ 1 แล้วรันคำสั่ง:

cd backend
npm install
node server.js


(Server จะรันอยู่ที่ http://localhost:5000)

2. การรัน Frontend (React)

เปิด Terminal ที่ 2 แล้วรันคำสั่ง:

cd frontend
npm install
npm run dev


(เปิดเบราว์เซอร์ไปที่ http://localhost:5173 เพื่อใช้งานระบบ)

หมายเหตุเพิ่มเติม

ข้อมูล Transaction ฝั่ง Backend ถูกออกแบบให้เก็บไว้ใน Memory (Array) เป็นหลักเพื่อความสะดวกในการเปิดรันเพื่อตรวจแบบทดสอบ (ไม่ได้เชื่อมต่อ Database ภายนอก) ดังนั้นข้อมูลจะถูกรีเซ็ตหากมีการ Restart ตัว Backend Server
