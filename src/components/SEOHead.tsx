import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEOHead: React.FC<SEOProps> = ({
  title = "Sarthi Solutions | Recruitment & Advisory Services",
  description = "Sarthi Solutions - Connecting Talent With Opportunity. Top recruitment consultancy in Gujarat and Silvassa specializing in Manufacturing, Elevator Engineering, IT, HR & Executive Search.",
  keywords = "Sarthi Solutions, recruitment agency Surat, job consultancy Silvassa, Raajesh V, assistant factory manager jobs, elevator component manufacturing jobs, manufacturing recruitment, Gujarat HR advisory"
}) => {
  useEffect(() => {
    document.title = title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Schema.org structured data for Organization & Recruitment Business
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RecruitmentAgency",
      "name": "Sarthi Solutions",
      "alternateName": "Sarthi Solutions Recruitment & Advisory",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.png`,
      "slogan": "Connecting Talent With Opportunity",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+919824322206",
        "contactType": "Recruitment & Advisory Helpline",
        "contactOption": "TollFree",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi", "Gujarati"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bhestan Udhna Road / Ring Road",
        "addressLocality": "Surat",
        "addressRegion": "Gujarat",
        "addressCountry": "IN"
      }
    };

    let scriptTag = document.getElementById('jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  }, [title, description, keywords]);

  return null;
};
