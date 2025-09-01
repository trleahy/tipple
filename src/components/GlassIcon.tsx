interface GlassIconProps {
  glassType: string;
  className?: string;
}

const GlassIcon = ({ glassType, className = "w-6 h-6" }: GlassIconProps) => {
  const getGlassIcon = (type: string) => {
    switch (type) {
      case 'highball':
        return (
          <svg className={className} viewBox="0 0 50 80" stroke="black" fill="none" stroke-width="5">
           <rect x="10" y="5" width="30" height="70" rx="2" ry="2"/>
          </svg>
        );
      case 'rocks':
        return (
          <svg className={className} viewBox="0 0 50 50" stroke="black" fill="none" stroke-width="5">
            <path d="M10 5 H40 L35 40 H15 Z"/>
          </svg>
        );
      case 'martini':
        return (
          <svg className={className} viewBox="0 0 50 80" stroke="black" fill="none" stroke-width="5">
            <path d="M5 5 L25 35 L45 5"/>
            <line x1="25" y1="35" x2="25" y2="75"/>
          </svg>

        );
      case 'coupe':
        return (
          <svg className={className} viewBox="0 0 50 60" stroke="black" fill="none" stroke-width="5">
            <path d="M10 10 Q25 30 40 10"/>
            <line x1="25" y1="30" x2="25" y2="55"/>
          </svg>
        );
      case 'collins':
        return (
          // <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          //   <path d="M7 2h10v20H7V2zm1 1v18h8V3H8z" />
          // </svg>
          <svg className={className} viewBox="0 0 50 100" stroke="black" fill="none" stroke-width="5">
            <rect x="12" y="5" width="26" height="90" rx="2" ry="2"/>
          </svg>
        );
      case 'shot':
        return (
          <svg className={className} viewBox="0 0 50 50" stroke="black" fill="none" stroke-width="5">
            <path d="M15 5 H35 L30 40 H20 Z"/>
          </svg>
        );
      default:
        return (
          <svg className={className} viewBox="0 0 50 60" stroke="black" fill="none" stroke-width="5">
            <path d="M5 5 L25 25 L45 5"/>
            <line x1="25" y1="25" x2="25" y2="55"/>
          </svg>
        );
    }
  };

  return getGlassIcon(glassType);
};

export default GlassIcon;
