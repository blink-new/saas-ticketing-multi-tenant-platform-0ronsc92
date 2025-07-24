export function getSubdomain(): string | null {
  const hostname = window.location.hostname
  
  // For development (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain in URL params for testing
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('subdomain')
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