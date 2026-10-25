package com.example.expensetracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.expensetracker.R
import com.example.expensetracker.viewmodel.ExpenseViewModel
import com.example.expensetracker.ui.adapters.ExpenseAdapter

class HomeFragment : Fragment() {
    private val expenseViewModel: ExpenseViewModel by viewModels()
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ExpenseAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        recyclerView = view.findViewById(R.id.recycler_view)
        adapter = ExpenseAdapter()
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        expenseViewModel.allExpenses.observe(viewLifecycleOwner, Observer { expenses ->
            adapter.submitList(expenses)
        })
        return view
    }
} 