import React from 'react';

export const Skeleton = ({ className, width, height, circle }) => {
  return (
    <div 
      className={`skeleton ${className || ''}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px',
        borderRadius: circle ? '50%' : '12px'
      }} 
    />
  );
};

export const JobCardSkeleton = () => (
  <div className="glass p-5 rounded-2xl space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton width="48px" height="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height="24px" />
        <Skeleton width="40%" height="16px" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton width="80px" height="24px" />
      <Skeleton width="80px" height="24px" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton width="100px" height="20px" />
      <Skeleton width="30%" height="40px" />
    </div>
  </div>
);

export const WorkerCardSkeleton = () => (
  <div className="glass p-5 rounded-2xl space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton width="56px" height="56px" circle />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height="24px" />
        <Skeleton width="50%" height="16px" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton width="100%" height="16px" />
      <Skeleton width="90%" height="16px" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton width="70px" height="24px" />
      <Skeleton width="70px" height="24px" />
      <Skeleton width="70px" height="24px" />
    </div>
  </div>
);
