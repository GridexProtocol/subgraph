import {
  ChangeBundleForSettleOrder as ChangeBundleForSettleOrderEvent,
  ChangeBundleForSwap as ChangeBundleForSwapEvent,
  Collect as CollectEvent,
  Flash as FlashEvent,
  Initialize as InitializeEvent,
  PlaceMakerOrder as PlaceMakerOrderEvent,
  SettleMakerOrder as SettleMakerOrderEvent,
  Swap as SwapEvent,
} from "../../generated/templates/Grid/Grid";
import { Grid, Token, Bundle, Order, Boundary, TransactionHistory, GridexProtocol } from "../../generated/schema";
import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";
import { updateGridCandle } from "./candle";

export function handleInitialize(event: InitializeEvent): void {
  const grid = mustLoadGrid(event.address);
  const token0 = mustLoadToken(grid.token0);
  const token1 = mustLoadToken(grid.token1);
  grid.boundary = event.params.boundary;
  grid.priceX96 = event.params.priceX96;
  grid.price0 = calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals);
  grid.price1 = calculatePrice1(grid.price0);
  grid.save();
}

export function handlePlaceMakerOrder(event: PlaceMakerOrderEvent): void {
  const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
  protocol.orderCount = protocol.orderCount.plus(BigInt.fromI32(1));
  protocol.save();

  const grid = mustLoadGrid(event.address);
  // Create a new bundle if one doesn't exist
  let bundle = Bundle.load(event.address.toHexString() + ":" + event.params.bundleId.toString());
  if (bundle == null) {
    bundle = new Bundle(event.address.toHexString() + ":" + event.params.bundleId.toString());
    bundle.grid = grid.id;
    bundle.bundleId = event.params.bundleId;
    bundle.boundaryLower = event.params.boundaryLower;
    bundle.zero = event.params.zero;
    bundle.makerAmountTotal = BigInt.fromI32(0);
    bundle.makerAmountRemaining = BigInt.fromI32(0);
    bundle.takerAmountRemaining = BigInt.fromI32(0);
    bundle.takerFeeAmountRemaining = BigInt.fromI32(0);
    bundle.orderCount = BigInt.fromI32(0);
  }
  bundle.makerAmountTotal = bundle.makerAmountTotal.plus(event.params.amount);
  bundle.makerAmountRemaining = bundle.makerAmountRemaining.plus(event.params.amount);
  bundle.orderCount = bundle.orderCount.plus(BigInt.fromI32(1));
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
    boundary.makerAmountRemaining = BigInt.fromI32(0);
  }
  boundary.makerAmountRemaining = boundary.makerAmountRemaining.plus(event.params.amount);
  boundary.save();

  // Update grid
  if (event.params.zero) {
    grid.locked0 = grid.locked0.plus(event.params.amount);
  } else {
    grid.locked1 = grid.locked1.plus(event.params.amount);
  }
  grid.orderCount = grid.orderCount.plus(BigInt.fromI32(1));
  grid.save();

  // Update token
  let token: Token;
  if (event.params.zero) {
    token = mustLoadToken(grid.token0);
  } else {
    token = mustLoadToken(grid.token1);
  }
  token.totalLocked = token.totalLocked.plus(event.params.amount);
  token.save();

  // Create a new order
  const order = new Order(event.address.toHexString() + ":" + event.params.orderId.toString());
  order.grid = grid.id;
  order.orderId = event.params.orderId;
  order.bundle = bundle.id;
  order.owner = event.params.recipient;
  order.zero = event.params.zero;
  order.settled = false;
  order.boundaryLower = event.params.boundaryLower;
  order.makerAmountIn = event.params.amount;
  order.makerAmountOut = BigInt.fromI32(0);
  order.takerAmountOut = BigInt.fromI32(0);
  order.takerFeeAmountOut = BigInt.fromI32(0);
  order.avgPrice = BigDecimal.fromString("0");
  order.save();

  // Create a new transaction history
  const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
  tx.grid = grid.id;
  tx.type = "PlaceMakerOrder";
  tx.sender = event.transaction.from;
  tx.recipient = event.params.recipient;
  if (event.params.zero) {
    tx.amount0 = event.params.amount;
    tx.amount1 = BigInt.fromI32(0);
  } else {
    tx.amount0 = BigInt.fromI32(0);
    tx.amount1 = event.params.amount;
  }
  tx.amountTakerFee = BigInt.fromI32(0);
  tx.avgPrice = BigDecimal.fromString("0");
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}

export function handleChangeBundleForSettleOrder(event: ChangeBundleForSettleOrderEvent): void {
  const grid = mustLoadGrid(event.address);
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

  // Update boundary
  if (bundle.zero) {
    grid.locked0 = grid.locked0.plus(event.params.makerAmountRemaining);
  } else {
    grid.locked1 = grid.locked1.plus(event.params.makerAmountRemaining);
  }
  grid.save();

  // Update token
  let token: Token;
  if (bundle.zero) {
    token = mustLoadToken(grid.token0);
  } else {
    token = mustLoadToken(grid.token1);
  }
  token.totalLocked = token.totalLocked.plus(event.params.makerAmountRemaining);
  token.save();
}

export function handleSettleMakerOrder(event: SettleMakerOrderEvent): void {
  const order = Order.load(event.address.toHexString() + ":" + event.params.orderId.toString()) as Order;
  const grid = Grid.load(order.grid) as Grid;
  const token0 = Token.load(grid.token0) as Token;
  const token1 = Token.load(grid.token1) as Token;
  // Update order
  order.settled = true;
  order.makerAmountOut = event.params.makerAmountOut;
  order.takerAmountOut = event.params.takerAmountOut;
  order.takerFeeAmountOut = event.params.takerFeeAmountOut;
  // Fill price
  const filled = order.makerAmountIn.minus(order.makerAmountOut);
  if (filled.gt(BigInt.fromI32(0))) {
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
  const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
  tx.grid = grid.id;
  tx.type = "SettleMakerOrder";
  tx.sender = event.transaction.from;
  tx.recipient = event.transaction.from;
  if (order.zero) {
    tx.amount0 = event.params.makerAmountOut;
    tx.amount1 = event.params.takerAmountOut;
  } else {
    tx.amount0 = event.params.takerAmountOut;
    tx.amount1 = event.params.makerAmountOut;
  }
  tx.amountTakerFee = event.params.takerFeeAmountOut;
  tx.avgPrice = order.avgPrice;
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();

  // no need to update grid or token values, they are updated in ChangeBundleForSettleOrder
}

export function handleSwap(event: SwapEvent): void {
  const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
  protocol.swapCount = protocol.swapCount.plus(BigInt.fromI32(1));
  protocol.save();

  const grid = mustLoadGrid(event.address);
  const token0 = mustLoadToken(grid.token0);
  const token1 = mustLoadToken(grid.token1);
  // Update grid
  grid.boundary = event.params.boundary;
  grid.priceX96 = event.params.priceX96;
  grid.price0 = calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals);
  grid.price1 = calculatePrice1(grid.price0);
  grid.volume0 = grid.volume0.plus(event.params.amount0.abs());
  grid.volume1 = grid.volume1.plus(event.params.amount1.abs());
  if (event.params.amount0.lt(BigInt.fromI32(0))) {
    grid.locked0 = grid.locked0.plus(event.params.amount0);
  } else {
    grid.locked1 = grid.locked1.plus(event.params.amount1);
  }
  grid.swapCount = grid.swapCount.plus(BigInt.fromI32(1));
  grid.save();

  // Update tokens
  token0.volume = token0.volume.plus(event.params.amount0.abs());
  if (event.params.amount0.lt(BigInt.fromI32(0))) {
    token0.totalLocked = token0.totalLocked.plus(event.params.amount0);
  }
  token0.save();

  token1.volume = token1.volume.plus(event.params.amount1.abs());
  if (event.params.amount1.lt(BigInt.fromI32(0))) {
    token1.totalLocked = token1.totalLocked.plus(event.params.amount1);
  }
  token1.save();

  // Skip kline update if swap amount is zero
  if (event.params.amount0.equals(BigInt.fromI32(0)) || event.params.amount1.equals(BigInt.fromI32(0))) {
    log.debug("Swap amount is zero, skip kline update, tx hash {}", [event.transaction.hash.toHexString()]);
    return;
  }

  let fee0 = BigInt.fromI32(0);
  let fee1 = BigInt.fromI32(0);
  if (event.params.amount0.gt(BigInt.fromI32(0))) {
    fee0 = event.params.amount0.times(BigInt.fromString(grid.takerFee.toString())).div(BigInt.fromI64(1000000));
  } else {
    fee1 = event.params.amount1.times(BigInt.fromString(grid.takerFee.toString())).div(BigInt.fromI64(1000000));
  }

  // Create a new transaction history
  const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
  tx.grid = grid.id;
  tx.type = "Swap";
  tx.sender = event.transaction.from;
  tx.recipient = event.params.recipient;
  tx.amount0 = event.params.amount0;
  tx.amount1 = event.params.amount1;
  tx.amountTakerFee = fee0.gt(BigInt.fromI32(0)) ? fee0 : fee1;
  if (fee0.gt(BigInt.fromI32(0))) {
    tx.avgPrice = calculatePrice0(
      event.params.amount1
        .abs()
        .leftShift(96)
        .div(event.params.amount0.minus(fee0)),
      token0.decimals,
      token1.decimals
    );
  } else {
    tx.avgPrice = calculatePrice0(
      event.params.amount1
        .minus(fee1)
        .leftShift(96)
        .div(event.params.amount0.abs()),
      token0.decimals,
      token1.decimals
    );
  }
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();

  // Update grid candle
  updateGridCandle(event, calculatePrice0(event.params.priceX96, token0.decimals, token1.decimals), fee0, fee1);
}

export function handleChangeBundleForSwap(event: ChangeBundleForSwapEvent): void {
  const bundle = Bundle.load(event.address.toHexString() + ":" + event.params.bundleId.toString()) as Bundle;
  // Update bundle
  bundle.makerAmountRemaining = bundle.makerAmountRemaining.plus(event.params.makerAmountRemaining);
  bundle.takerAmountRemaining = bundle.takerAmountRemaining.plus(event.params.amountIn);
  bundle.takerFeeAmountRemaining = bundle.takerFeeAmountRemaining.plus(event.params.takerFeeAmountIn);
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
  // Create a new transaction history
  const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
  tx.grid = event.address.toHexString();
  tx.type = "Collect";
  tx.sender = event.transaction.from;
  tx.recipient = event.params.recipient;
  tx.amount0 = event.params.amount0;
  tx.amount1 = event.params.amount1;
  tx.amountTakerFee = BigInt.fromI32(0);
  tx.avgPrice = BigDecimal.fromString("0");
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}

export function handleFlash(event: FlashEvent): void {
  const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
  protocol.flashCount = protocol.flashCount.plus(BigInt.fromI32(1));
  protocol.save();

  const grid = mustLoadGrid(event.address);
  grid.flashCount = grid.flashCount.plus(BigInt.fromI32(1));
  grid.save();

  // Create a new transaction history
  const tx = new TransactionHistory(event.transaction.hash.toHexString() + ":" + event.logIndex.toString());
  tx.grid = event.address.toHexString();
  tx.type = "Flash";
  tx.sender = event.transaction.from;
  tx.recipient = event.params.recipient;
  tx.amount0 = event.params.amount0;
  tx.amount1 = event.params.amount1;
  tx.amountTakerFee = BigInt.fromI32(0);
  tx.avgPrice = BigDecimal.fromString("0");
  tx.blockNumber = event.block.number;
  tx.blockTimestamp = event.block.timestamp;
  tx.transactionHash = event.transaction.hash;
  tx.save();
}

function mustLoadToken(address: string): Token {
  return Token.load(address) as Token;
}

function mustLoadGrid(address: Address): Grid {
  return Grid.load(address.toHexString()) as Grid;
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
  return BigDecimal.fromString("1").div(price0);
}
