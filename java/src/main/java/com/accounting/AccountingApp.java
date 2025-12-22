package com.accounting;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Scanner;

/**
 * Main application class for the Accounting Web App
 * This demonstrates the Java backend functionality
 */
public class AccountingApp {
    private static TransactionService transactionService;
    private static Scanner scanner;

    public static void main(String[] args) {
        transactionService = new TransactionService();
        scanner = new Scanner(System.in);

        System.out.println("=================================");
        System.out.println("   Accounting Web App - Java    ");
        System.out.println("=================================\n");

        // Add some demo data
        initializeDemoData();

        boolean running = true;
        while (running) {
            printMenu();
            int choice = getIntInput();

            switch (choice) {
                case 1:
                    addTransaction();
                    break;
                case 2:
                    viewAllTransactions();
                    break;
                case 3:
                    viewTransactionsByType();
                    break;
                case 4:
                    viewTransactionsByCategory();
                    break;
                case 5:
                    deleteTransaction();
                    break;
                case 6:
                    viewSummary();
                    break;
                case 7:
                    running = false;
                    System.out.println("Thank you for using Accounting Web App!");
                    break;
                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        }

        scanner.close();
    }

    private static void printMenu() {
        System.out.println("\n----- Main Menu -----");
        System.out.println("1. Add Transaction");
        System.out.println("2. View All Transactions");
        System.out.println("3. View Transactions by Type");
        System.out.println("4. View Transactions by Category");
        System.out.println("5. Delete Transaction");
        System.out.println("6. View Financial Summary");
        System.out.println("7. Exit");
        System.out.print("Enter your choice: ");
    }

    private static void addTransaction() {
        System.out.println("\n----- Add New Transaction -----");
        
        scanner.nextLine(); // Clear buffer
        
        System.out.print("Description: ");
        String description = scanner.nextLine();
        
        System.out.print("Amount: ");
        double amount = scanner.nextDouble();
        
        scanner.nextLine(); // Clear buffer
        
        System.out.print("Type (income/expense): ");
        String type = scanner.nextLine().toLowerCase();
        
        System.out.print("Category (salary/food/transport/utilities/entertainment/other): ");
        String category = scanner.nextLine().toLowerCase();

        String id = String.valueOf(System.currentTimeMillis());
        Transaction transaction = new Transaction(id, description, amount, type, category, new Date());
        
        transactionService.addTransaction(transaction);
        System.out.println("\n✓ Transaction added successfully!");
    }

    private static void viewAllTransactions() {
        System.out.println("\n----- All Transactions -----");
        List<Transaction> transactions = transactionService.getAllTransactions();
        
        if (transactions.isEmpty()) {
            System.out.println("No transactions found.");
            return;
        }

        printTransactionList(transactions);
    }

    private static void viewTransactionsByType() {
        scanner.nextLine(); // Clear buffer
        System.out.print("\nEnter type (income/expense): ");
        String type = scanner.nextLine().toLowerCase();
        
        List<Transaction> transactions = transactionService.getTransactionsByType(type);
        
        System.out.println("\n----- " + type.toUpperCase() + " Transactions -----");
        if (transactions.isEmpty()) {
            System.out.println("No " + type + " transactions found.");
            return;
        }

        printTransactionList(transactions);
    }

    private static void viewTransactionsByCategory() {
        scanner.nextLine(); // Clear buffer
        System.out.print("\nEnter category: ");
        String category = scanner.nextLine().toLowerCase();
        
        List<Transaction> transactions = transactionService.getTransactionsByCategory(category);
        
        System.out.println("\n----- " + category.toUpperCase() + " Transactions -----");
        if (transactions.isEmpty()) {
            System.out.println("No transactions found in " + category + " category.");
            return;
        }

        printTransactionList(transactions);
    }

    private static void deleteTransaction() {
        viewAllTransactions();
        
        scanner.nextLine(); // Clear buffer
        System.out.print("\nEnter transaction ID to delete: ");
        String id = scanner.nextLine();
        
        boolean deleted = transactionService.deleteTransaction(id);
        
        if (deleted) {
            System.out.println("\n✓ Transaction deleted successfully!");
        } else {
            System.out.println("\n✗ Transaction not found.");
        }
    }

    private static void viewSummary() {
        System.out.println("\n----- Financial Summary -----");
        System.out.printf("Total Income:     $%.2f\n", transactionService.calculateTotalIncome());
        System.out.printf("Total Expenses:   $%.2f\n", transactionService.calculateTotalExpenses());
        System.out.printf("Net Balance:      $%.2f\n", transactionService.calculateNetBalance());
        System.out.printf("Transaction Count: %d\n", transactionService.getTransactionCount());
    }

    private static void printTransactionList(List<Transaction> transactions) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        System.out.println("\nID\t\tDescription\t\tAmount\t\tType\t\tCategory\tDate");
        System.out.println("--------------------------------------------------------------------------------");
        
        for (Transaction t : transactions) {
            System.out.printf("%s\t%s\t\t$%.2f\t\t%s\t\t%s\t\t%s\n",
                    t.getId().substring(0, Math.min(8, t.getId().length())),
                    truncate(t.getDescription(), 15),
                    t.getAmount(),
                    t.getType(),
                    t.getCategory(),
                    dateFormat.format(t.getDate()));
        }
    }

    private static void initializeDemoData() {
        System.out.println("Loading demo data...\n");
        
        transactionService.addTransaction(
            new Transaction("1", "Monthly Salary", 5000.0, "income", "salary", new Date())
        );
        
        transactionService.addTransaction(
            new Transaction("2", "Grocery Shopping", 150.0, "expense", "food", new Date())
        );
        
        transactionService.addTransaction(
            new Transaction("3", "Gas Bill", 80.0, "expense", "utilities", new Date())
        );
        
        System.out.println("Demo data loaded successfully!");
    }

    private static int getIntInput() {
        while (!scanner.hasNextInt()) {
            System.out.print("Invalid input. Please enter a number: ");
            scanner.next();
        }
        return scanner.nextInt();
    }

    private static String truncate(String str, int length) {
        return str.length() > length ? str.substring(0, length - 3) + "..." : str;
    }
}
