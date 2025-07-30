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
}

export interface Results {
  job_id: number;
  order_index: number;
  client_name: string;
  product_name: string;
  quantity: number;
  scheduled_date: string;
  actual_date: string;
  completion_date: string;
  completion_time: string;
  billing_date: string;
  status: string;
  expected_revenue: number;
}
