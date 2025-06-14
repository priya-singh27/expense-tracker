import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Calendar, X, Check } from 'lucide-react';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Separate state for add and edit forms
  const [addFormData, setAddFormData] = useState({
    title: '',
    amount: '',
    date: '',
    category: 'Food'
  });
  
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    date: '',
    category: 'Food'
  });

  const categories = [
    'Food', 'Transportation', 'Utilities', 'Entertainment', 
    'Healthcare', 'vacation', 'Shopping', 'Festivals'
  ];

  const API_BASE = 'http://localhost:8000/api/expense';

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/allexpenses`);
      const data = await response.json();
      if (data.code === 200 || data.success) {
        setExpenses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Add form handlers - STABLE REFERENCE
  const handleAddFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Edit form handlers - STABLE REFERENCE
  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Add expense
  const handleAddExpense = useCallback(async () => {
    if (!addFormData.title || !addFormData.amount || !addFormData.date) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/addexpense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData)
      });
      
      const data = await response.json();
      if (data.code === 200 || data.success) {
        await fetchExpenses();
        setShowAddModal(false);
        setAddFormData({ title: '', amount: '', date: '', category: 'Food' });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  }, [addFormData, fetchExpenses]);

  // Update expense
  const handleUpdateExpense = useCallback(async () => {
    if (!editFormData.title || !editFormData.amount || !editFormData.date || !editingExpense) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/updateexpense/${editingExpense._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      if (data.code === 200 || data.success) {
        await fetchExpenses();
        setShowEditModal(false);
        setEditingExpense(null);
        setEditFormData({ title: '', amount: '', date: '', category: 'Food' });
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setLoading(false);
    }
  }, [editFormData, editingExpense, fetchExpenses]);

  // Delete expense
  const handleDeleteExpense = useCallback(async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/deleteexpense/${expenseId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.code === 200 || data.success) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchExpenses]);

  const openEditModal = useCallback((expense) => {
    setEditingExpense(expense);
    setEditFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category
    });
    setShowEditModal(true);
  }, []);

  const getCategoryColor = useMemo(() => {
    const colors = {
      Food: '#dcfce7',
      Transportation: '#dbeafe', 
      Utilities: '#fef3c7',
      Entertainment: '#f3e8ff',
      Healthcare: '#fee2e2',
      vacation: '#e0e7ff',
      Shopping: '#fce7f3',
      Festivals: '#fed7aa'
    };
    return (category) => colors[category] || '#f3f4f6';
  }, []);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Manager</h1>
            <p className="text-gray-600 mt-1">Track and manage your expenses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Expense
          </button>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-6">
          <div className="flex items-center">
            {/* <span className="text-2xl mr-3">₹</span> */}
            <div>
              <p className="text-sm opacity-90">Total Expenses</p>
              <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {loading && expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl text-gray-400 block mb-4">₹</span>
            <p className="text-lg text-gray-600 mb-2">No expenses found</p>
            <p className="text-gray-500">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">{expense.title}</h3>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-gray-700"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      >
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center">
                        {/* <span className="text-sm mr-1">₹</span> */}
                        <span className="font-medium">₹{expense.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  key="add-title"
                  type="text"
                  name="title"
                  value={addFormData.title}
                  onChange={handleAddFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter expense title"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  key="add-amount"
                  type="number"
                  name="amount"
                  value={addFormData.amount}
                  onChange={handleAddFormChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  key="add-date"
                  type="date"
                  name="date"
                  value={addFormData.date}
                  onChange={handleAddFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  key="add-category"
                  name="category"
                  value={addFormData.category}
                  onChange={handleAddFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddExpense}
                  disabled={loading || !addFormData.title || !addFormData.amount || !addFormData.date}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={18} className="mr-2" />
                  {loading ? 'Saving...' : 'Add Expense'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  key="edit-title"
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter expense title"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  key="edit-amount"
                  type="number"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditFormChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  key="edit-date"
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  key="edit-category"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateExpense}
                  disabled={loading || !editFormData.title || !editFormData.amount || !editFormData.date}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={18} className="mr-2" />
                  {loading ? 'Saving...' : 'Update Expense'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;