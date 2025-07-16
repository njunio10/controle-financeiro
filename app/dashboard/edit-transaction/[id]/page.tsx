"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import TransactionForm from "../../transactions/TransactionForm"
import { getTransactionById } from '@/lib/transactionsApi'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    getTransactionById(id).then(({ data, error }) => {
      if (error || !data) {
        setError("Transação não encontrada.")
      } else {
        setTransaction(data)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }
  if (error) {
    return <div className="p-8 text-[hsl(var(--expense))] dark:text-[hsl(var(--expense))]">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Editar Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm
              initialData={transaction}
              onSuccess={() => router.push("/dashboard")}
              onCancel={() => router.push("/dashboard")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 