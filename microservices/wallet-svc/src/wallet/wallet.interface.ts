import { Document } from 'mongoose';
export interface Payment extends Document {
  id: string;
  reference: string;
  kind: string;
  status: string;
  status_eta: string;
  amount_in: string;
  amount_out: string;
  amount_fee: string;
  transaction_hash: string;
  refunded: boolean;
  from: string;
  to: string;
  transaction_memo: string;
  asset_code: string;
  platform: string;
  message: string;
  type: string;
}
