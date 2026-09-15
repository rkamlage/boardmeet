import React from 'react';
import { ACCESSORIES } from '../pages/Profile';
import { useStore } from '../context/StoreContext';

export default function Avatar({ userId, className, accessoryClassName = "top-[-20%]" }) {
  const { userProfiles } = useStore();
  const profile = userProfiles?.[userId] || {};
  const base = profile.avatarBase || '🧑';
  const accId = profile.accessory || 'none';
  const accObj = ACCESSORIES.find(a => a.id === accId) || {};

  return (
    <div className={`relative flex justify-center items-center bg-background rounded-full shadow-sm border border-slate-100 ${className}`}>
      {base}
      {accObj.icon && (
        <div className={`absolute z-10 drop-shadow-sm ${accessoryClassName} ${accObj.id === 'glasses' || accObj.id === 'sunglasses' ? '!top-[15%]' : ''}`}>
          {accObj.icon}
        </div>
      )}
    </div>
  );
}
