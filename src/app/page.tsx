import { BarChart3, CalendarRange, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { getSession } from "@/lib/session";

export default async function Home() {
  if (await getSession()) redirect("/projects");
  return <main className="landing"><section className="landing-copy"><div className="wordmark"><span className="brand-mark">月</span><span>月割</span></div><div className="landing-message"><p className="kicker">支出を、使う時間に割り戻す</p><h1>買った月ではなく<br />使う月で考える</h1><p className="lead">物品の価格と利用期間を登録すると、月々の負担額が見える共同帳簿です</p></div><div className="feature-lines"><div><CalendarRange size={20} /><span><strong>月単位で正確に按分</strong>1円の端数まで元の価格と一致</span></div><div><Users size={20} /><span><strong>同じ帳簿を共有</strong>プロジェクトごとにメンバーを管理</span></div><div><BarChart3 size={20} /><span><strong>今月の負担を一覧</strong>物品ごとの内訳をその場で確認</span></div></div></section><section className="landing-auth" aria-label="ログインと新規登録"><div className="ledger-preview" aria-hidden="true"><div className="ledger-head"><span>2026年 11月</span><strong>¥48,611</strong></div><div className="ledger-row"><span>開発用ノートPC</span><span className="depreciation-line"><i style={{width:"72%"}} /></span><b>¥27,778</b></div><div className="ledger-row"><span>オフィスチェア</span><span className="depreciation-line"><i style={{width:"44%"}} /></span><b>¥12,500</b></div><div className="ledger-row"><span>ディスプレイ</span><span className="depreciation-line"><i style={{width:"26%"}} /></span><b>¥8,333</b></div></div><AuthPanel /></section></main>;
}
