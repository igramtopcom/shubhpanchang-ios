import { TabStack } from '@/components/tab-stack';

// Today has no title in the bar: the place and the date lead the page.
export default function Layout() {
  return <TabStack title={s => s.tabToday} large={false} />;
}
