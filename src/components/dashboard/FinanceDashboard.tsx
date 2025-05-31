"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Users, TrendingUp, Search, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";

// Mock data
const financialOverview = {
  totalRevenue: 1250000,
  outstandingPayments: 75000,
  recentTransactions: 15,
  currency: 'USD',
};

const recentPayments = [
  { id: 'PAY001', student: 'Alice Smith', amount: 500, date: '2024-07-20', status: 'Completed' },
  { id: 'PAY002', student: 'Bob Johnson', amount: 750, date: '2024-07-19', status: 'Completed' },
  { id: 'PAY003', student: 'Carol Williams', amount: 300, date: '2024-07-19', status: 'Pending' },
];

export function FinanceDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Total Revenue (This Term)</CardDescription>
          <CardTitle className="text-4xl">{financialOverview.currency} {financialOverview.totalRevenue.toLocaleString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">+15% from last term</p>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Outstanding Payments</CardDescription>
          <CardTitle className="text-4xl text-destructive">{financialOverview.currency} {financialOverview.outstandingPayments.toLocaleString()}</CardTitle>
        </CardHeader>
         <CardContent>
          <p className="text-xs text-muted-foreground">Across 32 students</p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Recent Transactions (24h)</CardDescription>
          <CardTitle className="text-4xl">{financialOverview.recentTransactions}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Totaling {financialOverview.currency} 12,350</p>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-1 bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary-foreground/80">Quick Actions</CardDescription>
          <CardTitle className="text-2xl">Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" size="sm" className="w-full" asChild>
            <Link href="/dashboard/finance/reports/new">
                <FileText className="mr-2 h-4 w-4"/> New Financial Report
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Recent Payment Records</CardTitle>
              <CardDescription>Latest student payments and statuses.</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input placeholder="Search payments..." className="max-w-xs w-full sm:w-auto" />
              <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">ID</th>
                  <th className="text-left p-2 font-semibold">Student</th>
                  <th className="text-left p-2 font-semibold">Amount</th>
                  <th className="text-left p-2 font-semibold">Date</th>
                  <th className="text-left p-2 font-semibold">Status</th>
                  <th className="text-left p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-secondary/20">
                    <td className="p-2">{payment.id}</td>
                    <td className="p-2">{payment.student}</td>
                    <td className="p-2">{financialOverview.currency} {payment.amount.toFixed(2)}</td>
                    <td className="p-2">{payment.date}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                        <Link href={`/dashboard/finance/payments/${payment.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           <Button variant="outline" className="mt-4 w-full" asChild>
            <Link href="/dashboard/finance/payments">View All Payments</Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary"/>Financial Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src="https://placehold.co/800x300.png" alt="Financial Trends Chart" width={800} height={300} className="rounded-md" data-ai-hint="finance chart graph"/>
          <p className="text-sm text-muted-foreground mt-2">Chart displaying revenue, expenses, and payment statuses over time.</p>
        </CardContent>
      </Card>
    </div>
  );
}
