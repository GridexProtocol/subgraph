import {BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";

export const BIG_INT_ZERO = BigInt.zero();
export const BIG_INT_ONE = BigInt.fromI32(1);
export const BIG_DECIMAL_ZERO = BigDecimal.zero();

export const NETWORK = dataSource.network();
