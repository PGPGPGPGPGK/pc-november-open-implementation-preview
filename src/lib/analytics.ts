// Explicit no-op adapter: analytics, pixels and customer tracking are disabled.
export function readUtm(){return undefined;}
export function track(..._args:unknown[]){}
