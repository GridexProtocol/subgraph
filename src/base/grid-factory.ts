import {
    GridCreated as GridCreatedEvent,
    ResolutionEnabled as ResolutionEnabledEvent
} from "../../generated/GridFactory/GridFactory";
import {Grid as GridRegistry} from "../../generated/templates";
import {ERC20} from "../../generated/GridFactory/ERC20";
import {ERC20Bytes} from "../../generated/GridFactory/ERC20Bytes";
import {Grid, GridexProtocol, Resolution, Token} from "../../generated/schema";
import {Address, BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {log} from "@graphprotocol/graph-ts";

export function handleGridCreated(event: GridCreatedEvent): void {
    const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
    protocol.gridCount = protocol.gridCount.plus(BigInt.fromI32(1));
    protocol.save();

    let token0 = Token.load(event.params.token0.toHexString());
    if (token0 == null) {
        token0 = buildEmptyToken(event.params.token0);
    }
    token0.gridCount = token0.gridCount.plus(BigInt.fromI32(1));
    token0.save();

    let token1 = Token.load(event.params.token1.toHexString());
    if (token1 == null) {
        token1 = buildEmptyToken(event.params.token1);
    }
    token1.gridCount = token1.gridCount.plus(BigInt.fromI32(1));
    token1.save();

    const resolution = Resolution.load(event.params.resolution.toString());

    let entity = new Grid(event.params.grid.toHexString());
    entity.token0 = token0.id;
    entity.token1 = token1.id;
    entity.resolution = event.params.resolution;
    entity.takerFee = resolution!.takerFee;
    entity.boundary = 0;
    entity.priceX96 = BigInt.fromI32(0);
    entity.price0 = BigDecimal.fromString("0");
    entity.price1 = BigDecimal.fromString("0");
    entity.priceOracleCapacity = 0;
    entity.volume0 = BigInt.fromI32(0);
    entity.volume1 = BigInt.fromI32(0);
    entity.locked0 = BigInt.fromI32(0);
    entity.locked1 = BigInt.fromI32(0);
    entity.orderCount = BigInt.fromI32(0);
    entity.flashCount = BigInt.fromI32(0);
    entity.swapCount = BigInt.fromI32(0);

    entity.save();

    GridRegistry.create(event.params.grid);
}

export function handleResolutionEnabled(event: ResolutionEnabledEvent): void {
    let protocol = GridexProtocol.load("GridexProtocol");
    if (protocol == null) {
        protocol = new GridexProtocol("GridexProtocol");
        protocol.factory = event.address.toHexString();
        protocol.gridCount = BigInt.fromI32(0);
        protocol.orderCount = BigInt.fromI32(0);
        protocol.flashCount = BigInt.fromI32(0);
        protocol.swapCount = BigInt.fromI32(0);
    }
    protocol.save();

    let entity = new Resolution(event.params.resolution.toString());
    entity.resolution = event.params.resolution;
    entity.takerFee = event.params.takerFee;
    entity.save();
}

function buildEmptyToken(address: Address): Token {
    let token = new Token(address.toHexString());
    const metadata = fetchTokenMetadata(address);
    token.name = metadata.name;
    token.symbol = metadata.symbol;
    token.decimals = metadata.decimals;
    token.volume = BigInt.fromI32(0);
    token.gridCount = BigInt.fromI32(0);
    token.totalLocked = BigInt.fromI32(0);
    return token;
}

function fetchTokenMetadata(address: Address): TokenMetadata {
    let name = "Unknown";
    let symbol = "UNKNOWN";
    let decimals = 18;

    let contract = ERC20.bind(address);
    let bytesContract = ERC20Bytes.bind(address);

    let nameCall = contract.try_name();

    if (nameCall.reverted) {
        log.warning("Reverted on name call for token {}", [address.toHexString()]);
        let bytesNameCall = bytesContract.try_name();
        if (bytesNameCall.reverted) {
            log.warning("Reverted on bytes name call for token {}", [address.toHexString()]);
            name = knownTokenMetadata(address).name;
            log.warning("Using known name {} for token {}", [name, address.toHexString()]);
        } else {
            name = bytesNameCall.value.toHexString();
        }
    } else {
        name = nameCall.value;
    }

    let symbolCall = contract.try_symbol();
    if (symbolCall.reverted) {
        log.warning("Reverted on symbol call for token {}", [address.toHexString()]);
        let bytesSymbolCall = bytesContract.try_symbol();
        if (bytesSymbolCall.reverted) {
            log.warning("Reverted on bytes symbol call for token {}", [address.toHexString()]);
            symbol = knownTokenMetadata(address).symbol;
            log.warning("Using known symbol {} for token {}", [symbol, address.toHexString()]);
        } else {
            symbol = bytesSymbolCall.value.toHexString();
        }
    } else {
        symbol = symbolCall.value;
    }

    let decimalsCall = contract.try_decimals();
    if (decimalsCall.reverted) {
        log.warning("Reverted on decimals call for token {}", [address.toHexString()]);
        decimals = knownTokenMetadata(address).decimals;
        log.warning("Using known decimals {} for token {}", [decimals.toString(), address.toHexString()]);
    } else {
        decimals = decimalsCall.value;
    }
    return {name, symbol, decimals};
}

function knownTokenMetadata(address: Address): TokenMetadata {
    const addressHexString = address.toHexString();
    if (addressHexString == Address.fromString("0xe0b7927c4af23765cb51314a0e0521a9645f0e2a").toHexString()) {
        return {name: "DigixDAO", symbol: "DGD", decimals: 9};
    } else if (addressHexString == Address.fromString("0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9").toHexString()) {
        return {name: "Aave Token", symbol: "AAVE", decimals: 18};
    } else if (addressHexString == Address.fromString("0xeb9951021698b42e4399f9cbb6267aa35f82d59d").toHexString()) {
        return {name: "Lif", symbol: "LIF", decimals: 18};
    } else if (addressHexString == Address.fromString("0xbdeb4b83251fb146687fa19d1c660f99411eefe3").toHexString()) {
        return {name: "Savedroid", symbol: "SVD", decimals: 18};
    } else if (addressHexString == Address.fromString("0xbb9bc244d798123fde783fcc1c72d3bb8c189413").toHexString()) {
        return {name: "TheDAO", symbol: "TheDAO", decimals: 16};
    } else if (addressHexString == Address.fromString("0x38c6a68304cdefb9bec48bbfaaba5c5b47818bb2").toHexString()) {
        return {name: "HPBCoin", symbol: "HPB", decimals: 18};
    } else {
        return {name: "Unknown", symbol: "UNKNOWN", decimals: 18};
    }
}

class TokenMetadata {
    name: string;
    symbol: string;
    decimals: i32;
}
