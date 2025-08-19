// Renders Sanity Studio at /studio and all its subroutes.

import { Studio } from 'sanity';

// Try alias first; if it fails, use the fallback relative import.
import config from '../../../../../sanity.config';

export default function StudioPage() {
  return <Studio config={config} />;
}
