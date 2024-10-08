import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, ScrollView,StyleSheet,TextStyle } from "react-native";
import { Category, Transaction, TransactionsByMonth } from "../types";
import { useSQLiteContext } from "expo-sqlite";
import TransactionList from "../components/TransactionsList";
import Card from "../components/ui/Card";
import AddTransaction from "../components/AddTransaction";

export default function Home() {
  const [Categories, setCategories] = useState<Category[]>([]);
  const [Transactions, setTransactions] = useState<Transaction[]>([]);

  const [transactionByMonth, setTransactionsByMonth] =
    React.useState<TransactionsByMonth>({
      totalExpenses: 0,
      totalIncome: 0,
    });

  const db = useSQLiteContext();

  React.useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db]);

  async function getData() {
    const result = await db.getAllAsync<Transaction>(
        `SELECT * FROM Transactions 
        ORDER BY date DESC
        LIMIT 30;`
    );
    setTransactions(result);

    const categoryResult = await db.getAllAsync<Category>(
      `SELECT * FROM Categories;`
    );

    setCategories(categoryResult);

    const now = new Date();
    // Set to the first day of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Get the first day of the next month, then subtract one millisecond to get the end of the current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    // Convert to Unix timestamps (seconds)
    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

    const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM Transactions
      WHERE date >= ? AND date <= ?;
    `,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setTransactionsByMonth(transactionsByMonth[0]);
  }
    


  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id=?;`, [id]);
      await getData();
    });
    
  }


  async function insertTransaction(transaction: Transaction) {
    db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
      `,
        [
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      await getData();
    });
  }


  return (
    <ScrollView contentContainerStyle={{ padding: 15, paddingTop: 100 }}>
      <AddTransaction insertTransaction={insertTransaction}/>
      <TransactionSummary
        totalExpenses={transactionByMonth.totalExpenses}
        totalIncome={transactionByMonth.totalIncome}
      />
      <TransactionList
        categories={Categories}
        transactions={Transactions}
        deleteTransaction={deleteTransaction}
      />
    </ScrollView>
  );
}

function TransactionSummary({
    totalIncome,
    totalExpenses,
  }: TransactionsByMonth) {
    const savings = totalIncome - totalExpenses;
    const readablePeriod = new Date().toLocaleDateString("default", {
      month: "long",
      year: "numeric",
    });
  
    // Function to determine the style based on the value (positive or negative)
    const getMoneyTextStyle = (value: number): TextStyle => ({
      fontWeight: "bold",
      color: value < 0 ? "#ff4500" : "#2e8b57", // Red for negative, custom green for positive
    });
  
    // Helper function to format monetary values
    const formatMoney = (value: number) => {
      const absValue = Math.abs(value).toFixed(2);
      return `${value < 0 ? "-" : "+ "} ₹${absValue}`;
    };
    
  return (
    <Card style={{marginBottom:16}}>
      <Text style={{fontSize:20,fontWeight:'bold'}}>Summary for {readablePeriod}</Text>
      <Text style={styles.summaryText}>
          Income:{""}
          <Text style={getMoneyTextStyle(totalIncome)}>
            {formatMoney(totalIncome)}
          </Text>
          
        </Text>
        <Text style={styles.summaryText}>
          Total Expenses:{" "}
          <Text style={getMoneyTextStyle(totalExpenses)}>
            {formatMoney(totalExpenses)}
          </Text>
        </Text>
        <Text style={styles.summaryText}>
          Savings:{" "}
          <Text style={getMoneyTextStyle(savings)}>{formatMoney(savings)}</Text>
        </Text> 
    </Card>
  );
}

const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      paddingBottom: 7,
    },
    blur: {
      width: "100%",
      height: 110,
      position: "absolute",
      bottom: 0,
      borderTopWidth: 1,
      borderTopColor: "#00000010",
      padding: 16,
    },
    periodTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 15,
    },
    summaryText: {
      fontSize: 18,
      color: "#333",
      marginBottom: 10,
    },
    // Removed moneyText style since we're now generating it dynamically
  });