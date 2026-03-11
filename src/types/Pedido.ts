export interface IPedido {
  client: {
    id: number;
    name: string;
    priority: number;
  };
  product: {
    id: number;
    name: string;
  };
  mold: {
    id: number;
    name: string;
  };
  product_name: string;
  promised_date: string;
  sequencing_start_date: string;
  total_time_sec: number;
  demand: number;
  total_time_hours: number;
  deadline_days: number;
  deadline_hours: number;
  product_value: number;
  processed: number;
  fk_id_client: number;
  fk_id_product: number;
  order_number: string;
  id: number;
}

export interface ICriarPedido {
  name: string;
  promised_date: string;
  sequencing_start_date: string;
  total_time_sec: number;
  demand: number;
  total_time_hours: number;
  deadline_days: number;
  deadline_hours: number;
  product_value: number;
  processed: number;
  fk_id_client: number;
  fk_id_product: number;
}
