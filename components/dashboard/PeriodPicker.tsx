"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/primitives";
import type { RangeKey } from "@/lib/mock-data";

type Granularity = "ngay" | "tuan" | "thang";
type DayRange = "7d" | "30d" | "90d";

/**
 * Bộ lọc thời gian 2 cấp dùng chung cho mọi trang dashboard: Ngày → Tuần → Tháng
 * theo đúng yêu cầu tài liệu chỉ số SAIZA (mục "Lưu ý khi thu thập & trình bày").
 * Cấp "Ngày" có thêm lựa chọn 7/30/90 ngày.
 */
export function usePeriodPicker(initialDayRange: DayRange = "30d") {
  const [granularity, setGranularity] = useState<Granularity>("ngay");
  const [dayRange, setDayRange] = useState<DayRange>(initialDayRange);

  const range: RangeKey =
    granularity === "tuan" ? "12w" : granularity === "thang" ? "12m" : dayRange;

  const picker = (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented<Granularity>
        ariaLabel="Cấp độ thời gian"
        value={granularity}
        onChange={setGranularity}
        options={[
          { value: "ngay", label: "Ngày" },
          { value: "tuan", label: "Tuần" },
          { value: "thang", label: "Tháng" },
        ]}
      />
      {granularity === "ngay" && (
        <Segmented<DayRange>
          ariaLabel="Số ngày"
          value={dayRange}
          onChange={setDayRange}
          options={[
            { value: "7d", label: "7 ngày" },
            { value: "30d", label: "30 ngày" },
            { value: "90d", label: "90 ngày" },
          ]}
        />
      )}
    </div>
  );

  return { range, picker };
}
