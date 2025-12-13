declare module 'leaflet' {
  namespace Icon {
    interface Default {
      _getIconUrl?: () => string;
    }
  }
}