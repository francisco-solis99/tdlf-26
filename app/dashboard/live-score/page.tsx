import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JuezPartido } from "@/components/dashboard/juez-partido";
import { requireAdmin } from "@/lib/actions/auth";
import { getScoringMatch, type ScoringMatch } from "@/lib/actions/torneo";

export const metadata: Metadata = {
  title: "Juzgar partido — Panel TDLF 2026",
  description: "Marcador en vivo y registro del resultado.",
};

export default async function DashboardLiveScorePage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  await requireAdmin();
  const { match: matchId } = await searchParams;

  if (!matchId) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card className="mt-8 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Sin partido seleccionado
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Elige un partido desde la tabla de partidos para juzgarlo.
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/dashboard/partidos">Ir a partidos</Link>
          </Button>
        </Card>
      </div>
    );
  }

  let scoring: ScoringMatch | null = null;
  try {
    scoring = await getScoringMatch(matchId);
  } catch {
    scoring = null;
  }

  if (!scoring) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card className="mt-8 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Partido no encontrado
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            El partido no existe o fue eliminado. Elige otro desde la tabla.
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/dashboard/partidos">Ir a partidos</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <JuezPartido scoring={scoring} />
    </div>
  );
}
