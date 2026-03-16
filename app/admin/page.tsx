import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "₦4,525,000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    value: "48",
    change: "+2",
    trend: "up",
    icon: Package,
  },
  {
    title: "Customers",
    value: "1,234",
    change: "+18.7%",
    trend: "up",
    icon: Users,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    product: "High Quality Leather Watch",
    amount: "₦45,000",
    status: "Completed",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    product: "Deep Onyx Classic",
    amount: "₦62,000",
    status: "Processing",
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    product: "Leather Ultramoden Watch",
    amount: "₦48,000",
    status: "Pending",
  },
  {
    id: "ORD-004",
    customer: "Sarah Williams",
    product: "High Godly Leather",
    amount: "₦125,000",
    status: "Completed",
  },
  {
    id: "ORD-005",
    customer: "David Brown",
    product: "Beep Onyx Edition",
    amount: "₦75,000",
    status: "Shipped",
  },
]

const topProducts = [
  { name: "High Quality Leather Watch", sales: 45, revenue: "₦2,025,000" },
  { name: "Deep Onyx Classic", sales: 38, revenue: "₦2,356,000" },
  { name: "High Godly Leather", sales: 22, revenue: "₦2,750,000" },
  { name: "Leather Ultramoden Watch", sales: 31, revenue: "₦1,488,000" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </div>
              <div className="flex items-center text-sm mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-card-foreground">
                      {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {order.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : order.status === "Shipped"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 py-2 border-b border-border last:border-0"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                  <p className="font-medium text-card-foreground">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
