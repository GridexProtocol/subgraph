import {
    GridCandle1M,
    GridCandle5M,
    GridCandle15M,
    GridCandle30M,
    GridCandle1H,
    GridCandle4H,
    GridCandle1D,
    TokenCandle1M,
    TokenCandle5M,
    TokenCandle15M,
    TokenCandle30M,
    TokenCandle1H,
    TokenCandle4H,
    TokenCandle1D
} from "../../generated/schema";
import {BigDecimal, BigInt, ethereum} from "@graphprotocol/graph-ts";
import {BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO} from "./helper/consts";

enum CandleType {
    ONE_MINUTE = 60, // 1M
    FIVE_MINUTES = ONE_MINUTE * 5, // 5M
    FIFTEEN_MINUTES = ONE_MINUTE * 15, // 15M
    THIRTY_MINUTES = ONE_MINUTE * 30, // 30M
    ONE_HOUR = ONE_MINUTE * 60, // 1H
    FOUR_HOURS = ONE_HOUR * 4, // 4H
    ONE_DAY = ONE_HOUR * 24 // 1D
}

export class updateGridCandlesParam {
    event: ethereum.Event;
    // grid price, quoted by token1
    price: BigDecimal;

    // nonzero when swap
    volume0: BigInt;
    volume1: BigInt;
    volumeUSD: BigDecimal;
    fee0: BigInt;
    fee1: BigInt;
    feeUSD: BigDecimal;

    // grid tvl usd
    tvlUSD: BigDecimal;
}

export class updateTokenCandlesParam {
    event: ethereum.Event;

    tokenID: string;
    // token price
    price: BigDecimal;

    // nonzero when swap
    volume: BigInt;
    volumeUSD: BigDecimal;
    fee: BigInt;
    feeUSD: BigDecimal;

    // token tvl usd
    totalLocked: BigInt;
    totalLockedUSD: BigDecimal;
}

export function updateTokenCandles(param: updateTokenCandlesParam): void {
    const timestampFn = function(event: ethereum.Event, type: CandleType): BigInt {
        return event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(type)));
    };
    {
        const type = CandleType.ONE_MINUTE;
        let entity = TokenCandle1M.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle1M(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIVE_MINUTES;
        let entity = TokenCandle5M.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle5M(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIFTEEN_MINUTES;
        let entity = TokenCandle15M.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle15M(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.THIRTY_MINUTES;
        let entity = TokenCandle30M.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle30M(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_HOUR;
        let entity = TokenCandle1H.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle1H(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FOUR_HOURS;
        let entity = TokenCandle4H.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle4H(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_DAY;
        let entity = TokenCandle1D.load(param.tokenID + ":" + timestampFn(param.event, type).toString());
        if (entity == null) {
            entity = new TokenCandle1D(param.tokenID + ":" + timestampFn(param.event, type).toString());
            entity.token = param.tokenID;
            entity.ts = timestampFn(param.event, type);
            entity.volume = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.totalLocked = param.totalLocked;
        entity.totalLockedUSD = param.totalLockedUSD;
        entity.volume = entity.volume.plus(param.volume);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
}

export function updateGridCandles(param: updateGridCandlesParam): void {
    const timestampFn = function(event: ethereum.Event, type: CandleType): BigInt {
        return event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(type)));
    };
    {
        const type = CandleType.ONE_MINUTE;
        let entity = GridCandle1M.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle1M(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIVE_MINUTES;
        let entity = GridCandle5M.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle5M(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FIFTEEN_MINUTES;
        let entity = GridCandle15M.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle15M(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.THIRTY_MINUTES;
        let entity = GridCandle30M.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle30M(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_HOUR;
        let entity = GridCandle1H.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle1H(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.FOUR_HOURS;
        let entity = GridCandle4H.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle4H(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.close = param.price;
        entity.tvlUSD = param.tvlUSD;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
    {
        const type = CandleType.ONE_DAY;
        let entity = GridCandle1D.load(
            param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
        );
        if (entity == null) {
            entity = new GridCandle1D(
                param.event.address.toHexString() + ":" + timestampFn(param.event, type).toString()
            );
            entity.grid = param.event.address.toHexString();
            entity.ts = timestampFn(param.event, type);
            entity.volume0 = BIG_INT_ZERO;
            entity.volume1 = BIG_INT_ZERO;
            entity.volumeUSD = BIG_DECIMAL_ZERO;
            entity.fee0 = BIG_INT_ZERO;
            entity.fee1 = BIG_INT_ZERO;
            entity.feeUSD = BIG_DECIMAL_ZERO;
            entity.txCount = BIG_INT_ZERO;
            entity.high = param.price;
            entity.low = param.price;
            entity.open = param.price;
        }
        entity.tvlUSD = param.tvlUSD;
        entity.close = param.price;
        entity.volume0 = entity.volume0.plus(param.volume0);
        entity.volume1 = entity.volume1.plus(param.volume1);
        entity.volumeUSD = entity.volumeUSD.plus(param.volumeUSD);
        entity.fee0 = entity.fee0.plus(param.fee0);
        entity.fee1 = entity.fee1.plus(param.fee1);
        entity.feeUSD = entity.feeUSD.plus(param.feeUSD);
        entity.txCount = entity.txCount.plus(BIG_INT_ONE);
        if (param.price.gt(entity.high)) {
            entity.high = param.price;
        }
        if (param.price.lt(entity.low)) {
            entity.low = param.price;
        }
        entity.save();
    }
}
