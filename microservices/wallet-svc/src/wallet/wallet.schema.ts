import * as mongoose from 'mongoose';
import { Payment } from './wallet.interface';

/**
 * mongoose schema for the Payment schema
 * @category Wallet
 */
export const paymentSchema = new mongoose.Schema<Payment>(
  {
    /**
     * unique id for payment
     */
    id: {
      type: String,
      default: null,
    },

    /**
     * reference object to component packs
     */
    reference: {
      type: String, // COMPONENTPACK
      default: null,
    },

    /**
     * kind of payment
     */
    kind: {
      type: String, // WALLET
      default: null,
    },

    /**
     * payment completion status
     */
    status: {
      type: String,
      default: null,
    },

    /**
     * kind of status_eta
     */
    status_eta: {
      type: String,
      default: null,
    },

    /**
     * payment incoming amount
     */
    amount_in: {
      type: String,
      default: null,
    },

    /**
     * payment outcoming amount
     */
    amount_out: {
      type: String,
      default: null,
    },

    /**
     * payment fee amount
     */
    amount_fee: {
      type: String,
      default: null,
    },

    /**
     * payment transaction hash
     */
    transaction_hash: {
      type: String,
      default: null,
    },

    /**
     * payment transaction memo URL
     */
    transaction_memo: {
      type: String,
      default: null,
    },

    /**
     * represents whether payment was refunded
     */
    refunded: {
      type: Boolean,
      default: false,
    },

    /**
     * from whom payment was made.
     */
    from: {
      type: String,
      default: null,
    },

    /**
     * to whom payment was made.
     */
    to: {
      type: String,
      default: null,
    },

    /**
     * asset code in which payment was made.
     */
    asset_code: {
      type: String,
      default: null,
    },

    /**
     * platform on which payment was made.
     */
    platform: {
      type: String, // web | android | ios
      default: null,
    },

    /**
     * any payment related message.
     */
    message: {
      type: String,
      default: null,
    },

    /**
     * payment type - credit | debit.
     */
    type: {
      // credit / debit
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
