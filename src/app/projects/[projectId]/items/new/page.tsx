import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createItem } from "@/app/actions";
import { getProjectForUser } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function NewItemPage({ params }: { params: Promise<{ projectId: string }> }) {
  const current = await requireUser(); const { projectId } = await params; const book = await getProjectForUser(projectId, current.id); if (!book) notFound();
  return <AppShell userName={current.name}><header className="page-header"><div><Link className="back-link" href={`/projects/${projectId}`}><ArrowLeft size={14} />{book.name}</Link><h1>物品を登録</h1><p>支出額と使う期間を入力します</p></div></header><form action={createItem.bind(null, projectId)} className="item-form"><fieldset><legend>物品情報</legend><div className="form-grid"><label>名称<input name="name" required maxLength={120} placeholder="開発用ノートPC" /></label><label>種別<input name="category" required maxLength={60} placeholder="コンピューター" /></label><label>メーカー<input name="manufacturer" maxLength={80} placeholder="任意" /></label><label>型番<input name="modelNumber" maxLength={100} placeholder="任意" /></label></div></fieldset><fieldset><legend>償却条件</legend><div className="form-grid"><label>価格（税込・円）<input name="priceYen" required type="number" min="0" step="1" placeholder="300000" /></label><label>償却開始月<input name="amortizationStartMonth" required type="month" defaultValue={new Date().toISOString().slice(0,7)} /></label><label>耐用月数<input name="usefulLifeMonths" required type="number" min="1" max="1200" step="1" placeholder="36" /></label></div><p className="field-note">価格を指定月数で均等に割り、端数は先頭の月から1円ずつ加算します</p></fieldset><label>メモ<textarea name="note" maxLength={1000} rows={4} placeholder="用途や購入先など（任意）" /></label><div className="form-actions"><Link className="button button-secondary" href={`/projects/${projectId}`}>キャンセル</Link><button className="button button-primary">登録する</button></div></form></AppShell>;
}
