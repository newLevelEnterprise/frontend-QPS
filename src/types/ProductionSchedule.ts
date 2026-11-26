export interface IProductionSchedule {
  sequencing_start: string;
  setup_count: number;
  optimized_setups: number;
  on_time_jobs: number;
  total_machine_hours: number;
  max_deadline_hours: number;
  machine_status: string;
  billing_deadline_time?: string;
  id: number;
  created_at: string;
  results: Results[];
  rows?: ResultRow[];
  revenue_forecast: {
    billing_date: string;
    revenue_total: number;
  }[];
  metrics: {
    hs_de_disponibilidade: number;
    hs_nec_de_producao: number;
    carga_de_maquina_percent: number;
  };
}

export interface Results {
  job_id: number;
  id: number;
  order_index: number;
  order_number: string;
  client_name: string;
  product_name: string;
  product_code?: string | null;
  machine_name: string | null;
  mold_name: string | null;
  quantity: number;
  scheduled_datetime: string;
  scheduled_time: string | null;
  actual_datetime: string;
  completion_datetime: string | null;
  completion_injection_datetime: string | null;
  billing_date: string;
  status: string;
  expected_revenue: number;
}

export interface ResultRow {
  order: number;
  kind: "simple" | "compound" | "state" | "stop";
  machine_name: string | null;
  order_number: string;
  client_name: string;
  product_code: string | null;
  product_name: string;
  demand: number | null;
  production: number | null;
  scheduled_datetime: string | null;
  completion_injection_datetime: string | null;
  completion_datetime: string | null;
  billing_date: string | null;
  status: string;
  expected_revenue: number;
}
