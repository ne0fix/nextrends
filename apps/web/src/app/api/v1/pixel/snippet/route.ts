export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = session.user.orgId;
  const endpoint = process.env.NEXT_PUBLIC_PIXEL_URL ?? 'https://pixel.nextface.app';

  const snippet = `<!-- NextFace Pixel -->
<script>
(function(w,d){
  w._nfq = w._nfq || [];
  w.nf = function(){w._nfq.push(arguments)};
  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://cdn.nextface.app/pixel.js';
  d.head.appendChild(s);
})(window, document);
nf('init', '${orgId}', { endpoint: '${endpoint}' });
nf('page_view');
</script>
<!-- End NextFace Pixel -->`;

  return NextResponse.json({ snippet, orgId });
}
