import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { formatPrice } from '../../../utils/formatPrice';

const STATUS_COLORS = {
  'Order Accepted': '#3b82f6',
  'Processing': '#f59e0b',
  'Shipped': '#8b5cf6',
  'Delivered': '#10b981',
  'Cancelled': '#ef4444',
  'Returned': '#6b7280',
};
const FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#6b7280'];

const getStatusColor = (name, index) => STATUS_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}:</span>
          <span className="font-semibold">
            {entry.name === 'Revenue' ? formatPrice(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
    <h3 className="text-base font-semibold text-slate-700 mb-4">{title}</h3>
    {children}
  </div>
);

const DashboardCharts = ({ revenueOverTime, orderStatusData, recentOrders }) => {

  const formattedRevenue = revenueOverTime.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Trend + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Over Time - Area Chart */}
        <ChartCard title="Revenue & Orders Trend" className="lg:col-span-2">
          {formattedRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formattedRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="revenue" tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue"
                  stroke="#8b5cf6" fill="url(#revenueGradient)" strokeWidth={2} />
                <Area yAxisId="orders" type="monotone" dataKey="orders" name="Orders"
                  stroke="#3b82f6" fill="url(#ordersGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-75 flex items-center justify-center text-slate-400">
              No order data available
            </div>
          )}
        </ChartCard>

        {/* Order Status Distribution - Pie Chart */}
        <ChartCard title="Order Status">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={getStatusColor(entry.name, index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-75 flex items-center justify-center text-slate-400">
              No status data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Daily Revenue Bar Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Bar Chart */}
        <ChartCard title="Daily Revenue" className="lg:col-span-2">
          {formattedRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={formattedRevenue.slice(-14)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(value) => [formatPrice(value), 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-70 flex items-center justify-center text-slate-400">
              No revenue data available
            </div>
          )}
        </ChartCard>

        {/* Recent Orders */}
        <ChartCard title="Recent Orders">
          {recentOrders.length > 0 ? (
            <div className="space-y-3 max-h-70 overflow-y-auto pr-1">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between py-2 px-3 
                    bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {order.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700'
                        : order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-70 flex items-center justify-center text-slate-400">
              No recent orders
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardCharts;
