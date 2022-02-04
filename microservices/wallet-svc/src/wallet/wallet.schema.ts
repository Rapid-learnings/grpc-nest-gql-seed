import * as mongoose from 'mongoose';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Payment } from './wallet.interface';
import * as validator from 'validator';
import { HttpStatus } from '@nestjs/common';

export const paymentSchema = new mongoose.Schema<Payment>(
  {
    id: {
      type: String,
      default: null,
    },
    reference: {
      type: String, // COMPONENTPACK
      default: null,
    },
    kind: {
      type: String, // WALLET
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    status_eta: {
      type: String,
      default: null,
    },
    amount_in: {
      type: String,
      default: null,
    },
    amount_out: {
      type: String,
      default: null,
    },
    amount_fee: {
      type: String,
      default: null,
    },
    transaction_hash: {
      type: String,
      default: null,
    },
    transaction_memo: {
      type: String,
      default: null,
    },
    refunded: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: null,
    },
    to: {
      type: String,
      default: null,
    },
    asset_code: {
      type: String,
      default: null,
    },
    platform: {
      type: String, // web | android | ios
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
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
