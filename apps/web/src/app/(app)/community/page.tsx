export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function CommunityPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? '';
  const groups = await prisma.communityGroup.findMany({ where: { orgId }, orderBy: { qualityScore: 'desc' } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Comunidade</h1>
      <p className="text-gray-500 text-sm mb-6">Grupos e comunidades mapeados</p>
      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">Nenhum grupo mapeado ainda</p>
          <p className="text-sm mt-1">Integre suas contas Meta e Telegram para mapear grupos automaticamente.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-gray-500">{g.provider} · {g.status}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(g.qualityScore).toFixed(1)}</p>
                <p className="text-xs text-gray-400">qualidade</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
