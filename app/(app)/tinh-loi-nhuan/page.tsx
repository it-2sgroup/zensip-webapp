"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Label,
  Segmented,
  SelectField,
  Switch,
  TextField,
  cx,
} from "@/components/ui/primitives";
import { fmtInt, fmtNum, fmtPct, fmtVnd, parseMoney } from "@/lib/format";
import {
  DEFAULT_INPUT,
  DEFAULT_RATE,
  FEE_TREE,
  applyNewSellerDiscount,
  baseRate,
  calcProfit,
  type ShopType,
} from "@/lib/profit";

const S = {
  cost: "var(--color-s6)",
  ops: "var(--color-s3)",
  mkt: "var(--color-s5)",
  comm: "var(--color-s8)",
  txn: "var(--color-s7)",
  order: "var(--color-axis)",
  extra: "var(--color-s1)",
  profit: "var(--color-good)",
};

export default function ProfitPage() {
  const [shopType, setShopType] = useState<ShopType>("std");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [cat3, setCat3] = useState("");
  const [newSeller, setNewSeller] = useState(false);

  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [ops, setOps] = useState(0);
  const [mkt, setMkt] = useState(0);

  const [txnRate, setTxnRate] = useState(DEFAULT_INPUT.txnRate);
  const [orderFee, setOrderFee] = useState(DEFAULT_INPUT.orderFee);
  const [freeshipOn, setFreeshipOn] = useState(false);
  const [freeshipRate, setFreeshipRate] = useState(5);
  const [vxpOn, setVxpOn] = useState(false);
  const [vxpRate, setVxpRate] = useState(4);
  const [flashOn, setFlashOn] = useState(false);
  const [flashRate, setFlashRate] = useState(3);
  const [affRate, setAffRate] = useState(0);

  /** Hoa hồng do ngành hàng quyết định; người dùng có thể ghi đè thủ công */
  const [commOverride, setCommOverride] = useState<number | null>(null);

  const auto = useMemo(() => {
    const { rate, picked } = baseRate(shopType, cat1, cat2, cat3);
    return { rate: applyNewSellerDiscount(rate, newSeller), picked };
  }, [shopType, cat1, cat2, cat3, newSeller]);

  const commRate = commOverride ?? auto.rate;

  const r = useMemo(
    () =>
      calcProfit({
        price,
        cost,
        ops,
        mkt,
        commRate,
        txnRate,
        orderFee,
        freeshipRate,
        freeshipOn,
        vxpRate,
        vxpOn,
        flashRate,
        flashOn,
        affRate,
      }),
    [price, cost, ops, mkt, commRate, txnRate, orderFee, freeshipRate, freeshipOn, vxpRate, vxpOn, flashRate, flashOn, affRate],
  );

  const empty = price <= 0;

  const segments = useMemo(() => {
    const base = r.profit >= 0 ? r.price : r.totalCost;
    const list = [
      { label: "Vốn sản phẩm", value: cost, color: S.cost },
      { label: "Vận hành", value: ops, color: S.ops },
      { label: "Marketing", value: mkt, color: S.mkt },
      { label: "Hoa hồng sàn", value: r.commFee, color: S.comm },
      { label: "Phí giao dịch", value: r.txnFee, color: S.txn },
      { label: "Phí xử lý đơn", value: r.orderFee, color: S.order },
      { label: "Freeship Xtra", value: r.freeFee, color: S.extra },
      { label: "Voucher Xtra", value: r.vxpFee, color: S.extra },
      { label: "Flash Sale", value: r.flashFee, color: S.extra },
      { label: "Affiliate/KOC", value: r.affFee, color: S.extra },
    ].filter((s) => s.value > 0);
    if (r.profit > 0) list.push({ label: "Lợi nhuận", value: r.profit, color: S.profit });
    return list.map((s) => ({ ...s, pct: base > 0 ? (s.value / base) * 100 : 0 }));
  }, [r, cost, ops, mkt]);

  function reset() {
    setShopType("std");
    setCat1(""); setCat2(""); setCat3("");
    setNewSeller(false);
    setPrice(0); setCost(0); setOps(0); setMkt(0);
    setTxnRate(6); setOrderFee(3000);
    setFreeshipOn(false); setFreeshipRate(5);
    setVxpOn(false); setVxpRate(4);
    setFlashOn(false); setFlashRate(3);
    setAffRate(0);
    setCommOverride(null);
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Tính lợi nhuận TikTok Shop
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            Biểu phí chính thức TikTok Shop VN · 2.039 ngành hàng cấp 3
          </p>
        </div>
        <Button variant="ghost" onClick={reset}>
          Nhập lại
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ─── Cột nhập liệu ─── */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Sản phẩm"
              hint="Chọn tới ngành cấp 3 để lấy đúng phí hoa hồng"
            />

            <div className="mb-4">
              <Label>Loại gian hàng</Label>
              <Segmented<ShopType>
                ariaLabel="Loại gian hàng"
                value={shopType}
                onChange={(v) => { setShopType(v); setCommOverride(null); }}
                options={[
                  { value: "std", label: "Shop thường" },
                  { value: "mall", label: "Shop Mall" },
                ]}
              />
            </div>

            <div className="space-y-2.5">
              <div>
                <Label htmlFor="cat1">Ngành hàng</Label>
                <SelectField
                  id="cat1"
                  value={cat1}
                  onChange={(e) => {
                    setCat1(e.target.value); setCat2(""); setCat3(""); setCommOverride(null);
                  }}
                >
                  <option value="">— Chọn ngành hàng cấp 1 —</option>
                  {Object.keys(FEE_TREE).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </SelectField>
              </div>

              <SelectField
                aria-label="Ngành hàng cấp 2"
                value={cat2}
                disabled={!cat1}
                onChange={(e) => { setCat2(e.target.value); setCat3(""); setCommOverride(null); }}
              >
                <option value="">— Chọn ngành cấp 2 —</option>
                {cat1 && Object.keys(FEE_TREE[cat1] ?? {}).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </SelectField>

              <SelectField
                aria-label="Ngành hàng cấp 3"
                value={cat3}
                disabled={!cat2}
                onChange={(e) => { setCat3(e.target.value); setCommOverride(null); }}
              >
                <option value="">— Chọn ngành cấp 3 —</option>
                {cat1 && cat2 && Object.keys(FEE_TREE[cat1]?.[cat2] ?? {}).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </SelectField>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-ink)]">
                  Ưu đãi shop mới
                </p>
                <p className="text-[11.5px] text-[var(--color-muted)]">
                  Giảm 50% hoa hồng, tối đa 3 điểm %
                </p>
              </div>
              <Switch
                id="newSeller"
                label="Ưu đãi shop mới"
                checked={newSeller}
                onChange={(v) => { setNewSeller(v); setCommOverride(null); }}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Giá và chi phí của shop" />
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyInput id="price" label="Giá bán" value={price} onChange={setPrice} />
              <MoneyInput id="cost" label="Vốn sản phẩm" value={cost} onChange={setCost} />
              <MoneyInput id="ops" label="Chi phí vận hành" value={ops} onChange={setOps} />
              <MoneyInput
                id="mkt"
                label="Chi phí marketing"
                value={mkt}
                onChange={setMkt}
                hint={price > 0 ? `≈ ${fmtPct((mkt / price) * 100)} doanh thu` : undefined}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Phí sàn"
              hint="Đã điền sẵn theo biểu phí — sửa được nếu shop có thoả thuận riêng"
            />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[var(--color-ink)]">
                    Hoa hồng nền tảng
                  </p>
                  <p className="truncate text-[11.5px] text-[var(--color-muted)]">
                    {auto.picked ? cat3 : `Mặc định ${fmtPct(DEFAULT_RATE[shopType])} — chưa chọn ngành cấp 3`}
                  </p>
                </div>
                <PctInput
                  value={commRate}
                  onChange={(v) => setCommOverride(v)}
                  ariaLabel="Phần trăm hoa hồng nền tảng"
                />
              </div>

              <Row label="Phí giao dịch">
                <PctInput value={txnRate} onChange={setTxnRate} ariaLabel="Phần trăm phí giao dịch" />
              </Row>

              <Row label="Phí xử lý đơn" unit="đ">
                <input
                  type="number"
                  step={500}
                  min={0}
                  value={orderFee}
                  onChange={(e) => setOrderFee(Number(e.target.value) || 0)}
                  aria-label="Phí xử lý đơn"
                  className="tnum w-[92px] rounded-[8px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2 py-1.5 text-right text-[13px] text-[var(--color-ink)] focus:border-[var(--color-brand)] focus:outline-none"
                />
              </Row>

              <hr className="border-[var(--color-line)]" />

              <ToggleRow
                id="freeship" label="Freeship Xtra" on={freeshipOn} setOn={setFreeshipOn}
                rate={freeshipRate} setRate={setFreeshipRate}
              />
              <ToggleRow
                id="vxp" label="Voucher Xtra" note="trần 50.000đ/sp" on={vxpOn} setOn={setVxpOn}
                rate={vxpRate} setRate={setVxpRate}
              />
              <ToggleRow
                id="flash" label="Phí dịch vụ Flash Sale" on={flashOn} setOn={setFlashOn}
                rate={flashRate} setRate={setFlashRate}
              />

              <Row label="Hoa hồng Affiliate / KOC">
                <PctInput value={affRate} onChange={setAffRate} ariaLabel="Phần trăm hoa hồng affiliate" />
              </Row>
            </div>
          </Card>
        </div>

        {/* ─── Cột kết quả ─── */}
        <div className="space-y-4 xl:sticky xl:top-[73px] xl:self-start">
          <div
            className={cx(
              "rounded-[14px] border p-5",
              empty
                ? "border-[var(--color-line)] bg-[var(--color-surface)]"
                : r.profit >= 0
                  ? "border-[var(--color-good)]/30 bg-[var(--color-good)]/6"
                  : "border-[var(--color-critical)]/30 bg-[var(--color-critical)]/6",
            )}
          >
            <p className="text-[12.5px] font-medium text-[var(--color-ink-2)]">
              Lợi nhuận ròng trên 1 đơn
            </p>
            <p
              className="mt-1.5 text-[38px] font-semibold leading-none tracking-[-0.03em]"
              style={{
                color: empty
                  ? "var(--color-muted)"
                  : r.profit >= 0
                    ? "var(--color-good)"
                    : "var(--color-critical)",
              }}
            >
              {empty ? "— đ" : `${r.profit < 0 ? "−" : ""}${fmtVnd(Math.abs(r.profit))}`}
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--color-line)] pt-3.5">
              <MiniStat label="Biên lợi nhuận" value={empty ? "—" : `${r.margin < 0 ? "−" : ""}${fmtPct(Math.abs(r.margin))}`} />
              <MiniStat label="Tổng phí sàn" value={empty ? "—" : fmtVnd(r.platformFee)} />
              <MiniStat label="Nhận về từ sàn" value={empty ? "—" : fmtVnd(r.netFromPlatform)} />
            </dl>
          </div>

          <Card>
            <CardHeader title="Một đồng doanh thu đi về đâu" />
            {empty ? (
              <p className="py-6 text-center text-[13px] text-[var(--color-muted)]">
                Nhập giá bán để xem tỷ trọng.
              </p>
            ) : (
              <>
                <div className="mb-3.5 flex h-[13px] w-full gap-[2px] overflow-hidden rounded-full">
                  {segments.map((s, i) => (
                    <div
                      key={`${s.label}-${i}`}
                      style={{ width: `${s.pct}%`, background: s.color }}
                      title={`${s.label}: ${fmtPct(s.pct)}`}
                    />
                  ))}
                </div>
                <ul className="space-y-1.5">
                  {segments.map((s, i) => (
                    <li key={`${s.label}-${i}`} className="flex items-center gap-2 text-[12.5px]">
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                      <span className="text-[var(--color-ink-2)]">{s.label}</span>
                      <span className="tnum ml-auto text-[var(--color-ink)]">{fmtVnd(s.value)}</span>
                      <span className="tnum w-[52px] shrink-0 text-right font-medium text-[var(--color-ink)]">
                        {fmtPct(s.pct)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Bảng chi tiết" />
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                <BreakRow label="Doanh thu (giá bán)" value={r.price} strong />
                <GroupRow label="Phí sàn TikTok" />
                <BreakRow label="Hoa hồng nền tảng" value={-r.commFee} pct={r.price ? (r.commFee / r.price) * 100 : 0} />
                <BreakRow label="Phí giao dịch" value={-r.txnFee} pct={r.price ? (r.txnFee / r.price) * 100 : 0} />
                <BreakRow label="Phí xử lý đơn" value={-r.orderFee} />
                {freeshipOn && <BreakRow label="Freeship Xtra" value={-r.freeFee} pct={r.price ? (r.freeFee / r.price) * 100 : 0} />}
                {vxpOn && <BreakRow label="Voucher Xtra" value={-r.vxpFee} pct={r.price ? (r.vxpFee / r.price) * 100 : 0} />}
                {flashOn && <BreakRow label="Phí dịch vụ Flash Sale" value={-r.flashFee} pct={r.price ? (r.flashFee / r.price) * 100 : 0} />}
                {affRate > 0 && <BreakRow label="Hoa hồng Affiliate" value={-r.affFee} pct={r.price ? (r.affFee / r.price) * 100 : 0} />}
                <GroupRow label="Chi phí của shop" />
                <BreakRow label="Vốn sản phẩm" value={-cost} pct={r.price ? (cost / r.price) * 100 : 0} />
                <BreakRow label="Chi phí vận hành" value={-ops} pct={r.price ? (ops / r.price) * 100 : 0} />
                <BreakRow label="Chi phí marketing" value={-mkt} pct={r.price ? (mkt / r.price) * 100 : 0} />
                <tr className="border-t-2 border-[var(--color-line-strong)]">
                  <td className="py-2.5 text-[13.5px] font-semibold text-[var(--color-ink)]">
                    Lợi nhuận ròng
                  </td>
                  <td
                    className="tnum py-2.5 text-right text-[13.5px] font-semibold"
                    style={{ color: r.profit >= 0 ? "var(--color-good)" : "var(--color-critical)" }}
                  >
                    {r.profit < 0 ? "−" : ""}{fmtVnd(Math.abs(r.profit))}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-[12.5px] font-medium text-[var(--color-ink-2)]">
                Trần chi marketing để hoà vốn
              </p>
              <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                {empty ? "—" : r.breakevenMkt > 0 ? fmtVnd(r.breakevenMkt) : "0 đ"}
              </p>
              {!empty && r.breakevenMkt <= 0 && (
                <p className="mt-1 text-[11.5px] text-[var(--color-critical)]">
                  Đã lỗ trước khi chi marketing
                </p>
              )}
            </Card>
            <Card>
              <p className="text-[12.5px] font-medium text-[var(--color-ink-2)]">
                ROAS tối thiểu
              </p>
              <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                {r.roas ? `${fmtNum(r.roas)} lần` : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-[var(--color-muted)]">
                để không lỗ
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Thành phần phụ ─────────── */

function MoneyInput({
  id, label, value, onChange, hint,
}: {
  id: string; label: string; value: number;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>{label}</Label>
      <div className="relative">
        <TextField
          id={id}
          inputMode="numeric"
          placeholder="0"
          value={value ? fmtInt(value) : ""}
          onChange={(e) => onChange(parseMoney(e.target.value))}
          className="tnum pr-8"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-muted)]">
          đ
        </span>
      </div>
    </div>
  );
}

function PctInput({
  value, onChange, ariaLabel,
}: { value: number; onChange: (v: number) => void; ariaLabel: string }) {
  return (
    <div className="relative shrink-0">
      <input
        type="number"
        step={0.1}
        min={0}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="tnum w-[80px] rounded-[8px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-1.5 pl-2 pr-6 text-right text-[13px] text-[var(--color-ink)] focus:border-[var(--color-brand)] focus:outline-none"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-muted)]">
        %
      </span>
    </div>
  );
}

function Row({
  label, unit, children,
}: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="min-w-0 flex-1 text-[13px] text-[var(--color-ink-2)]">
        {label}
        {unit && <span className="ml-1 text-[var(--color-muted)]">({unit})</span>}
      </p>
      {children}
    </div>
  );
}

function ToggleRow({
  id, label, note, on, setOn, rate, setRate,
}: {
  id: string; label: string; note?: string;
  on: boolean; setOn: (v: boolean) => void;
  rate: number; setRate: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[var(--color-ink-2)]">{label}</p>
        {note && <p className="text-[11px] text-[var(--color-muted)]">{note}</p>}
      </div>
      {on && <PctInput value={rate} onChange={setRate} ariaLabel={`Phần trăm ${label}`} />}
      <Switch id={id} label={label} checked={on} onChange={setOn} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11.5px] text-[var(--color-muted)]">{label}</dt>
      <dd className="tnum mt-0.5 truncate text-[14px] font-semibold text-[var(--color-ink)]">
        {value}
      </dd>
    </div>
  );
}

function GroupRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={2} className="pb-1 pt-3 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[var(--color-muted)]">
        {label}
      </td>
    </tr>
  );
}

function BreakRow({
  label, value, pct, strong,
}: { label: string; value: number; pct?: number; strong?: boolean }) {
  const neg = value < 0;
  return (
    <tr className="border-b border-[var(--color-line)]">
      <td className={cx("py-[7px] text-[13px]", strong ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-ink-2)]")}>
        {label}
        {pct != null && pct > 0 && (
          <span className="tnum ml-1.5 text-[11.5px] text-[var(--color-muted)]">
            {fmtPct(pct)}
          </span>
        )}
      </td>
      <td
        className={cx(
          "tnum py-[7px] text-right text-[13px]",
          strong ? "font-medium text-[var(--color-ink)]" : neg ? "text-[var(--color-critical)]" : "text-[var(--color-ink)]",
        )}
      >
        {neg ? "− " : ""}{fmtVnd(Math.abs(value))}
      </td>
    </tr>
  );
}
