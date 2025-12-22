package com.accounting;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing transactions
 * This provides business logic for transaction operations
 */
public class TransactionService {
    private List<Transaction> transactions;

    public TransactionService() {
        this.transactions = new ArrayList<>();
    }

    /**
     * Add a new transaction
     */
    public void addTransaction(Transaction transaction) {
        transactions.add(transaction);
    }

    /**
     * Get all transactions
     */
    public List<Transaction> getAllTransactions() {
        return new ArrayList<>(transactions);
    }

    /**
     * Get transaction by ID
     */
    public Transaction getTransactionById(String id) {
        return transactions.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    /**
     * Get transactions by type (income/expense)
     */
    public List<Transaction> getTransactionsByType(String type) {
        return transactions.stream()
                .filter(t -> t.getType().equals(type))
                .collect(Collectors.toList());
    }

    /**
     * Get transactions by category
     */
    public List<Transaction> getTransactionsByCategory(String category) {
        return transactions.stream()
                .filter(t -> t.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    /**
     * Delete transaction by ID
     */
    public boolean deleteTransaction(String id) {
        return transactions.removeIf(t -> t.getId().equals(id));
    }

    /**
     * Calculate total income
     */
    public double calculateTotalIncome() {
        return transactions.stream()
                .filter(t -> t.getType().equals("income"))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    /**
     * Calculate total expenses
     */
    public double calculateTotalExpenses() {
        return transactions.stream()
                .filter(t -> t.getType().equals("expense"))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    /**
     * Calculate net balance
     */
    public double calculateNetBalance() {
        return calculateTotalIncome() - calculateTotalExpenses();
    }

    /**
     * Get transaction count
     */
    public int getTransactionCount() {
        return transactions.size();
    }
}
