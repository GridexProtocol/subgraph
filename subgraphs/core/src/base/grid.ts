import {
    ChangeBundleForSettleOrder as ChangeBundleForSettleOrderEvent,
    ChangeBundleForSwap as ChangeBundleForSwapEvent,
    Collect as CollectEvent,
    Flash as FlashEvent,
    Initialize as InitializeEvent,
    PlaceMakerOrder as PlaceMakerOrderEvent,
    SettleMakerOrder as SettleMakerOrderEvent,
    Swap as SwapEvent
} from "../../generated/templates/Grid/Grid";
import {Grid, Token, Bundle, Order, Boundary, TransactionHistory, GridexProtocol} from "../../generated/schema";
import {BigInt, BigDecimal, Bytes} from "@graphprotocol/graph-ts";
import {log} from "@graphprotocol/graph-ts";
import {updateGridCandles, updateGridCandlesParam, updateTokenCandles, updateTokenCandlesParam} from "./candle";
import {BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO} from "./helper/consts";
import {loadOrCreateUser, saveUniqueTransactionIfRequired} from "./helper/stats";
import {findUSDPerToken} from "./pricing";
import {mustLoadGrid, mustLoadProtocol, mustLoadToken} from "./helper/loader";
import {toAmountDecimal} from "./helper/util";

export function handleInitialize(event: InitializeEvent): void {
    const grid = mustLoadGrid(event.address);

    const token0 = mustLoadToken(grid.token0);
    token0.priceUSD = findUSDPerToken(token0);
    token0.save();

    const token1 = mustLoadToken(grid.token1);
    token1.priceUSD = findUSDPerToken(token1);
    token1.save();

    grid.boundary = event.params.boundary;
    grid.priceX96 = event.params.priceX96;
    grid.price0 = calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals);
    grid.price1 = calculatePrice1(grid.price0);
    grid.priceOracleCapacity = 1;
    grid.save();
}

export function handlePlaceMakerOrder(event: PlaceMakerOrderEvent): void {
    // Update protocol stats
    const protocol = mustLoadProtocol();
    protocol.orderCount = protocol.orderCount.plus(BIG_INT_ONE);
    protocol.unsettledOrderCount = protocol.unsettledOrderCount.plus(BIG_INT_ONE);
    saveUniqueTransactionIfRequired(protocol, event);

    // Update user stats
    const uniqueUser = loadOrCreateUser(protocol, event.transaction.from, event.block.number, event.block.timestamp);
    uniqueUser.orderCount = uniqueUser.orderCount.plus(BIG_INT_ONE);
    uniqueUser.save();

    const grid = mustLoadGrid(event.address);

    protocol.tvlUSD = protocol.tvlUSD.minus(grid.tvlUSD);
    // Create a new bundle if one doesn't exist
    let bundle = Bundle.load(event.address.toHexString() + ":" + event.params.bundleId.toString());
    if (bundle == null) {
        bundle = new Bundle(event.address.toHexString() + ":" + event.params.bundleId.toString());
        bundle.grid = grid.id;
        bundle.bundleId = event.params.bundleId;
        bundle.boundaryLower = event.params.boundaryLower;
        bundle.zero = event.params.zero;
        bundle.makerAmountTotal = BIG_INT_ZERO;
        bundle.makerAmountRemaining = BIG_INT_ZERO;
        bundle.takerAmountRemaining = BIG_INT_ZERO;
        bundle.takerFeeAmountRemaining = BIG_INT_ZERO;
        bundle.orderCount = BIG_INT_ZERO;
        bundle.fullyFilledBlock = BIG_INT_ZERO;
        bundle.fullyFilledTimestamp = BIG_INT_ZERO;
        bundle.createdBlock = event.block.number;
        bundle.createdTimestamp = event.block.timestamp;
    }
    bundle.makerAmountTotal = bundle.makerAmountTotal.plus(event.params.amount);
    bundle.makerAmountRemaining = bundle.makerAmountRemaining.plus(event.params.amount);
    bundle.orderCount = bundle.orderCount.plus(BIG_INT_ONE);
    bundle.save();

    // Create a new boundary if one doesn't exist
    let boundary = Boundary.load(
        event.address.toHexString() + ":" + bundle.zero.toString() + ":" + bundle.boundaryLower.toString()
    );
    if (boundary == null) {
        boundary = new Boundary(
            event.address.toHexString() + ":" + bundle.zero.toString() + ":" + bundle.boundaryLower.toString()
        );
        boundary.grid = bundle.grid;
        boundary.zero = event.params.zero;
        boundary.boundary = event.params.boundaryLower;
        boundary.makerAmountRemaining = BIG_INT_ZERO;
    }
    boundary.makerAmountRemaining = boundary.makerAmountRemaining.plus(event.params.amount);
    boundary.save();

    let token0 = mustLoadToken(grid.token0);
    let token1 = mustLoadToken(grid.token1);

    // Update grid
    if (event.params.zero) {
        grid.locked0 = grid.locked0.plus(event.params.amount);
    } else {
        grid.locked1 = grid.locked1.plus(event.params.amount);
    }

    let locked0Decimal = toAmountDecimal(grid.locked0, token0.decimals);
    let locked1Decimal = toAmountDecimal(grid.locked1, token1.decimals);
    grid.tvlUSD = locked0Decimal.times(token0.priceUSD).plus(locked1Decimal.times(token1.priceUSD));
    grid.orderCount = grid.orderCount.plus(BIG_INT_ONE);
    grid.unsettledOrderCount = grid.unsettledOrderCount.plus(BIG_INT_ONE);
    grid.save();

    protocol.tvlUSD = protocol.tvlUSD.plus(grid.tvlUSD);
    protocol.save();

    // Update token
    let token: Token;
    let amountUSD: BigDecimal;
    if (event.params.zero) {
        token = token0;
        amountUSD = toAmountDecimal(event.params.amount, token0.decimals).plus(token0.priceUSD);
    } else {
        token = token1;
        amountUSD = toAmountDecimal(event.params.amount, token1.decimals).plus(token1.priceUSD);
    }
    token.totalLocked = token.totalLocked.plus(event.params.amount);
    token.totalLockedUSD = toAmountDecimal(token.totalLocked, token.decimals).times(token.priceUSD);
    token.save();

    // Create a new order
    const order = new Order(event.address.toHexString() + ":" + event.params.orderId.toString());
    order.grid = grid.id;
    order.orderId = event.params.orderId;
    order.bundle = bundle.id;
    order.owner = event.params.recipient;
    order.zero = event.params.zero;
    order.settled = false;
    order.settledBlock = BIG_INT_ZERO;
    order.settledTimestamp = BIG_INT_ZERO;
    order.settledTxHash = Bytes.empty();
    order.boundaryLower = event.params.boundaryLower;
    order.makerAmountIn = event.params.amount;
    order.makerAmountOut = BIG_INT_ZERO;
    order.takerAmountOut = BIG_INT_ZERO;
    order.takerFeeAmountOut = BIG_INT_ZERO;
    order.avgPrice = BIG_DECIMAL_ZERO;
    order.placedBlock = event.block.number;
    order.placedTimestamp = event.block.timestamp;
    order.placedTxHash = event.transaction.hash;
    order.save();

    // Create a new transaction history
    const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
    tx.grid = grid.id;
    tx.type = "PlaceMakerOrder";
    tx.sender = event.transaction.from;
    tx.recipient = event.params.recipient;
    if (event.params.zero) {
        tx.amount0 = event.params.amount;
        tx.amount1 = BIG_INT_ZERO;
    } else {
        tx.amount0 = BIG_INT_ZERO;
        tx.amount1 = event.params.amount;
    }
    tx.amountTakerFee = BIG_INT_ZERO;
    tx.amountUSD = amountUSD;
    tx.avgPrice = BIG_DECIMAL_ZERO;
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.save();

    // update candles
    let updateGridCandlesParam: updateGridCandlesParam = {
        event: event,
        price: grid.price0,
        volume0: BIG_INT_ZERO,
        volume1: BIG_INT_ZERO,
        volumeUSD: BIG_DECIMAL_ZERO,
        fee0: BIG_INT_ZERO,
        fee1: BIG_INT_ZERO,
        feeUSD: BIG_DECIMAL_ZERO,
        tvlUSD: grid.tvlUSD
    };
    updateGridCandles(updateGridCandlesParam);

    let updateTokenCandlesParam: updateTokenCandlesParam = {
        event: event,
        tokenID: token.id,
        price: token.priceUSD,
        volume: BIG_INT_ZERO,
        volumeUSD: BIG_DECIMAL_ZERO,
        fee: BIG_INT_ZERO,
        feeUSD: BIG_DECIMAL_ZERO,
        totalLocked: token.totalLocked,
        totalLockedUSD: token.totalLockedUSD
    };
    updateTokenCandles(updateTokenCandlesParam);
}

export function handleChangeBundleForSettleOrder(event: ChangeBundleForSettleOrderEvent): void {
    const protocol = mustLoadProtocol();
    const grid = mustLoadGrid(event.address);
    protocol.tvlUSD = protocol.tvlUSD.minus(grid.tvlUSD);

    // Update bundle
    const bundle = Bundle.load(event.address.toHexString() + ":" + event.params.bundleId.toString()) as Bundle;
    bundle.makerAmountTotal = bundle.makerAmountTotal.plus(event.params.makerAmountTotal);
    bundle.makerAmountRemaining = bundle.makerAmountRemaining.plus(event.params.makerAmountRemaining);
    bundle.save();

    // Update boundary
    const boundary = Boundary.load(
        event.address.toHexString() + ":" + bundle.zero.toString() + ":" + bundle.boundaryLower.toString()
    ) as Boundary;
    boundary.makerAmountRemaining = boundary.makerAmountRemaining.plus(event.params.makerAmountRemaining);
    boundary.save();

    // Update grid
    if (bundle.zero) {
        grid.locked0 = grid.locked0.plus(event.params.makerAmountRemaining);
    } else {
        grid.locked1 = grid.locked1.plus(event.params.makerAmountRemaining);
    }
    const token0 = mustLoadToken(grid.token0);
    const token1 = mustLoadToken(grid.token1);
    const locked0Decimal = toAmountDecimal(grid.locked0, token0.decimals);
    const locked1Decimal = toAmountDecimal(grid.locked1, token1.decimals);
    grid.tvlUSD = locked0Decimal.times(token0.priceUSD).plus(locked1Decimal.times(token1.priceUSD));
    grid.unsettledOrderCount = grid.unsettledOrderCount.minus(BIG_INT_ONE);
    grid.save();

    protocol.tvlUSD = protocol.tvlUSD.plus(grid.tvlUSD);
    protocol.save();

    // Update token
    let token: Token;
    if (bundle.zero) {
        token = token0;
    } else {
        token = token1;
    }
    token.totalLocked = token.totalLocked.plus(event.params.makerAmountRemaining);
    token.totalLockedUSD = toAmountDecimal(token.totalLocked, token.decimals).times(token.priceUSD);
    token.save();

    // update candles
    let updateGridCandlesParam: updateGridCandlesParam = {
        event: event,
        price: grid.price0,
        volume0: BIG_INT_ZERO,
        volume1: BIG_INT_ZERO,
        volumeUSD: BIG_DECIMAL_ZERO,
        fee0: BIG_INT_ZERO,
        fee1: BIG_INT_ZERO,
        feeUSD: BIG_DECIMAL_ZERO,
        tvlUSD: grid.tvlUSD
    };
    updateGridCandles(updateGridCandlesParam);

    let updateTokenCandlesParam: updateTokenCandlesParam = {
        event: event,
        tokenID: token.id,
        price: token.priceUSD,
        volume: BIG_INT_ZERO,
        volumeUSD: BIG_DECIMAL_ZERO,
        fee: BIG_INT_ZERO,
        feeUSD: BIG_DECIMAL_ZERO,
        totalLocked: token.totalLocked,
        totalLockedUSD: token.totalLockedUSD
    };
    updateTokenCandles(updateTokenCandlesParam);
}

export function handleSettleMakerOrder(event: SettleMakerOrderEvent): void {
    // Update protocol stats
    const protocol = mustLoadProtocol();
    protocol.unsettledOrderCount = protocol.unsettledOrderCount.minus(BIG_INT_ONE);
    saveUniqueTransactionIfRequired(protocol, event);
    protocol.save();

    // Create a new user if one doesn't exist
    const uniqueUser = loadOrCreateUser(protocol, event.transaction.from, event.block.number, event.block.timestamp);
    uniqueUser.save();

    const order = Order.load(event.address.toHexString() + ":" + event.params.orderId.toString()) as Order;
    const grid = Grid.load(order.grid) as Grid;
    const token0 = Token.load(grid.token0) as Token;
    const token1 = Token.load(grid.token1) as Token;
    // Update order
    order.settled = true;
    order.settledBlock = event.block.number;
    order.settledTimestamp = event.block.timestamp;
    order.settledTxHash = event.transaction.hash;
    order.makerAmountOut = event.params.makerAmountOut;
    order.takerAmountOut = event.params.takerAmountOut;
    order.takerFeeAmountOut = event.params.takerFeeAmountOut;
    // Fill price
    const filled = order.makerAmountIn.minus(order.makerAmountOut);
    if (filled.gt(BIG_INT_ZERO) && event.params.takerAmountOut.gt(BIG_INT_ZERO)) {
        if (order.zero) {
            order.avgPrice = calculatePrice0(
                event.params.takerAmountOut.leftShift(96).div(filled),
                token0.decimals,
                token1.decimals
            );
        } else {
            order.avgPrice = calculatePrice0(
                filled.leftShift(96).div(event.params.takerAmountOut),
                token0.decimals,
                token1.decimals
            );
        }
    }
    order.save();

    // Update bundle
    const bundle = Bundle.load(order.bundle) as Bundle;
    bundle.takerAmountRemaining = bundle.takerAmountRemaining.minus(event.params.takerAmountOut);
    bundle.takerFeeAmountRemaining = bundle.takerFeeAmountRemaining.minus(event.params.takerFeeAmountOut);
    bundle.save();

    // Create a new transaction history
    let amountUSD: BigDecimal;
    const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
    tx.grid = grid.id;
    tx.type = "SettleMakerOrder";
    tx.sender = event.transaction.from;
    tx.recipient = event.transaction.from;
    if (order.zero) {
        tx.amount0 = event.params.makerAmountOut;
        tx.amount1 = event.params.takerAmountOut;
        const makerAmountUSD = toAmountDecimal(event.params.makerAmountOut, token0.decimals).times(token0.priceUSD);
        const takerAmountUSD = toAmountDecimal(event.params.takerAmountOut, token1.decimals).times(token1.priceUSD);
        const feeUSD = toAmountDecimal(event.params.takerFeeAmountOut, token1.decimals).times(token1.priceUSD);
        amountUSD = makerAmountUSD.plus(takerAmountUSD).plus(feeUSD);
    } else {
        tx.amount0 = event.params.takerAmountOut;
        tx.amount1 = event.params.makerAmountOut;
        const makerAmountUSD = toAmountDecimal(event.params.makerAmountOut, token1.decimals).times(token1.priceUSD);
        const takerAmountUSD = toAmountDecimal(event.params.takerAmountOut, token0.decimals).times(token0.priceUSD);
        const feeUSD = toAmountDecimal(event.params.takerFeeAmountOut, token0.decimals).times(token0.priceUSD);
        amountUSD = makerAmountUSD.plus(takerAmountUSD).plus(feeUSD);
    }
    tx.amountTakerFee = event.params.takerFeeAmountOut;
    tx.amountUSD = amountUSD;
    tx.avgPrice = order.avgPrice;
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.save();

    // no need to update grid or token values, they are updated in ChangeBundleForSettleOrder
}

export function handleSwap(event: SwapEvent): void {
    const grid = mustLoadGrid(event.address);
    const token0 = mustLoadToken(grid.token0);
    const token1 = mustLoadToken(grid.token1);

    const amount0DecimalAbs = toAmountDecimal(event.params.amount0.abs(), token0.decimals);
    const amount1DecimalAbs = toAmountDecimal(event.params.amount1.abs(), token1.decimals);
    const amount0USD = amount0DecimalAbs.times(token0.priceUSD);
    const amount1USD = amount1DecimalAbs.times(token1.priceUSD);
    const volumeUSD = calculateVolume(amount0USD, amount1USD);

    const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
    protocol.swapCount = protocol.swapCount.plus(BIG_INT_ONE);
    saveUniqueTransactionIfRequired(protocol, event);
    protocol.volumeUSD = protocol.volumeUSD.plus(volumeUSD);
    protocol.tvlUSD = protocol.tvlUSD.minus(grid.tvlUSD);

    // Update user stats
    const uniqueUser = loadOrCreateUser(protocol, event.transaction.from, event.block.number, event.block.timestamp);
    uniqueUser.swapCount = uniqueUser.swapCount.plus(BIG_INT_ONE);
    uniqueUser.save();

    // Update grid
    grid.boundary = event.params.boundary;
    grid.priceX96 = event.params.priceX96;
    grid.price0 = calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals);
    grid.price1 = calculatePrice1(grid.price0);
    grid.volume0 = grid.volume0.plus(event.params.amount0.abs());
    grid.volume1 = grid.volume1.plus(event.params.amount1.abs());
    grid.volumeUSD = grid.volumeUSD.plus(volumeUSD);
    if (event.params.amount0.lt(BIG_INT_ZERO)) {
        grid.locked0 = grid.locked0.plus(event.params.amount0);
    }
    if (event.params.amount1.lt(BIG_INT_ZERO)) {
        grid.locked1 = grid.locked1.plus(event.params.amount1);
    }
    grid.swapCount = grid.swapCount.plus(BIG_INT_ONE);
    grid.save();

    // Update tokens
    token0.priceUSD = findUSDPerToken(token0);
    token0.volume = token0.volume.plus(event.params.amount0.abs());
    token0.volumeUSD = token0.volumeUSD.plus(volumeUSD);
    if (event.params.amount0.lt(BIG_INT_ZERO)) {
        token0.totalLocked = token0.totalLocked.plus(event.params.amount0);
        token0.totalLockedUSD = toAmountDecimal(token0.totalLocked, token0.decimals).times(token0.priceUSD);
    }
    token0.save();

    token1.priceUSD = findUSDPerToken(token1);
    token1.volume = token1.volume.plus(event.params.amount1.abs());
    token1.volumeUSD = token1.volumeUSD.plus(volumeUSD);
    if (event.params.amount1.lt(BIG_INT_ZERO)) {
        token1.totalLocked = token1.totalLocked.plus(event.params.amount1);
        token1.totalLockedUSD = toAmountDecimal(token1.totalLocked, token1.decimals).times(token1.priceUSD);
    }
    token1.save();

    let locked0Decimal = toAmountDecimal(grid.locked0, token0.decimals);
    let locked1Decimal = toAmountDecimal(grid.locked1, token1.decimals);
    grid.tvlUSD = locked0Decimal.times(token0.priceUSD).plus(locked1Decimal.times(token1.priceUSD));
    grid.save();

    protocol.tvlUSD = protocol.tvlUSD.plus(grid.tvlUSD);
    protocol.save();

    // Skip kline update if swap amount is zero
    if (event.params.amount0.equals(BIG_INT_ZERO) || event.params.amount1.equals(BIG_INT_ZERO)) {
        log.debug("Swap amount is zero, skip kline update, tx hash {}", [event.transaction.hash.toHexString()]);
        return;
    }

    let fee0 = BIG_INT_ZERO;
    let fee1 = BIG_INT_ZERO;
    let fee0USD = BIG_DECIMAL_ZERO;
    let fee1USD = BIG_DECIMAL_ZERO;
    let feeUSD: BigDecimal;
    if (event.params.amount0.gt(BIG_INT_ZERO)) {
        fee0 = event.params.amount0.times(BigInt.fromString(grid.takerFee.toString())).div(BigInt.fromI64(1000000));
        feeUSD = toAmountDecimal(fee0, token0.decimals).times(token0.priceUSD);
        fee0USD = feeUSD;
    } else {
        fee1 = event.params.amount1.times(BigInt.fromString(grid.takerFee.toString())).div(BigInt.fromI64(1000000));
        feeUSD = toAmountDecimal(fee1, token1.decimals).times(token1.priceUSD);
        fee1USD = feeUSD;
    }
    protocol.feeUSD = protocol.feeUSD.plus(feeUSD);
    protocol.save();

    // Create a new transaction history
    const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
    tx.grid = grid.id;
    tx.type = "Swap";
    tx.sender = event.transaction.from;
    tx.recipient = event.params.recipient;
    tx.amount0 = event.params.amount0;
    tx.amount1 = event.params.amount1;
    tx.amountTakerFee = fee0.gt(BIG_INT_ZERO) ? fee0 : fee1;
    tx.amountUSD = volumeUSD;
    if (fee0.gt(BIG_INT_ZERO)) {
        if (event.params.amount0.minus(fee0).gt(BIG_INT_ZERO)) {
            tx.avgPrice = calculatePrice0(
                event.params.amount1
                    .abs()
                    .leftShift(96)
                    .div(event.params.amount0.minus(fee0)),
                token0.decimals,
                token1.decimals
            );
        }
    } else {
        if (event.params.amount0.abs().gt(BIG_INT_ZERO)) {
            tx.avgPrice = calculatePrice0(
                event.params.amount1
                    .minus(fee1)
                    .leftShift(96)
                    .div(event.params.amount0.abs()),
                token0.decimals,
                token1.decimals
            );
        }
    }
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.save();

    // update candles
    let updateGridCandlesParam: updateGridCandlesParam = {
        event: event,
        price: calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals),
        volume0: event.params.amount0.abs(),
        volume1: event.params.amount1.abs(),
        volumeUSD: volumeUSD,
        fee0: fee0,
        fee1: fee1,
        feeUSD: feeUSD,
        tvlUSD: grid.tvlUSD
    };
    updateGridCandles(updateGridCandlesParam);

    let updateToken0CandlesParam: updateTokenCandlesParam = {
        event: event,
        tokenID: token0.id,
        price: token0.priceUSD,
        volume: event.params.amount0.abs(),
        volumeUSD: volumeUSD,
        fee: fee0,
        feeUSD: fee0USD,
        totalLocked: token0.totalLocked,
        totalLockedUSD: token0.totalLockedUSD
    };
    updateTokenCandles(updateToken0CandlesParam);

    let updateToken1CandlesParam: updateTokenCandlesParam = {
        event: event,
        tokenID: token1.id,
        price: token1.priceUSD,
        volume: event.params.amount1.abs(),
        volumeUSD: volumeUSD,
        fee: fee1,
        feeUSD: fee1USD,
        totalLocked: token1.totalLocked,
        totalLockedUSD: token1.totalLockedUSD
    };
    updateTokenCandles(updateToken1CandlesParam);
}

export function handleChangeBundleForSwap(event: ChangeBundleForSwapEvent): void {
    // Update bundle
    const bundle = Bundle.load(event.address.toHexString() + ":" + event.params.bundleId.toString()) as Bundle;
    bundle.makerAmountRemaining = bundle.makerAmountRemaining.plus(event.params.makerAmountRemaining);
    bundle.takerAmountRemaining = bundle.takerAmountRemaining.plus(event.params.amountIn);
    bundle.takerFeeAmountRemaining = bundle.takerFeeAmountRemaining.plus(event.params.takerFeeAmountIn);
    if (bundle.makerAmountRemaining.equals(BigInt.zero())) {
        bundle.fullyFilledBlock = event.block.number;
        bundle.fullyFilledTimestamp = event.block.timestamp;
    }
    bundle.save();

    // Update boundary
    const boundary = Boundary.load(
        event.address.toHexString() + ":" + bundle.zero.toString() + ":" + bundle.boundaryLower.toString()
    ) as Boundary;
    boundary.makerAmountRemaining = boundary.makerAmountRemaining.plus(event.params.makerAmountRemaining);
    boundary.save();

    // no need to update grid or token values, they are updated in Swap
}

export function handleCollect(event: CollectEvent): void {
    const protocol = mustLoadProtocol();
    if (saveUniqueTransactionIfRequired(protocol, event)) {
        protocol.save();
    }
    const grid = mustLoadGrid(event.address);
    const token0 = mustLoadToken(grid.token0);
    const token1 = mustLoadToken(grid.token1);
    const amount0USD = toAmountDecimal(event.params.amount0, token0.decimals).times(token0.priceUSD);
    const amount1USD = toAmountDecimal(event.params.amount1, token1.decimals).times(token1.priceUSD);

    // Create a new transaction history
    const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
    tx.grid = event.address.toHexString();
    tx.type = "Collect";
    tx.sender = event.transaction.from;
    tx.recipient = event.params.recipient;
    tx.amount0 = event.params.amount0;
    tx.amount1 = event.params.amount1;
    tx.amountTakerFee = BIG_INT_ZERO;
    tx.amountUSD = amount0USD.plus(amount1USD);
    tx.avgPrice = BIG_DECIMAL_ZERO;
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.save();
}

export function handleFlash(event: FlashEvent): void {
    const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
    protocol.flashCount = protocol.flashCount.plus(BIG_INT_ONE);
    saveUniqueTransactionIfRequired(protocol, event);
    protocol.save();

    const grid = mustLoadGrid(event.address);
    grid.flashCount = grid.flashCount.plus(BIG_INT_ONE);
    grid.save();

    const token0 = mustLoadToken(grid.token0);
    const token1 = mustLoadToken(grid.token1);
    const amountUSD = toAmountDecimal(event.params.amount0, token0.decimals)
        .times(token0.priceUSD)
        .plus(toAmountDecimal(event.params.amount1, token1.decimals).times(token1.priceUSD));

    // Update user stats
    const uniqueUser = loadOrCreateUser(protocol, event.transaction.from, event.block.number, event.block.timestamp);
    uniqueUser.flashCount = uniqueUser.flashCount.plus(BIG_INT_ONE);
    uniqueUser.save();

    // Create a new transaction history
    const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
    tx.grid = event.address.toHexString();
    tx.type = "Flash";
    tx.sender = event.transaction.from;
    tx.recipient = event.params.recipient;
    tx.amount0 = event.params.amount0;
    tx.amount1 = event.params.amount1;
    tx.amountTakerFee = BIG_INT_ZERO;
    tx.avgPrice = BIG_DECIMAL_ZERO;
    tx.blockNumber = event.block.number;
    tx.blockTimestamp = event.block.timestamp;
    tx.transactionHash = event.transaction.hash;
    tx.amountUSD = amountUSD;
    tx.save();
}

function calculateVolume(volume0: BigDecimal, volume1: BigDecimal): BigDecimal {
    if (volume0.equals(BIG_DECIMAL_ZERO)) {
        return volume1;
    } else if (volume1.equals(BIG_DECIMAL_ZERO)) {
        return volume0;
    } else {
        return volume0.plus(volume1).div(BigDecimal.fromString("2"));
    }
}

function calculatePrice0(priceX96: BigInt, decimals0: i32, decimals1: i32): BigDecimal {
    return priceX96
        .toBigDecimal()
        .div(
            BigInt.fromI32(2)
                .pow(96)
                .toBigDecimal()
        )
        .times(
            BigInt.fromI32(10)
                .pow(u8(decimals0))
                .toBigDecimal()
        )
        .div(
            BigInt.fromI32(10)
                .pow(u8(decimals1))
                .toBigDecimal()
        );
}

function calculatePrice1(price0: BigDecimal): BigDecimal {
    return BIG_DECIMAL_ONE.div(price0);
}
