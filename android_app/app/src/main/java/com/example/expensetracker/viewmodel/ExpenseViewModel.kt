package com.example.expensetracker.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.viewModelScope
import com.example.expensetracker.data.AppDatabase
import com.example.expensetracker.data.Expense
import com.example.expensetracker.data.ExpenseDao
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ExpenseViewModel(application: Application) : AndroidViewModel(application) {
    private val expenseDao: ExpenseDao = AppDatabase.getDatabase(application).expenseDao()

    val allExpenses: LiveData<List<Expense>> = expenseDao.getAllExpenses()

    fun insertExpense(expense: Expense) {
        viewModelScope.launch(Dispatchers.IO) {
            expenseDao.insertExpense(expense)
        }
    }

    fun getExpensesByCategory(category: String): LiveData<List<Expense>> =
        expenseDao.getExpensesByCategory(category)

    fun getExpensesByDateRange(startDate: Long, endDate: Long): LiveData<List<Expense>> =
        expenseDao.getExpensesByDateRange(startDate, endDate)

    fun getExpensesByAmountRange(minAmount: Double, maxAmount: Double): LiveData<List<Expense>> =
        expenseDao.getExpensesByAmountRange(minAmount, maxAmount)
} 