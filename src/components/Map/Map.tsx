import * as React from 'react';
import './Map.scss';

interface MapProps {
  mapImage: string;  // Just the filename, e.g. "field1.jpg"
}

const Map: React.FC<MapProps> = ({ mapImage }) => {
  // Construct the proper public URL for the image
  const imageUrl = `maps/${mapImage}`;

  return (
    <div className="map-wrapper">
      <div className="map-container">
        <img 
          src={imageUrl} 
          alt="Field Map" 
          className="map-image"
          onError={(e) => {
            console.log(e)
          }}
        />
        
        {/* X-axis labels */}
        <div className="x-axis">
          {[...Array(13)].map((_, i) => (
            <span key={`x-${i}`} className="axis-label" style={{ left: `${i * 8.33}%` }}>
              {i * 12}
            </span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="y-axis">
          {[...Array(13)].map((_, i) => (
            <span key={`y-${i}`} className="axis-label" style={{ bottom: `${i * 8.33}%` }}>
              {i * 12}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;