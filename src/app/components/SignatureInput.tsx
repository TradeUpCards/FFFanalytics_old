// src/app/solana-accounts/TransactionForm.tsx
'use client'

import { useState } from 'react'

export function TransactionForm({ fetchTransactionData }: { fetchTransactionData: (signature: string) => Promise<any> }) {
  const [signature, setSignature] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTransactionData(signature)
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-black">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={signature}
          style={{color: 'black'}}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter transaction signature"
       className="border p-2 mr-2"
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded">
          {isLoading ? 'Fetching...' : 'Fetch Transaction'}
        </button>
      </form>
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {result && (
        <div className="mt-4">
          <h2 className="text-white">Transaction Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-black">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}