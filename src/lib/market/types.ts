export type Bar = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type Scenario =
  | "uptrend"
  | "downtrend"
  | "range"
  | "breakout"
  | "reversal"
  | "volatile"
  | "mixed";

export type Signal = {
  i: number;
  side: "buy" | "sell";
  price: number;
  note?: string;
};

export type Overlay =
  | {
      kind: "line";
      id: string;
      label: string;
      color: string;
      values: Array<number | null>;
      width?: number;
      dashed?: boolean;
    }
  | {
      kind: "band";
      id: string;
      label: string;
      upper: Array<number | null>;
      lower: Array<number | null>;
      mid?: Array<number | null>;
      fill: string;
      upperColor: string;
      lowerColor: string;
    }
  | {
      kind: "cloud";
      id: string;
      label: string;
      a: Array<number | null>;
      b: Array<number | null>;
      bull: string;
      bear: string;
    }
  | {
      kind: "dots";
      id: string;
      label: string;
      values: Array<number | null>;
      colors: Array<string | null>;
      size?: number;
    }
  | {
      kind: "zigzag";
      id: string;
      label: string;
      points: Array<{ i: number; price: number }>;
      color: string;
    }
  | {
      kind: "levels";
      id: string;
      label: string;
      levels: Array<{ price: number; label: string; color: string; dashed?: boolean }>;
    }
  | {
      kind: "markers";
      id: string;
      items: Signal[];
    };

export type Oscillator = {
  id: string;
  label: string;
  min: number;
  max: number;
  zero?: number;
  guides?: number[];
  series: Array<{
    id: string;
    color: string;
    values: Array<number | null>;
    type?: "line" | "hist";
    histColors?: Array<string | null>;
  }>;
};

export type AlgoResult = {
  overlays: Overlay[];
  oscillators: Oscillator[];
  signals: Signal[];
  stats: { label: string; value: string }[];
  chartBars?: Bar[];
  note?: string;
};

export type ParamDef = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

export type CategoryId =
  | "trend"
  | "curve"
  | "reversal"
  | "momentum"
  | "volatility"
  | "volume"
  | "structure"
  | "system";
