"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getTransactions, deleteTransaction, getTransactionById } from '@/lib/transactionsApi'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Search, Filter, Trash2, Plus } from "lucide-react"
import { Pencil, ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"
import TransactionForm from "./TransactionForm"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [monthFilter, setMonthFilter] = useState(() => new Date().getMonth().toString())
  const [yearFilter, setYearFilter] = useState(() => new Date().getFullYear().toString())
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    const email = localStorage.getItem("userEmail")
    if (!user || !email) {
      router.push("/")
      return
    }
    getTransactions(email).then(({ data, error }) => {
      if (!error && data) {
        setTransactions(data)
        setFilteredTransactions(data)
      }
    })
  }, [router])

  useEffect(() => {
    // Aplicar filtros
    let filtered = transactions

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // Filtro por mês
    if (monthFilter !== "all") {
      filtered = filtered.filter((t) => {
        const transactionMonth = new Date(t.date).getMonth()
        return transactionMonth === Number.parseInt(monthFilter)
      })
    }

    // Filtro por ano
    if (yearFilter !== "all") {
      filtered = filtered.filter((t) => {
        const transactionYear = new Date(t.date).getFullYear()
        return transactionYear === Number.parseInt(yearFilter)
      })
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, typeFilter, monthFilter, yearFilter])

  const handleDelete = (id: string) => {
    deleteTransaction(id).then(({ error }) => {
      if (!error) {
        setTransactions(transactions.filter((t) => t.id !== id))
        setFilteredTransactions(filteredTransactions.filter((t) => t.id !== id))
      }
    })
  }

  // Função para abrir modal de edição
  const handleEdit = async (id: string) => {
    setEditLoading(true)
    setIsEditModalOpen(true)
    const { data } = await getTransactionById(id)
    setEditTransaction(data)
    setEditLoading(false)
  }

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const years = Array.from(new Set(transactions.map((t) => new Date(t.date).getFullYear()))).sort((a, b) => b - a)

  // Função para atualizar as transações após adicionar uma nova
  const refreshTransactions = () => {
    const email = localStorage.getItem("userEmail")
    if (email) {
      getTransactions(email).then(({ data, error }) => {
        if (!error && data) {
          setTransactions(data)
          setFilteredTransactions(data)
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-black dark:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4 text-black dark:text-foreground">Transações</h1>
            </div>
            {/* Botão para abrir modal de nova transação */}
            <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
            {/* Modal de Nova Transação */}
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <AlertDialogContent className="max-w-lg w-full p-0">
                <TransactionForm
                  onSuccess={() => {
                    setIsModalOpen(false)
                    refreshTransactions()
                  }}
                  onCancel={() => setIsModalOpen(false)}
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tipo */}
              <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              {/* Mês */}
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ano */}
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transações ({filteredTransactions.length})
              <span className="ml-2 text-base font-normal text-gray-500">
                ({months[parseInt(monthFilter)]} {yearFilter})
              </span>
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length === 0
                ? "Nenhuma transação encontrada com os filtros aplicados."
                : `Mostrando ${filteredTransactions.length} transação${filteredTransactions.length !== 1 ? "ões" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-row items-center justify-between p-4 border rounded-xl shadow-sm bg-white dark:bg-card dark:border-border dark:shadow-lg"
                >
                  {/* Esquerda: Valor, ícone, badge, descrição, data */}
                  <div className="flex flex-col items-start flex-1">
                    <div className="flex items-center gap-2">
                      {transaction.type === "income" ? (
                        <ArrowUp className="h-5 w-5 text-[hsl(var(--income))]" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-[hsl(var(--expense))]" />
                      )}
                      <span className={`font-bold text-xl ${transaction.type === "income" ? "text-[hsl(var(--income))] dark:text-[hsl(var(--income))]" : "text-[hsl(var(--expense))] dark:text-[hsl(var(--expense))]"}`}>
                        {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <Badge
                        variant={transaction.type === "income" ? "default" : "destructive"}
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full shadow-sm ${transaction.type === "income" ? "bg-[hsl(var(--income)/0.15)] text-[hsl(var(--income))] dark:bg-[hsl(var(--income)/0.15)] dark:text-[hsl(var(--income))]" : "bg-[hsl(var(--expense)/0.15)] text-[hsl(var(--expense))] dark:bg-[hsl(var(--expense)/0.15)] dark:text-[hsl(var(--expense))]"}`}
                      >
                        {transaction.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-base text-black dark:text-white">{transaction.description}</p>
                      <span className="text-xs text-gray-500 dark:text-[#bbbbbb]">{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  {/* Direita: Botões de ação */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] dark:hover:text-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--primary)/0.15)]"
                      onClick={() => handleEdit(transaction.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-[hsl(var(--expense))] hover:bg-[hsl(var(--expense)/0.1)] dark:hover:text-[hsl(var(--expense))] dark:hover:bg-[hsl(var(--expense)/0.15)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-black dark:text-white">Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription className="text-black dark:text-[#bbbbbb]">
                            Tem certeza que deseja excluir esta transação? Essa ação não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-black dark:text-white">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)} className="bg-[hsl(var(--expense))] hover:bg-[hsl(var(--expense)/0.85)] text-white">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição de Transação */}
      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent className="max-w-lg w-full p-0">
          {editLoading || !editTransaction ? (
            <div className="p-8">Carregando...</div>
          ) : (
            <TransactionForm
              initialData={editTransaction}
              onSuccess={() => {
                setIsEditModalOpen(false)
                setEditTransaction(null)
                refreshTransactions()
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setEditTransaction(null)
              }}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
