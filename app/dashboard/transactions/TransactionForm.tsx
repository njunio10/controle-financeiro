"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, TrendingUp, TrendingDown } from "lucide-react"
import { addTransaction } from '@/lib/transactionsApi'

interface TransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    id: string
    date: string
    description: string
    amount: number
    type: "income" | "expense"
  }
}

export default function TransactionForm({ onSuccess, onCancel, initialData }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(initialData?.type || "expense")
  const [date, setDate] = useState(initialData ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState(initialData?.description || "")
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      setError("Usuário não autenticado.")
      setIsLoading(false)
      return
    }
    if (initialData?.id) {
      // Editar transação existente
      const updates = {
        date,
        description,
        amount: Number.parseFloat(amount),
        type,
      }
      const { error } = await (await import('@/lib/transactionsApi')).updateTransaction(initialData.id, updates)
      if (error) {
        setError("Erro ao atualizar transação.")
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      onSuccess()
    } else {
      // Nova transação
      const newTransaction = {
        user_email: userEmail,
        date,
        description,
        amount: Number.parseFloat(amount),
        type,
      }
      const { error } = await (await import('@/lib/transactionsApi')).addTransaction(newTransaction)
      if (error) {
        setError("Erro ao salvar transação.")
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      onSuccess()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Transação</CardTitle>
        <CardDescription>Registre uma nova receita ou despesa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`p-4 border-2 rounded-lg transition-all duration-200 shadow-sm ${
                  type === "income"
                    ? "border-[hsl(var(--income))] bg-[hsl(var(--income)/0.15)] text-[hsl(var(--income))] dark:border-[hsl(var(--income))] dark:bg-[hsl(var(--income)/0.15)] dark:text-[hsl(var(--income))]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[hsl(var(--income))] dark:border-[#333] dark:bg-card dark:text-[#bbbbbb] dark:hover:border-[hsl(var(--income))]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Receita</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Dinheiro que entra</p>
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`p-4 border-2 rounded-lg transition-all duration-200 shadow-sm ${
                  type === "expense"
                    ? "border-[hsl(var(--expense))] bg-[hsl(var(--expense)/0.15)] text-[hsl(var(--expense))] dark:border-[hsl(var(--expense))] dark:bg-[hsl(var(--expense)/0.15)] dark:text-[hsl(var(--expense))]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[hsl(var(--expense))] dark:border-[#333] dark:bg-card dark:text-[#bbbbbb] dark:hover:border-[hsl(var(--expense))]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-medium">Despesa</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Dinheiro que sai</p>
              </button>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário, Combustível..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className={`${type === "income" ? "focus:border-[hsl(var(--income))] dark:focus:border-[hsl(var(--income))]" : "focus:border-[hsl(var(--expense))] dark:focus:border-[hsl(var(--expense))]"}`}
            />
          </div>

          {/* Erro */}
          {error && <div className="text-[hsl(var(--expense))] text-sm">{error}</div>}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              className={`flex-1 text-white dark:text-white border-2 shadow-sm ${type === "income" ? "bg-[hsl(var(--income))] border-[hsl(var(--income))] dark:bg-[hsl(var(--income))] dark:border-[hsl(var(--income))]" : "bg-[hsl(var(--expense))] border-[hsl(var(--expense))] dark:bg-[hsl(var(--expense))] dark:border-[hsl(var(--expense))]"}`}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Transação"}
            </Button>
            <Button type="button" variant="outline" className="w-full bg-transparent flex-1" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 