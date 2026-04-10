import React, { useEffect, useMemo } from 'react'
import DashboardOverview from './DashboardOverview'
import DashboardCharts from './DashboardCharts'
import { FaBoxOpen, FaDollarSign, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../../store/actions';
import Loader from '../../shared/Loader';
import ErrorPage from '../../shared/ErrorPage';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const {
    analytics: { productCount, totalRevenue, totalOrders },
    dashboardOrders,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const avgOrderValue = useMemo(() => {
    if (!totalRevenue || !totalOrders) return 0;
    return (totalRevenue / totalOrders).toFixed(2);
  }, [totalRevenue, totalOrders]);

  const orderStatusData = useMemo(() => {
    if (!dashboardOrders?.length) return [];
    const counts = {};
    dashboardOrders.forEach((order) => {
      const status = order.orderStatus || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dashboardOrders]);

  const revenueOverTime = useMemo(() => {
    if (!dashboardOrders?.length) return [];
    const grouped = {};
    dashboardOrders.forEach((order) => {
      const date = order.orderDate?.split('T')[0] || 'Unknown';
      if (!grouped[date]) grouped[date] = { date, revenue: 0, orders: 0 };
      grouped[date].revenue += order.totalAmount || 0;
      grouped[date].orders += 1;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [dashboardOrders]);

  const recentOrders = useMemo(() => {
    if (!dashboardOrders?.length) return [];
    return dashboardOrders.slice(0, 8);
  }, [dashboardOrders]);

  if (isLoading) {
    return <Loader />
  }

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <div className='space-y-6 pb-8'>
      {/* Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
        <DashboardOverview
          title="Total Products"
          amount={productCount}
          Icon={FaBoxOpen}
          color="blue"
        />
        <DashboardOverview
          title="Total Orders"
          amount={totalOrders}
          Icon={FaShoppingCart}
          color="green"
        />
        <DashboardOverview
          title="Total Revenue"
          amount={totalRevenue}
          Icon={FaDollarSign}
          revenue
          color="purple"
        />
        <DashboardOverview
          title="Avg Order Value"
          amount={avgOrderValue}
          Icon={FaChartLine}
          revenue
          color="amber"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        revenueOverTime={revenueOverTime}
        orderStatusData={orderStatusData}
        recentOrders={recentOrders}
      />
    </div>
  )
}

export default Dashboard