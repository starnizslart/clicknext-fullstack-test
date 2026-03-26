const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let transactions = [];
const INITIAL_BALANCE = 1000000;

const getBalance = () => {
  return transactions.reduce((acc, curr) => {
    if (curr.type === 'DEPOSIT') return acc + curr.amount;
    if (curr.type === 'WITHDRAW') return acc - curr.amount;
    return acc;
  }, INITIAL_BALANCE);
};

app.get('/api/transactions', (req, res) => {
  res.json({
    transactions,
    currentBalance: getBalance()
  });
});

app.post('/api/transactions', (req, res) => {
  const { id, datetime, type, amount, email } = req.body;
  const numAmount = Number(amount);

  if (type === 'WITHDRAW' && numAmount > getBalance()) {
    console.log(`[❌ ERROR] ${email} พยายามถอนเงิน ${numAmount} บาท (แต่เงินไม่พอ)`);
    return res.status(400).json({ error: 'ยอดเงินคงเหลือไม่เพียงพอ' });
  }

  const newTx = { id, datetime, type, amount: numAmount, email };
  transactions.unshift(newTx);
  
  // แจ้งเตือนลง Terminal เวลาฝาก/ถอนสำเร็จ
  const actionText = type === 'DEPOSIT' ? 'ฝากเงิน' : 'ถอนเงิน';
  console.log(`[✅ SUCCESS] ${email} ทำรายการ${actionText}: ${numAmount.toLocaleString()} บาท | ยอดคงเหลือ: ${getBalance().toLocaleString()} บาท`);
  
  res.json(newTx);
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const numAmount = Number(amount);

  const txIndex = transactions.findIndex(t => t.id === id);
  if (txIndex === -1) return res.status(404).json({ error: 'ไม่พบรายการ' });

  const oldAmount = transactions[txIndex].amount;
  transactions[txIndex].amount = numAmount;
  
  // แจ้งเตือนลง Terminal เวลาแก้ไข
  console.log(`[📝 EDIT] แก้ไขจำนวนเงินจาก ${oldAmount.toLocaleString()} เป็น ${numAmount.toLocaleString()} บาท | ยอดคงเหลือใหม่: ${getBalance().toLocaleString()} บาท`);

  res.json(transactions[txIndex]);
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  
  const deletedTx = transactions.find(t => t.id === id);
  if (deletedTx) {
    transactions = transactions.filter(t => t.id !== id);
    // แจ้งเตือนลง Terminal เวลาลบ
    console.log(`[🗑️ DELETE] ลบรายการ${deletedTx.type === 'DEPOSIT' ? 'ฝาก' : 'ถอน'} จำนวน ${deletedTx.amount.toLocaleString()} บาท | ยอดคงเหลือใหม่: ${getBalance().toLocaleString()} บาท`);
  }
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend API Server รันอยู่บนพอร์ต ${PORT}`));