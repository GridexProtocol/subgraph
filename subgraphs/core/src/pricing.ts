import {Address, BigDecimal} from "@graphprotocol/graph-ts";
import {Token} from "../generated/schema";
import {BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, NETWORK} from "./helper/consts";
import {
    MINIMUM_USD_LOCKED_ARBITRUM_ONE,
    MINIMUM_USD_LOCKED_BASE_GOERLI,
    MINIMUM_USD_LOCKED_GOERLI,
    MINIMUM_USD_LOCKED_MAINNET,
    MINIMUM_USD_LOCKED_OPTIMISM,
    MINIMUM_USD_LOCKED_MATIC,
    STABLE_COINS_ARBITRUM_ONE,
    STABLE_COINS_BASE_GOERLI,
    STABLE_COINS_GOERLI,
    STABLE_COINS_MAINNET,
    STABLE_COINS_OPTIMISM,
    STABLE_COINS_MATIC,
    WHITELIST_TOKENS_ARBITRUM_ONE,
    WHITELIST_TOKENS_BASE_GOERLI,
    WHITELIST_TOKENS_GOERLI,
    WHITELIST_TOKENS_MAINNET,
    WHITELIST_TOKENS_OPTIMISM,
    WHITELIST_TOKENS_MATIC
} from "./helper/definition";
import {mustLoadGrid, mustLoadToken} from "./helper/loader";
import {toAmountDecimal} from "./helper/util";

export function getWhiteListTokensDefinition(): string[] {
    if (NETWORK == "arbitrum-one") {
        return WHITELIST_TOKENS_ARBITRUM_ONE;
    } else if (NETWORK == "goerli") {
        return WHITELIST_TOKENS_GOERLI;
    } else if (NETWORK == "base-testnet") {
        return WHITELIST_TOKENS_BASE_GOERLI;
    } else if (NETWORK == "mainnet") {
        return WHITELIST_TOKENS_MAINNET;
    } else if (NETWORK == "optimism") {
        return WHITELIST_TOKENS_OPTIMISM;
    } else if (NETWORK == "matic") {
        return WHITELIST_TOKENS_MATIC;
    } else {
        throw new Error("unsupported network");
    }
}

function getStableCoinsDefinition(): string[] {
    if (NETWORK == "arbitrum-one") {
        return STABLE_COINS_ARBITRUM_ONE;
    } else if (NETWORK == "goerli") {
        return STABLE_COINS_GOERLI;
    } else if (NETWORK == "base-testnet") {
        return STABLE_COINS_BASE_GOERLI;
    } else if (NETWORK == "mainnet") {
        return STABLE_COINS_MAINNET;
    } else if (NETWORK == "optimism") {
        return STABLE_COINS_OPTIMISM;
    } else if (NETWORK == "matic") {
        return STABLE_COINS_MATIC;
    } else {
        throw new Error("unsupported network");
    }
}

function getMinimumUSDLockedDefinition(): BigDecimal {
    if (NETWORK == "arbitrum-one") {
        return MINIMUM_USD_LOCKED_ARBITRUM_ONE;
    } else if (NETWORK == "goerli") {
        return MINIMUM_USD_LOCKED_GOERLI;
    } else if (NETWORK == "base-testnet") {
        return MINIMUM_USD_LOCKED_BASE_GOERLI;
    } else if (NETWORK == "mainnet") {
        return MINIMUM_USD_LOCKED_MAINNET;
    } else if (NETWORK == "optimism") {
        return MINIMUM_USD_LOCKED_OPTIMISM;
    } else if (NETWORK == "matic") {
        return MINIMUM_USD_LOCKED_MATIC;
    } else {
        throw new Error("unsupported network");
    }
}

export function findUSDPerToken(token: Token): BigDecimal {
    const stableCoins = getStableCoinsDefinition();
    if (stableCoins.includes(token.id)) {
        return BIG_DECIMAL_ONE;
    }
    const whitelist = token.whitelistGrids;
    let largestLiquidityUSD = BIG_DECIMAL_ZERO;
    let priceSoFar = BIG_DECIMAL_ZERO;

    for (let i = 0; i < whitelist.length; i++) {
        const gridAddress = whitelist[i];
        const grid = mustLoadGrid(Address.fromString(gridAddress));
        if (grid.tvlUSD.gt(BIG_DECIMAL_ZERO)) {
            if (token.id == grid.token0) {
                // token1 is whitelist token
                const token1 = mustLoadToken(grid.token1);
                const locked1Decimal = toAmountDecimal(grid.locked1, token1.decimals);
                const usdLocked = locked1Decimal.times(token1.priceUSD);
                if (usdLocked.gt(largestLiquidityUSD) && usdLocked.gt(getMinimumUSDLockedDefinition())) {
                    largestLiquidityUSD = usdLocked;
                    priceSoFar = grid.price0.times(token1.priceUSD);
                }
            }
            if (token.id == grid.token1) {
                // token0 is whitelist token
                const token0 = mustLoadToken(grid.token0);
                const locked0Decimal = toAmountDecimal(grid.locked0, token0.decimals);
                const usdLocked = locked0Decimal.times(token0.priceUSD);
                if (usdLocked.gt(largestLiquidityUSD) && usdLocked.gt(getMinimumUSDLockedDefinition())) {
                    largestLiquidityUSD = usdLocked;
                    priceSoFar = grid.price1.times(token0.priceUSD);
                }
            }
        }
    }
    return priceSoFar;
}
