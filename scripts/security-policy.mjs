// GitHub Pages serves static files, so this policy is emitted in HTML.
// Script execution is restricted to our bundle and the two analytics providers.
// React's dynamic styles need style-src unsafe-inline; scripts do not.
export const contentSecurityPolicy=[
 "default-src 'self'",
 "script-src 'self' https://cloud.umami.is https://www.googletagmanager.com",
 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
 "font-src 'self' https://fonts.gstatic.com",
 "img-src 'self' data: blob: https://i.pinimg.com https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com",
 "media-src 'self' blob:",
 "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com",
 "frame-src https://ads-partners.coupang.com https://www.youtube.com https://www.youtube-nocookie.com",
 "worker-src 'self' blob:",
 "object-src 'none'",
 "base-uri 'none'",
 "form-action 'self'"
].join('; ');
