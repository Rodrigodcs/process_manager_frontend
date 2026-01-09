interface ActivityChartProps {
  recentActivity: {
    processesCreatedLast7Days: number;
    processesCreatedLast30Days: number;
    departmentsCreatedLast30Days: number;
  };
}

export default function ActivityChart({ recentActivity }: ActivityChartProps) {
  const activities = [
    {
      label: 'Processos (7 dias)',
      value: recentActivity.processesCreatedLast7Days,
      color: 'bg-green-500',
      icon: '📊',
    },
    {
      label: 'Processos (30 dias)',
      value: recentActivity.processesCreatedLast30Days,
      color: 'bg-blue-500',
      icon: '📈',
    },
    {
      label: 'Departamentos (30 dias)',
      value: recentActivity.departmentsCreatedLast30Days,
      color: 'bg-purple-500',
      icon: '📁',
    },
  ];

  const maxValue = Math.max(...activities.map(a => a.value), 1);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-6">Atividade Recente</h3>
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const percentage = (activity.value / maxValue) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activity.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{activity.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-100">{activity.value}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`${activity.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

