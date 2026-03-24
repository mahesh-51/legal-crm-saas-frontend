import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
}: DashboardCardProps) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% vs last month
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
