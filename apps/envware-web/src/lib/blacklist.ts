export const BLACKLISTED_TEAMS = [
  "google", "ibm", "microsoft", "gitlab", "github", "amazon", "aws", "facebook", "meta", 
  "apple", "netflix", "openai", "anthropic", "twitter", "x", "tesla", "spacex", "uber", 
  "airbnb", "spotify", "adobe", "oracle", "sap", "salesforce", "intel", "nvidia", 
  "amd", "cisco", "vmware", "digitalocean", "vercel", "netlify", "heroku", "cloudflare",
  "envware", "admin", "support", "billing", "api", "dev", "prod", "test"
];

export function isBlacklisted(slug: string): boolean {
  return BLACKLISTED_TEAMS.includes(slug.toLowerCase());
}
