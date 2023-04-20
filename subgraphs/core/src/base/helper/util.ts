import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";

export function toAmountDecimal(amount: BigInt, decimals: i32): BigDecimal {
    return amount.toBigDecimal().div(
        BigInt.fromI32(10)
            .pow(u8(decimals))
            .toBigDecimal()
    );
}
