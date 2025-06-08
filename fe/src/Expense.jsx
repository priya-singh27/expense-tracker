import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Calendar, X, Check } from 'lucide-react';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: '',
    category: 'Food'
  });

  const categories = [
    'Food', 'Transportation', 'Utilities', 'Entertainment', 
    'Healthcare', 'vacation', 'Shopping', 'Festivals'
  ];

  // Backend API URL
  const API_BASE = 'http://localhost:3000/api/expense';

  // Fetch all expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      date: '',
      category: 'Food'
    });
  };

  const addExpense = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/addexpense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.code === 200 || data.success) {
        fetchExpenses();
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, resetForm, fetchExpenses]);

  const updateExpense = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/updateexpense/${editingExpense._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.code === 200 || data.success) {
        fetchExpenses();
        setIsEditModalOpen(false);
        setEditingExpense(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, editingExpense, resetForm, fetchExpenses]);

  const deleteExpense = useCallback(async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/deleteexpense/${expenseId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.code === 200 || data.success) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchExpenses]);

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category
    });
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryColor = useCallback((category) => {
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
    return colors[category] || '#f3f4f6';
  }, []);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          margin: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const inputStyle = useCallback(() => ({
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  }), []);

  const buttonStyle = useCallback(() => ({
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  }), []);

  // Create a completely isolated ExpenseForm component
  const ExpenseForm = useCallback(({ onSubmit, submitText }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            style={inputStyle()}
            placeholder="Enter expense title"
            autoComplete="off"
            key={`title-${formData.title}`}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            style={inputStyle()}
            placeholder="0.00"
            autoComplete="off"
            key={`amount-${formData.amount}`}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            style={inputStyle()}
            autoComplete="off"
            key={`date-${formData.date}`}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={inputStyle()}
            key={`category-${formData.category}`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
          <button
            onClick={onSubmit}
            disabled={loading || !formData.title || !formData.amount || !formData.date}
            style={{
              ...buttonStyle(),
              flex: 1,
              backgroundColor: '#2563eb',
              color: 'white',
              opacity: (loading || !formData.title || !formData.amount || !formData.date) ? 0.5 : 1
            }}
          >
            <Check size={18} style={{ marginRight: '8px' }} />
            {loading ? 'Saving...' : submitText}
          </button>
          <button
            onClick={closeModals}
            style={{
              ...buttonStyle(),
              flex: 1,
              backgroundColor: '#d1d5db',
              color: '#374151'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }, [formData, handleInputChange, loading, closeModals, categories, inputStyle, buttonStyle]);

  return (
    <div style={{
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>Expense Manager</h1>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: 0
            }}>Track and manage your expenses</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              ...buttonStyle(),
              backgroundColor: '#2563eb',
              color: 'white'
            }}
          >
            <Plus size={20} style={{ marginRight: '8px' }} />
            Add Expense
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DollarSign size={24} style={{ marginRight: '12px' }} />
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Total Expenses</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                ${getTotalExpenses().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {loading && expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '2px solid #2563eb',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <DollarSign size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>No expenses found</p>
            <p style={{ color: '#9ca3af', margin: 0 }}>Add your first expense to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {expenses.map((expense) => (
              <div
                key={expense._id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'box-shadow 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginRight: '12px',
                        margin: 0
                      }}>
                        {expense.title}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getCategoryColor(expense.category),
                        color: '#374151'
                      }}>
                        {expense.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DollarSign size={16} style={{ marginRight: '4px' }} />
                        <span style={{ fontWeight: '500' }}>${expense.amount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={16} style={{ marginRight: '4px' }} />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                    <button
                      onClick={() => openEditModal(expense)}
                      style={{
                        color: '#2563eb',
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Edit expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense._id)}
                      style={{
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        title="Add New Expense"
      >
        <ExpenseForm onSubmit={addExpense} submitText="Add Expense" />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title="Edit Expense"
      >
        <ExpenseForm onSubmit={updateExpense} submitText="Update Expense" />
      </Modal>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExpenseManager;