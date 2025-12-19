import L from 'leaflet';

// Initialize leaflet icons with proper error handling
export const initializeLeafletIcons = (): void => {
  try {
    // Clear existing icon configuration
    if (L.Icon.Default.prototype._getIconUrl) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
    }

    // Set up icon URLs
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (error) {
    console.warn('Failed to initialize leaflet icons:', error);
  }
};

// Initialize icons immediately when module loads
initializeLeafletIcons();