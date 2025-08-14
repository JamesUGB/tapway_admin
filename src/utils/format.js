export const formatShortId = (id) => id.slice(0, 8);

export const formatLocation = (location) => {
  if (!location) return 'Unknown location';
  
  if (location.address?.formatted) return location.address.formatted;
  if (location.address?.street) {
    return [
      location.address.street,
      location.address.barangay,
      location.address.city,
      location.address.province
    ].filter(Boolean).join(', ');
  }
  if (location.coordinates) {
    return `${location.coordinates.lat?.toFixed(4)}, ${location.coordinates.lng?.toFixed(4)}`;
  }
  return 'Unknown location';
};