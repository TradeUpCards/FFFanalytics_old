// src/pages/transactions.tsx

import { useEffect, useState } from 'react';
 
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await fetch('/api/getTransactions');
                const data = await response.json();
                setTransactions(data);
            } catch (err) {
                setError('Failed to fetch transactions!');
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Latest Transactions</h1>
            <ul>
                {transactions.map((transaction, index) => (
                    <li key={index}>
                        <div>Signature: {transaction.signature}</div>
                        <div>Fox ID: {transaction.fox_id}</div>
                        <div>Mission Result: {transaction.mission_result ? 'Success' : 'Failure'}</div>
                        <div>Block Time: {new Date(transaction.blocktime * 1000).toLocaleString()}</div>
                        {/* Add more details as needed */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
