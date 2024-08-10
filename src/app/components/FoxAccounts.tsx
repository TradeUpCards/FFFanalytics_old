"use client";

import { useEffect, useState } from 'react';

interface FoxAccount {
  publicKey: string;
  data: any; // Adjust the type according to your account data structure
}

const FoxAccounts = () => {
  const [foxAccounts, setFoxAccounts] = useState<FoxAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/fetchFoxAccounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        const data = await response.json();
        setFoxAccounts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Fox Accounts</h1>
      <ul>
        {foxAccounts.map((account) => (
          <li key={account.publicKey}>
            <p>Public Key: {account.publicKey}</p>
            <p>Data: {JSON.stringify(account.data)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoxAccounts;
