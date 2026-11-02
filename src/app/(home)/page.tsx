import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export default function HomePage() {
  return <SitePage data={pageData.home} />;
}
