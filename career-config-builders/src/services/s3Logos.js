// Mock del endpoint GET /api/assets que en producción consultará la Lambda.
// Para migrar a la API real, reemplazar el cuerpo de fetchAssets() por:
//   const res = await fetch(`/api/assets?type=${type}`);
//   return res.json();

const MOCK_ASSETS = {
  logo: [
    {
      key: "logos/tiendas3b-logo.png",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/tiendas3b-logo.png",
      name: "Tiendas 3B",
    },
    {
      key: "logos/cmr-logo.png",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/cmr-logo.png",
      name: "CMR",
    },
    {
      key: "logos/DOÑATOTA_LOGOTIPO_03.png",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/DON%CC%83ATOTA_LOGOTIPO_03.png",
      name: "Doña Tota",
    },
  ],
  banner_desktop: [
    {
      key: "logos/Grupo-Cinemex-Banner-Career.jpg",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/Grupo-Cinemex-Banner-Career.jpg",
      name: "Cinemex",
    },
    {
      key: "logos/BannerDesktopDonaTota5.png",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/BannerDesktopDonaTota5.png",
      name: "Doña Tota Desktop",
    },
  ],
  banner_mobile: [
    {
      key: "logos/BannerMobileDonaTota.jpg.jpg",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/BannerMobileDonaTota.jpg.jpg",
      name: "Doña Tota Mobile",
    },
    {
      key: "logos/Grupo-Cinemex-Mobile-Banner-Referral.jpg",
      url: "https://emi-public.s3.us-east-1.amazonaws.com/logos/Grupo-Cinemex-Mobile-Banner-Referral.jpg",
      name: "Cinemex Mobile",
    },
  ],
};

export async function fetchAssets(type) {
  // Simula latencia de red (~300ms)
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_ASSETS[type] ?? [];
}
