import {Swap as SwapEvent} from "../../generated/templates/Grid/Grid";
import {
    GridCandle1M,
    GridCandle5M,
    GridCandle15M,
    GridCandle30M,
    GridCandle1H,
    GridCandle4H,
    GridCandle1D
} from "../../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {BIG_INT_ONE, BIG_INT_ZERO} from "./helper/consts";

enum CandleType {
    ONE_MINUTE = 60, // 1M
    FIVE_MINUTES = ONE_MINUTE * 5, // 5M
    FIFTEEN_MINUTES = ONE_MINUTE * 15, // 15M
    THIRTY_MINUTES = ONE_MINUTE * 30, // 30M
    ONE_HOUR = ONE_MINUTE * 60, // 1H
    FOUR_HOUR = ONE_HOUR * 4, // 4H
    ONE_DAY = ONE_HOUR * 24 // 1D
}

export function updateGridCandle(event: SwapEvent, price: BigDecimal, fee0: BigInt, fee1: BigInt): void {
    const timestampFn = function(event: SwapEvent, type: CandleType): BigInt {
        return event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(type)));
    };

    {
        const type = CandleType.ONE_MINUTE;
        let entity = GridCandle1M.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle1M(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIVE_MINUTES;
        let entity = GridCandle5M.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle5M(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIFTEEN_MINUTES;
        let entity = GridCandle15M.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle15M(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.THIRTY_MINUTES;
        let entity = GridCandle30M.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle30M(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_HOUR;
        let entity = GridCandle1H.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle1H(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.FOUR_HOUR;
        let entity = GridCandle4H.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle4H(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_DAY;
        let entity = GridCandle1D.load(event.address.toHexString() + ":" + timestampFn(event, type).toString());
        if (entity == null) {
            entity = new GridCandle1D(event.address.toHexString() + ":" + timestampFn(event, type).toString());
            entity.grid = event.address.toHexString();
            entity.ts = timestampFn(event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = price;
            entity.low = price;
            entity.open = price;
            entity.close = price;
        }
        entity.volume0 = entity.volume0.plus(event.params.amount0.abs());
        entity.volume1 = entity.volume1.plus(event.params.amount1.abs());
        entity.fee0 = entity.fee0.plus(fee0);
        entity.fee1 = entity.fee1.plus(fee1);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        entity.close = price;
        if (price.gt(entity.high)) {
            entity.high = price;
        }
        if (price.lt(entity.low)) {
            entity.low = price;
        }
        entity.save();
    }
}
