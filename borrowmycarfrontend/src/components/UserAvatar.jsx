import React, { useState } from 'react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showImage = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Take first letter of first name and first letter of last name
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'md':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-base';
      case 'xl':
        return 'w-16 h-16 text-lg';
      default:
        return 'w-8 h-8 text-sm';
    }
  };

  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-orange-500', 
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const userName = user?.name || user?.username || '';
  const profileImage = user?.profileImage || user?.avatar;

  // Always use img tag with UI Avatars as fallback for consistency
  const getAvatarSize = () => {
    switch (size) {
      case 'sm':
        return 48;
      case 'md':
        return 64;
      case 'lg':
        return 96;
      case 'xl':
        return 128;
      default:
        return 64;
    }
  };

  const avatarUrl = profileImage && !imageError 
    ? profileImage 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=10b981&color=ffffff&size=${getAvatarSize()}`;

  return (
    <img 
      src={avatarUrl} 
      alt={userName || 'User'}
      className={`${getSizeClasses()} rounded-full object-cover ${className}`}
      onError={(e) => {
        if (profileImage && !imageError) {
          // If custom image fails, fall back to UI Avatars
          setImageError(true);
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=10b981&color=ffffff&size=${getAvatarSize()}`;
        }
      }}
    />
  );
};

export default UserAvatar;