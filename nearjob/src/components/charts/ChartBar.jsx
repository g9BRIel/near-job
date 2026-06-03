const ChartBar = ({ height, label, active }) => (
  <div className="flex flex-col items-center flex-1">
    <div className="w-full bg-white/10 rounded-t-lg relative h-32 mb-2">
      <div 
        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ${active ? 'bg-gradient-to-t from-blue-600 to-purple-500' : 'bg-white/20'}`}
        style={{ height: `${height}%` }}
      />
    </div>
    <span className="text-xs text-muted font-medium">{label}</span>
  </div>
);

export default ChartBar;