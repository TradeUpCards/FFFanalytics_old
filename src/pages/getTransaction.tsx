// src/app/solana-accounts/page.tsx
import {TransactionForm} from '@/components/SignatureInput'
import { fetchTransactionData } from './actions'

export default function SolanaAccountsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Transaction Data</h1>
      <TransactionForm fetchTransactionData={fetchTransactionData} />
    </div>
  )
}