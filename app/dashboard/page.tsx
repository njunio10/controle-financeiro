"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Plus, List, LogOut, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { getTransactions } from '@/lib/transactionsApi'
import { useTheme } from "next-themes"
import { useEffect as useReactEffect, useState as useReactState } from "react"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
}

const COLORS = {
  income: "#10b981",
  expense: "#ef4444",
}

const CustomLegend = () => (
  <div style={{ display: 'flex', gap: 24, marginTop: 8, justifyContent: 'center' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: '#10b981', display: 'inline-block' }}></span>
      <span style={{ color: '#a1a1aa', fontSize: 14 }}>Receitas</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: '#ef4444', display: 'inline-block' }}></span>
      <span style={{ color: '#a1a1aa', fontSize: 14 }}>Despesas</span>
    </span>
  </div>
)

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useReactState(false)

  // Função para limpar dados antigos que contêm categorias
  const cleanOldData = (oldTransactions: any[]): Transaction[] => {
    return oldTransactions.map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      // Remove a propriedade category se existir
    }))
  }

  useReactEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Verificar autenticação
    const user = localStorage.getItem("user")
    const email = localStorage.getItem("userEmail")
    if (!user) {
      router.push("/")
      return
    }
    
    if (email) {
      setUserEmail(email)
      // Buscar transações do Supabase
      getTransactions(email).then(({ data, error }) => {
        if (!error && data) setTransactions(data)
      })
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  // Filtrar transações por mês/ano
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear
  })

  // Calcular totais
  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Dados para gráfico de pizza
  const pieData = [
    { name: "Receitas", value: totalIncome, color: COLORS.income },
    { name: "Despesas", value: totalExpenses, color: COLORS.expense },
  ]

  // Dados para gráfico de barras por tipo
  const typeData = [
    { type: "Receitas", value: totalIncome, color: COLORS.income },
    { type: "Despesas", value: totalExpenses, color: COLORS.expense },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0 w-full">
            {/* Esquerda: Logo e saudação */}
            <div className="flex items-center min-w-0">
              <DollarSign className="h-8 w-8 text-primary mr-2" />
              <div className="truncate">
                <h1 className="text-xl font-semibold text-foreground truncate">
                  <span className="inline sm:hidden">Financeiro</span>
                  <span className="hidden sm:inline">Controle Financeiro</span>
                </h1>
                {userEmail && (
                  <p className="text-sm text-foreground flex items-center gap-2 truncate">
                    {userEmail === "natanaelfinanceiro@gmail.com"
                      ? "Olá, Natan Junio!"
                      : userEmail === "karem.6@gmail.com"
                      ? "Olá, Karem Cristina!"
                      : userEmail === "teste@gmail.com"
                      ? "Olá, Teste!"
                      : null}
                      
                    <button
                      aria-label="Alternar tema"
                      className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      {theme === "dark" ? (
                        <Moon className="h-5 w-5 text-zinc-100" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-400" />
                      )}
                    </button>
                  </p>
                )}
              </div>
            </div>
            {/* Direita: Botões */}
            <div className="flex flex-row items-center space-x-2 sm:space-x-4 ml-auto">
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-black dark:text-foreground">
                  <List className="h-4 w-4 mr-2" />
                  Transações
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full sm:w-auto text-black dark:text-foreground flex items-center justify-center">
                <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}>
            <SelectTrigger className="w-full sm:w-48 text-black dark:text-foreground">
              <SelectValue placeholder="Selecione o mês" className="text-black dark:text-foreground" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <SelectTrigger className="w-full sm:w-32 text-black dark:text-foreground">
              <SelectValue placeholder="Ano" className="text-black dark:text-foreground" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-[hsl(var(--income))]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--income))]">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-[hsl(var(--expense))]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--expense))]">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className={`h-4 w-4 ${balance >= 0 ? "text-[hsl(var(--income))]" : "text-[hsl(var(--expense))]"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? "text-[hsl(var(--income))]" : "text-[hsl(var(--expense))]"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <List className="h-4 w-4 text-[hsl(var(--primary))]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--primary))]">{filteredTransactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>
                Distribuição do mês de {months[selectedMonth]} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[320px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={isMobile ? false : ({ name, value }) => `${name}: R$ ${value?.toLocaleString("pt-BR") || "0"}`}
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-900 text-white rounded-lg px-4 py-2 shadow-lg border border-zinc-700">
                              <div className="font-semibold mb-1">Resumo</div>
                              {payload.map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span style={{ width: 12, height: 12, borderRadius: 6, background: entry.color, display: 'inline-block' }}></span>
                                  <span>{entry.name}:</span>
                                  <span className="font-bold ml-1">R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <CustomLegend />
                  </PieChart>
                </ResponsiveContainer>
                {/* Resumo mobile */}
                {isMobile && (
                  <div className="flex flex-col items-center gap-2 mt-4 sm:hidden">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.income }}></span>
                      <span className="font-medium">Receitas:</span>
                      <span className="font-bold text-[hsl(var(--income))]">R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.expense }}></span>
                      <span className="font-medium">Despesas:</span>
                      <span className="font-bold text-[hsl(var(--expense))]">R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas e Despesas</CardTitle>
              <CardDescription>Comparação por tipo de transação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Total', Receitas: totalIncome, Despesas: totalExpenses }]}> 
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 14, fontWeight: 500 }} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 14 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-zinc-900 text-white rounded-lg px-4 py-2 shadow-lg border border-zinc-700">
                            <div className="font-semibold mb-1">Resumo</div>
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span style={{ width: 12, height: 12, borderRadius: 6, background: entry.color, display: 'inline-block' }}></span>
                                <span>{entry.name}:</span>
                                <span className="font-bold ml-1">R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <CustomLegend />
                  <Bar dataKey="Receitas" fill="#10b981" name="Receitas" radius={[8, 8, 0, 0]}>
                    <LabelList 
                      dataKey="Receitas" 
                      position="insideTop"
                      formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      className="label-bar label-bar-receita"
                    />
                  </Bar>
                  <Bar dataKey="Despesas" fill="#ef4444" name="Despesas" radius={[8, 8, 0, 0]}>
                    <LabelList 
                      dataKey="Despesas" 
                      position="insideTop"
                      formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      className="label-bar label-bar-despesa"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações do Mês</CardTitle>
            <CardDescription>Transações de {months[selectedMonth]} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-5 w-5 text-[hsl(var(--income))]" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-[hsl(var(--expense))]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <p className="text-sm text-foreground">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold ${transaction.type === "income" ? "text-[hsl(var(--income))]" : "text-[hsl(var(--expense))]"}`}>
                        {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-black py-8">Nenhuma transação encontrada para este período.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
