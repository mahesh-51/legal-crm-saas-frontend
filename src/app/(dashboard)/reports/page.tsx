"use client";

import { BarChart3, FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice metrics, matter profitability, and utilization
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="matters">Matters</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$124,500</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium">Active Matters</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">3 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium">Billable Hours</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Revenue Chart</h3>
              <p className="text-sm text-muted-foreground">
                Chart visualization would go here. Integrate with Chart.js or Recharts.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                Revenue chart placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Revenue Report</h3>
              <p className="text-sm text-muted-foreground">
                Export and analyze revenue data
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                Revenue report content
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="matters">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Matter Report</h3>
              <p className="text-sm text-muted-foreground">
                Overview of matter status and distribution
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                Matter report content
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
