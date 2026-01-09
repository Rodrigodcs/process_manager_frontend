import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-100">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

