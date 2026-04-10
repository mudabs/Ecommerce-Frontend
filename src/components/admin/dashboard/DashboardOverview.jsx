import React from 'react'
import { formatRevenue } from '../../../utils/formatPrice';

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-500', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600' },
};

const DashboardOverview = ({ title, amount, Icon, revenue = false, color = 'blue' }) => {
  const convertedAmount = revenue ? Number(amount).toFixed(2) : amount;
  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`${scheme.bg} rounded-xl p-5 shadow-sm border border-slate-200 
        hover:shadow-md transition-shadow duration-200`}>
      <div className='flex items-center gap-3 mb-3'>
        <div className={`${scheme.icon} p-2.5 rounded-lg`}>
          <Icon className='text-white text-lg' />
        </div>
        <h3 className='text-sm font-medium text-slate-500 uppercase tracking-wide'>{title}</h3>
      </div>
      <h1 className={`font-bold text-2xl ${scheme.text}`}>
        {revenue ? "$" : null}
        {revenue ? formatRevenue(convertedAmount) : convertedAmount}
      </h1>
    </div>
  )
}

export default DashboardOverview