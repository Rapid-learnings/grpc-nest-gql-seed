export interface WalletServiceInterface {
  hello(MessageResponse);
  createCharge(CreateCharge);
  createStripeAccount(createStripeAccountDto);
  stripeCreateAccountLinks(stripeCreateAccountLinksDto);
  createPaymentIntent;
  healthCheck(MessageDef);
  checkBalance(CheckBalanceDto);
  debit(debitDto);
  topUpWallet(TopUpWalletDto);
  topUpWalletConfirm(TopUpWalletConfirmDto);
  createOrUpdateTransaction(Transaction);
  listTransactions(ListTransactionDto);
  calculateRevenueGeneratedFromFees(MessageDef);
}
