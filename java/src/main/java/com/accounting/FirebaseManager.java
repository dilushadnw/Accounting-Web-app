package com.accounting;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.*;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Firebase Manager class for integrating with Firebase Realtime Database
 * This class handles Firebase initialization and database operations
 * 
 * NOTE: This requires Firebase Admin SDK dependencies:
 * - com.google.firebase:firebase-admin
 * 
 * Add to your pom.xml or build.gradle:
 * <dependency>
 *     <groupId>com.google.firebase</groupId>
 *     <artifactId>firebase-admin</artifactId>
 *     <version>9.2.0</version>
 * </dependency>
 */
public class FirebaseManager {
    private static FirebaseDatabase database;

    /**
     * Initialize Firebase with service account credentials
     * @param serviceAccountPath Path to the Firebase service account JSON file
     * @param databaseUrl Firebase Realtime Database URL
     */
    public static void initialize(String serviceAccountPath, String databaseUrl) throws IOException {
        FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl(databaseUrl)
                .build();

        FirebaseApp.initializeApp(options);
        database = FirebaseDatabase.getInstance();
    }

    /**
     * Get reference to transactions for a specific user
     */
    public static DatabaseReference getUserTransactionsRef(String userId) {
        return database.getReference("users").child(userId).child("transactions");
    }

    /**
     * Save a transaction to Firebase
     */
    public static CompletableFuture<Void> saveTransaction(String userId, Transaction transaction) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        DatabaseReference ref = getUserTransactionsRef(userId).child(transaction.getId());
        
        ref.setValue(transaction, (error, ref1) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        
        return future;
    }

    /**
     * Load all transactions for a user
     */
    public static CompletableFuture<List<Transaction>> loadTransactions(String userId) {
        CompletableFuture<List<Transaction>> future = new CompletableFuture<>();
        DatabaseReference ref = getUserTransactionsRef(userId);
        
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Transaction> transactions = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Transaction transaction = snapshot.getValue(Transaction.class);
                    if (transaction != null) {
                        transactions.add(transaction);
                    }
                }
                future.complete(transactions);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });
        
        return future;
    }

    /**
     * Delete a transaction from Firebase
     */
    public static CompletableFuture<Void> deleteTransaction(String userId, String transactionId) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        DatabaseReference ref = getUserTransactionsRef(userId).child(transactionId);
        
        ref.removeValue((error, ref1) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        
        return future;
    }

    /**
     * Listen for real-time updates to transactions
     */
    public static void listenToTransactions(String userId, ValueEventListener listener) {
        getUserTransactionsRef(userId).addValueEventListener(listener);
    }
}
