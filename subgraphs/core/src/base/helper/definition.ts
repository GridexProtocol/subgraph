import {BigDecimal} from "@graphprotocol/graph-ts";

// arbitrum-one static definitions
export const WHITELIST_TOKENS_ARBITRUM_ONE: string[] = [
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
    "0x4d15a3a2286d883af0aa1b3f21367843fac63e07", // TUSD
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0", // UNI
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // WBTC
    "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", // LINK
    "0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60", // LDO
    "0x9623063377ad1b27544c965ccd7342f7ea7e88c7", // GRT
    "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978", // CRV
    "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", // GMX
    "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8" // BAL
];
export const STABLE_COINS_ARBITRUM_ONE: string[] = [
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
    "0x4d15a3a2286d883af0aa1b3f21367843fac63e07", // TUSD
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" // DAI
];
export const MINIMUM_USD_LOCKED_ARBITRUM_ONE = BigDecimal.fromString("2000");

// goerli
export const WHITELIST_TOKENS_GOERLI: string[] = [
    "0x20f9a9125f669df3984e05e97772a4972b300a14", // CLUNA
    "0x519fbe8c8be03167600b2c1203e617b62b100ae1", // CUSD
    "0xa86ec7243f3fd2c70c89616a2aaa2fcad0948013", // CETH
    "0x303b35f48684bea50d0e7d1acddeaf78a7188798", // YUSDT
    "0x12cdc7333232f7e843aa5db94bd38858644cf0a1", // YUNI
    "0x3af186815b1684042155d36c86123c91a7a221bf", // YETH
    "0x23458bd252d00809ba969ab8a88a06b8d5c8fd25", // USDC
    "0xe8d81455e3abca8813f4f2643e0770a3ede44059", // USDT
    "0xfe9a6c8f51851649fb97ef829fb1c128ddd44c85", // DAI
    "0x2d935d1b05e3f9ac5582617e161132d72e1b442a", // BUSD
    "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6", // ETH
    "0xb0022c60a26c4735bfd0ffee738dcf9292eb03ce" // btc
];

export const STABLE_COINS_GOERLI: string[] = [
    "0x519fbe8c8be03167600b2c1203e617b62b100ae1", // CUSD
    "0x303b35f48684bea50d0e7d1acddeaf78a7188798", // YUSDT
    "0x33b5503f6e9523caf75935927648a357fa199f29", // YUSDC
    "0x23458bd252d00809ba969ab8a88a06b8d5c8fd25", // USDC
    "0xe8d81455e3abca8813f4f2643e0770a3ede44059", // USDT
    "0xfe9a6c8f51851649fb97ef829fb1c128ddd44c85", // DAI
    "0x2d935d1b05e3f9ac5582617e161132d72e1b442a" // BUSD
];
export const MINIMUM_USD_LOCKED_GOERLI = BigDecimal.fromString("200");
