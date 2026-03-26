import React, { useState, useEffect, useContext, createContext } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(1000000);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/transactions');
      const data = await res.json();
      setTransactions(data.transactions);
      setCurrentBalance(data.currentBalance);
    } catch (error) {
      console.error("ไม่สามารถเชื่อมต่อกับ Backend ได้:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ฟังก์ชันเพิ่มข้อมูล (ยิง API POST)
  const addTransaction = async (transaction) => {
    try {
      await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      fetchTransactions(); // โหลดข้อมูลมาแสดงใหม่
    } catch (error) {
      console.error(error);
    }
  };

  const editTransaction = async (id, newAmount) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount })
      });
      fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE'
      });
      fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      transactions, 
      currentBalance, 
      addTransaction, 
      editTransaction, 
      deleteTransaction 
    }}>
      {children}
    </AppContext.Provider>
  );
};

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-400 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('รูปแบบ Email ไม่ถูกต้อง');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }
    setError('');
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 w-full max-w-sm border border-gray-400">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input
              type="text"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password *</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#343a40] text-white py-2 px-4 mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};


const DepositWithdraw = ({ userEmail }) => {
  const { currentBalance, addTransaction } = useContext(AppContext);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleTransaction = (type) => {
    const numAmount = Number(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    if (numAmount <= 0 || numAmount > 100000) {
      setError('กรุณากรอกจำนวนเงิน 1 - 100,000 บาท');
      return;
    }
    if (type === 'WITHDRAW' && numAmount > currentBalance) {
      setError('ยอดเงินคงเหลือไม่เพียงพอ');
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      datetime: new Date().toLocaleString('th-TH'),
      type,
      amount: numAmount,
      email: userEmail
    };

    addTransaction(newTx);
    setAmount('');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 text-center">
      <h2 className="mb-8">
        จำนวนเงินคงเหลือ {currentBalance.toLocaleString()} บาท
      </h2>
      
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-sm mb-1 text-center">จำนวนเงิน *</label>
          <input
            type="number"
            placeholder="กรอกจำนวนเงิน"
            className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max="100000"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => handleTransaction('DEPOSIT')}
            className="bg-[#28a745] text-white py-2 px-8 rounded-sm"
          >
            ฝาก
          </button>
          <button
            onClick={() => handleTransaction('WITHDRAW')}
            className="bg-[#dc3545] text-white py-2 px-8 rounded-sm"
          >
            ถอน
          </button>
        </div>
      </div>
    </div>
  );
};


const TransactionHistory = () => {
  const { transactions, editTransaction, deleteTransaction, currentBalance } = useContext(AppContext);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editError, setEditError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // เปลี่ยนเป็น 3 ตามโจทย์/รูปตัวอย่าง
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const displayedTx = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEdit = (tx) => {
    setSelectedTx(tx);
    setEditAmount(tx.amount.toString());
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    const numAmount = Number(editAmount);
    if (!editAmount || isNaN(numAmount) || numAmount <= 0 || numAmount > 100000) {
      setEditError('จำนวนเงินต้องอยู่ระหว่าง 1 - 100,000 บาท');
      return;
    }

    const diff = numAmount - selectedTx.amount;
    let tempBalance = currentBalance;
    
    if (selectedTx.type === 'DEPOSIT') {
        tempBalance = currentBalance + diff;
    } else {
        tempBalance = currentBalance - diff;
    }

    if (tempBalance < 0) {
        setEditError('การแก้ไขนี้จะทำให้ยอดเงินคงเหลือติดลบ');
        return;
    }

    editTransaction(selectedTx.id, numAmount);
    setEditModalOpen(false);
  };

  const openDelete = (tx) => {
    setSelectedTx(tx);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTx.type === 'DEPOSIT' && (currentBalance - selectedTx.amount < 0)) {
        alert('ไม่สามารถลบรายการฝากนี้ได้ เนื่องจากจะทำให้ยอดเงินคงเหลือติดลบ');
        setDeleteModalOpen(false);
        return;
    }
    deleteTransaction(selectedTx.id);
    setDeleteModalOpen(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="mb-4">ประวัติรายการฝากถอน</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-800">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-4 py-2 font-normal">Datetime</th>
              <th className="border border-gray-800 px-4 py-2 font-normal">Amount</th>
              <th className="border border-gray-800 px-4 py-2 font-normal">Status</th>
              <th className="border border-gray-800 px-4 py-2 font-normal hidden sm:table-cell">Email</th>
              <th className="border border-gray-800 px-4 py-2 font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedTx.length === 0 ? (
              <tr><td colSpan="5" className="border border-gray-800 px-4 py-4 text-center">ไม่มีข้อมูล</td></tr>
            ) : (
              displayedTx.map((tx) => (
                <tr key={tx.id}>
                  <td className="border border-gray-800 px-4 py-2">{tx.datetime}</td>
                  <td className="border border-gray-800 px-4 py-2 text-right">{tx.amount.toLocaleString()}</td>
                  <td className={`border border-gray-800 px-4 py-2 text-center ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'DEPOSIT' ? 'ฝาก' : 'ถอน'}
                  </td>
                  <td className="border border-gray-800 px-4 py-2 hidden sm:table-cell">{tx.email}</td>
                  <td className="border border-gray-800 px-4 py-2 text-center">
                    <button onClick={() => openEdit(tx)} className="bg-[#343a40] text-white px-2 py-1 rounded-sm text-xs mr-2">Edit</button>
                    <button onClick={() => openDelete(tx)} className="bg-[#343a40] text-white px-2 py-1 rounded-sm text-xs">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      
      {transactions.length > 0 && (
        <div className="mt-4 text-sm flex justify-between items-center">
          <span>แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, transactions.length)} จาก {transactions.length} รายการ</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 border border-gray-400 disabled:opacity-50">ก่อนหน้า</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 border border-gray-400 disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      )}

      
      <Modal isOpen={editModalOpen} title="แก้ไขจำนวนเงินฝาก/ถอน" onClose={() => setEditModalOpen(false)}>
        {selectedTx && (
          <div className="space-y-4">
            <div className="text-sm">
              <p>ของวันที่ {selectedTx.datetime}</p>
              <p>จากอีเมล {selectedTx.email}</p>
            </div>
            <div>
              <label className="block text-sm mb-1">จำนวนเงิน *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-gray-600"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                min="1"
                max="100000"
              />
            </div>
            {editError && <p className="text-red-500 text-sm">{editError}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={handleEditSubmit} className="bg-[#5a6268] text-white px-4 py-1.5 rounded-sm">ยืนยัน</button>
              <button onClick={() => setEditModalOpen(false)} className="text-blue-500 px-4 py-1.5 hover:underline">ยกเลิก</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} title="ยืนยันการลบ" onClose={() => setDeleteModalOpen(false)}>
        {selectedTx && (
          <div className="space-y-4 text-sm">
            <p>จำนวนเงิน{selectedTx.type === 'DEPOSIT' ? 'ฝาก' : 'ถอน'} {selectedTx.amount.toLocaleString()} บาท</p>
            <p>ของวันที่ {selectedTx.datetime}</p>
            <p>จากอีเมล {selectedTx.email}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={handleDeleteConfirm} className="bg-[#5a6268] text-white px-4 py-1.5 rounded-sm">ยืนยัน</button>
              <button onClick={() => setDeleteModalOpen(false)} className="text-blue-500 px-4 py-1.5 hover:underline">ยกเลิก</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};


const MainApp = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('DEPOSIT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_in_user');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (email) => {
    localStorage.setItem('logged_in_user', email);
    setUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('logged_in_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      
      <header className="border-b border-gray-400 h-14 flex items-center justify-between px-4 z-20 sticky top-0 bg-white">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-gray-800 p-1 border border-gray-400 rounded-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
          <span className="text-lg"></span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-[#5a6268] text-white px-3 py-1 rounded-sm text-sm"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1 relative border-t border-gray-400">
        
        <div className={`
          absolute md:static inset-y-0 left-0 bg-[#f8f9fa] w-56 border-r border-gray-400 z-10 
          transition-transform duration-200 ease-in-out md:transform-none
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 space-y-2 mt-4">
            <button
              onClick={() => { setActiveMenu('DEPOSIT'); setMobileMenuOpen(false); }}
              className={`w-full text-center px-4 py-2 rounded-sm border border-transparent ${
                activeMenu === 'DEPOSIT' 
                  ? 'bg-[#5a6268] text-white border-gray-600' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              Deposit / Withdraw
            </button>
            <button
              onClick={() => { setActiveMenu('TRANSACTION'); setMobileMenuOpen(false); }}
              className={`w-full text-center px-4 py-2 rounded-sm border border-transparent ${
                activeMenu === 'TRANSACTION' 
                  ? 'bg-[#5a6268] text-white border-gray-600' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              Transaction
            </button>
          </nav>
        </div>

        
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-10 z-0 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        
        <main className="flex-1 bg-white relative overflow-y-auto p-4">
          {activeMenu === 'DEPOSIT' ? (
            <DepositWithdraw userEmail={user} />
          ) : (
            <TransactionHistory />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}