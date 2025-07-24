export function getSubdomain(): string | null {
  const hostname = window.location.hostname
  
  // For development (localhost) - check URL params first
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('preview-blink.com')) {
    const urlParams = new URLSearchParams(window.location.search)
    const subdomainParam = urlParams.get('subdomain')
    if (subdomainParam) {
      return subdomainParam
    }
    
    // Default to 'demo' for development if no param
    return 'demo'
  }
  
  // For production - extract subdomain
  const parts = hostname.split('.')
  if (parts.length > 2) {
    return parts[0]
  }
  
  return null
}

export function isMainDomain(): boolean {
  const subdomain = getSubdomain()
  return !subdomain || subdomain === 'www'
}