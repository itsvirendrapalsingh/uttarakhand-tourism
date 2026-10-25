package com.example.expensetracker.data

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface ExpenseDao {
    @Insert
    suspend fun insertExpense(expense: Expense)

    @Query("SELECT * FROM expenses ORDER BY date DESC")
    fun getAllExpenses(): LiveData<List<Expense>>

    @Query("SELECT * FROM expenses WHERE category = :category")
    fun getExpensesByCategory(category: String): LiveData<List<Expense>>

    @Query("SELECT * FROM expenses WHERE date BETWEEN :startDate AND :endDate")
    fun getExpensesByDateRange(startDate: Long, endDate: Long): LiveData<List<Expense>>

    @Query("SELECT * FROM expenses WHERE amount >= :minAmount AND amount <= :maxAmount")
    fun getExpensesByAmountRange(minAmount: Double, maxAmount: Double): LiveData<List<Expense>>

    // Add more queries as needed for analytics
} 