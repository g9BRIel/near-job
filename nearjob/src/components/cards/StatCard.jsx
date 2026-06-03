const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="glass rounded-2xl p-6 card-hover">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className="w-5 h-5 text-main" />
      </div>
      <span className="text-green-400 text-sm font-medium">{change}</span>
    </div>
    <h3 className="text-2xl font-bold text-main mb-1">{value}</h3>
    <p className="text-muted text-sm">{title}</p>
  </div>
);

export default StatCard;