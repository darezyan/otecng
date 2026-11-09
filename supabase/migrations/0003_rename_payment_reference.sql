-- Switching payment gateway from Paystack to Squad — the column name
-- shouldn't be tied to a specific provider. Rename only; no data loss.

alter table orders rename column paystack_reference to payment_reference;
alter index orders_paystack_reference_idx rename to orders_payment_reference_idx;
