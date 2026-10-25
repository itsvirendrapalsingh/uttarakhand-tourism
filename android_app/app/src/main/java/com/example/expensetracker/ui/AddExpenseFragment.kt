package com.example.expensetracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.example.expensetracker.R
import com.example.expensetracker.data.Expense
import com.example.expensetracker.viewmodel.ExpenseViewModel
import java.util.*

class AddExpenseFragment : Fragment() {
    private val expenseViewModel: ExpenseViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_add_expense, container, false)
        val amountEditText: EditText = view.findViewById(R.id.edit_text_amount)
        val categorySpinner: Spinner = view.findViewById(R.id.spinner_category)
        val dateEditText: EditText = view.findViewById(R.id.edit_text_date)
        val notesEditText: EditText = view.findViewById(R.id.edit_text_notes)
        val addButton: Button = view.findViewById(R.id.button_add_expense)

        addButton.setOnClickListener {
            val amount = amountEditText.text.toString().toDoubleOrNull() ?: 0.0
            val category = categorySpinner.selectedItem.toString()
            val date = Date().time // For simplicity, use current date
            val notes = notesEditText.text.toString()
            val expense = Expense(amount = amount, category = category, date = date, notes = notes)
            expenseViewModel.insertExpense(expense)
            // Optionally, clear fields or show a message
        }
        return view
    }
} 