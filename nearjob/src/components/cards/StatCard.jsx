const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 card-hover">
    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
      <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl ${color} bg-opacity-20`}>
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-main" />
      </div>
      <span className="text-green-400 text-[10px] sm:text-xs md:text-sm font-medium">{change}</span>
    </div>
    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-main mb-0.5 sm:mb-1">{value}</h3>
    <p className="text-muted text-[10px] sm:text-xs md:text-sm">{title}</p>
  </div>
);

export default StatCard;