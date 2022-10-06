import { Document } from 'mongoose';
/**
 * interface for the Payment schema.
 * @category Wallet
 */
export interface Payment extends Document {
  /**
   * unique id for payment
   */
  id: string;

  /**
   * reference object to component packs
   */
  reference: string;

  /**
   * kind of payment
   */

  kind: string;

  /**
   * payment completion status
   */
  status: string;

  /**
   * kind of status_eta
   */
  status_eta: string;

  /**
   * payment incoming amount
   */
  amount_in: string;

  /**
   * payment outcoming amount
   */
  amount_out: string;

  /**
   * payment fee amount
   */
  amount_fee: string;

  /**
   * payment transaction hash
   */
  transaction_hash: string;

  /**
   * represents whether payment was refunded
   */
  refunded: boolean;

  /**
   * from whom payment was made.
   */
  from: string;

  /**
   * to whom payment was made.
   */
  to: string;

  /**
   * payment transaction memo URL
   */
  transaction_memo: string;

  /**
   * asset code in which payment was made.
   */
  asset_code: string;

  /**
   * platform on which payment was made.
   */
  platform: string;

  /**
   * any payment related message.
   */
  message: string;

  /**
   * payment type - credit | debit.
   */
  type: string;
}
