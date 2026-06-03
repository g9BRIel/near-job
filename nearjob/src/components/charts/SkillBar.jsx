const SkillBar = ({ skill, demand }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-white">{skill}</span>
      <span className="text-blue-400">{demand}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
        style={{ width: `${demand}%` }} 
      />
    </div>
  </div>
);

export default SkillBar;