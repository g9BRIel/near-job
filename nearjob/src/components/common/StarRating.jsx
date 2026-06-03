import { useState } from 'react';
import { Star } from 'lucide-react';
import { API_BASE, authHeaders } from '../../utils/api';

const StarRating = ({ toId, toType, initialRating = 0, onRated }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleRate = async (stars) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/rate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          toId,
          toType,
          stars
        })
      });
      if (res.ok) {
        setRating(stars);
        onRated?.(stars);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={busy}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-all duration-200 ${busy ? 'cursor-wait' : 'cursor-pointer hover:scale-125'}`}
        >
          <Star
            className={`w-5 h-5 ${
              (hover || rating) >= star
                ? 'fill-yellow-500 text-yellow-500 shadow-yellow-500/50'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
      <span className="text-xs text-gray-400 ml-2 font-medium">
        {rating > 0 ? `${rating} Stars` : 'Rate Now'}
      </span>
    </div>
  );
};

export default StarRating;
