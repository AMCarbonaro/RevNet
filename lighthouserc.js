module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/letters',
        'http://localhost:3000/projects',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/admin',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'error',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'hreflang': 'error',
        
        // PWA
        'service-worker': 'error',
        'installable-manifest': 'error',
        'splash-screen': 'error',
        'themed-omnibox': 'error',
        'viewport': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
