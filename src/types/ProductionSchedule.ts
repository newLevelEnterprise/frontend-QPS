export interface IProductionSchedule {
  sequencing_start: string;
  setup_count: number;
  optimized_setups: number;
  on_time_jobs: number;
  total_machine_hours: number;
  max_deadline_hours: number;
  machine_status: string;
  id: number;
  created_at: string;
  results: Results[];
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
  machine_name: string | null;
  mold_name: string | null;
  quantity: number;
  scheduled_date: string;
  scheduled_time: string | null;
  actual_date: string;
  completion_time: string | null;
  billing_date: string;
  status: string;
  expected_revenue: number;
}
