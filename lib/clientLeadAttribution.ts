export type LeadAttribution = {
  sourcePath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export function getLeadAttribution(): LeadAttribution {
  if (typeof window === "undefined") {
    return {
      sourcePath: "",
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    sourcePath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  };
}
