import { logoKind } from '../../utils/api';

const NearbyItem = ({ job }) => {
  const loc = job.location || '';
  const sub = loc.includes(',') ? loc.split(',').slice(1).join(',').trim() : loc;
  const logo = job.logo;
  const isUrl = logoKind(logo) === 'url';

  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4 card-hover">
      {isUrl ? (
        <img src={logo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="text-2xl shrink-0">{logo || '💼'}</div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm truncate">{job.title}</h4>
        <p className="text-gray-400 text-xs truncate">{job.company}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-green-400 text-sm font-medium truncate max-w-[7rem]">{sub || 'Nearby'}</p>
        <span className="text-xs text-gray-500">{job.posted}</span>
      </div>
    </div>
  );
};

export default NearbyItem;
