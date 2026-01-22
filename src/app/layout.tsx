import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";
import InstagramSection from "@/components/InstagramSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";
import { Suspense } from "react";
import VisitNotifier from "@/components/VisitNotifier";
import { AdminRouteCheck, PublicRouteOnly, AdminRouteOnly, CheckoutRouteOnly } from "@/components/AdminRouteCheck";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Revibee - Everything You Want, One Marketplace.",
  description: "Shop millions of products at Revibee: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
  keywords: "Revibee, online marketplace, general store, electronics, fashion, home, collectibles, toys, beauty, gadgets, deals, shopping, eBay alternative, secure checkout, fast shipping",
  authors: [{ name: "Revibee" }],
  creator: "Revibee",
  publisher: "Revibee",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://revibee.com"),
  openGraph: {
    title: "Revibee - Everything You Want, One Marketplace.",
    description: "Shop millions of products at Revibee: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
    url: "https://revibee.com",
    siteName: "Revibee",
    images: [
      {
        url: "/g7x.webp",
        width: 1200,
        height: 630,
        alt: "Revibee - Online Marketplace for Everything",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revibee - Everything You Want, One Marketplace.",
    description: "Shop millions of products at Revibee: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
    images: ["/g7x.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "aGkqoI_eCG0h2qF377pXezPaxovx1V-MeOiyeYD5Ngg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${nunito.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preload" href="/logosvg.svg" as="image" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning className={nunito.className}>
        <PublicRouteOnly>
          <VisitNotifier />
        </PublicRouteOnly>
        {/* Organization Schema */}
        <AdminRouteCheck>
          <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Revibee",
                "url": "https://revibee.com",
                "logo": "https://revibee.com/logosvg.svg",
                "description": "Revibee - Where Savings Make You Smile. Discover premium cameras and photography equipment at unbeatable prices.",
                "sameAs": [
                  "https://twitter.com/revibee",
                  "https://facebook.com/revibee",
                  "https://instagram.com/revibee"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "email": "support@revibee.com"
                },
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "1420 N McKinley Ave",
                  "addressLocality": "Los Angeles",
                  "addressRegion": "CA",
                  "postalCode": "90059",
                  "addressCountry": "US"
                }
              })
            }}
          />
        </AdminRouteCheck>
        
        {/* WebSite Schema */}
        <AdminRouteCheck>
          <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Revibee",
                "url": "https://revibee.com",
                "description": "Revibee - Where Savings Make You Smile. Discover premium cameras and photography equipment at unbeatable prices.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://revibee.com/api/products/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </AdminRouteCheck>
        
        <ErrorBoundaryWrapper>
          {/* Public website with header, footer, etc. */}
          <PublicRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
              <InstagramSection />
              <NewsletterSection />
              <Footer />
            </div>
            <CookieConsent />
          </PublicRouteOnly>
          
          {/* Checkout page - navbar only, no distractions */}
          <CheckoutRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </CheckoutRouteOnly>
          
          {/* Admin dashboard - clean, no public UI */}
          <AdminRouteOnly>
            {children}
          </AdminRouteOnly>
        </ErrorBoundaryWrapper>
        
        {/* Tidio Live Chat Widget */}
        <AdminRouteCheck>
          <Script
            src="//code.tidio.co/rrmdlivlmklslybfoqtqf6ycyuwexz63.js"
            async
          />
        </AdminRouteCheck>
        <AdminRouteCheck>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-6ELCP7YFYP"
            strategy="afterInteractive"
            async
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-6ELCP7YFYP');
              `,
            }}
          />
        </AdminRouteCheck>
        {/* Google Ads Conversion Tracking */}
        <AdminRouteCheck>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17682444096"
            strategy="afterInteractive"
            async
          />
          <Script
            id="google-ads-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17682444096');
              `,
            }}
          />
        </AdminRouteCheck>
      </body>
    </html>
  );
}
