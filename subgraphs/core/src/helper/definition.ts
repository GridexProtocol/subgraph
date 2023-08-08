import {BigDecimal} from "@graphprotocol/graph-ts";

// arbitrum-one static definitions
export const WHITELIST_TOKENS_ARBITRUM_ONE: string[] = [
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
    "0x4d15a3a2286d883af0aa1b3f21367843fac63e07", // TUSD
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
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

// base-goerli
export const WHITELIST_TOKENS_BASE_GOERLI: string[] = [
    "0x0bd15bf121d229e28a04f24ac671f96139e51665", // aUSDC
    "0xcb3a3420b850573907a283d3ad4080fcb30f9c97", // aETH
    "0x4200000000000000000000000000000000000006" // WETH
];

export const STABLE_COINS_BASE_GOERLI: string[] = [
    "0x0bd15bf121d229e28a04f24ac671f96139e51665" // aUSDC
];

export const MINIMUM_USD_LOCKED_BASE_GOERLI = BigDecimal.fromString("200");

// base-mainnet
export const WHITELIST_TOKENS_BASE_MAINNET: string[] = [
    "0x4200000000000000000000000000000000000006",
    "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb" // DAI
];

export const STABLE_COINS_BASE_MAINNET: string[] = [
    "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb" // DAI
];

export const MINIMUM_USD_LOCKED_BASE_MAINNET = BigDecimal.fromString("2000");

// ethereum
export const WHITELIST_TOKENS_MAINNET: string[] = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
    "0x5a98fcbea516cf06857215779fd812ca3bef1b32", // LDO
    "0xc944e90c64b2c07662a292be6244bdf05cda44a7", // GRT
    "0xd533a949740bb3306d119cc777fa900ba034cd52", // CRV
    "0xba100000625a3754423978a60c9317c58a424e3d", // BAL
    "0x4fabb145d64652a948d72533023f6e7a623c7c53", // BUSD
    "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // AAVE
    "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" // MATIC
];

export const STABLE_COINS_MAINNET: string[] = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
    "0x6b175474e89094c44da98b954eedeac495271d0f" // DAI
];

export const MINIMUM_USD_LOCKED_MAINNET = BigDecimal.fromString("2000");

// optimism
export const WHITELIST_TOKENS_OPTIMISM: string[] = [
    "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
    "0x4200000000000000000000000000000000000006", // WETH
    "0x6fd9d7ad17242c41f7131d257212c54a0e816691", // UNI
    "0x68f180fcce6836688e9084f035309e29bf0a2095", // WBTC
    "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6", // LINK
    "0xfdb794692724153d1488ccdbe0c56c252596735f", // LDO
    "0x0994206dfe8de6ec6920ff4d779b0d950605fb53", // CRV
    "0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921", // BAL
    "0x9c9e5fd8bbc25984b178fdce6117defa39d2db39", // BUSD
    "0x76fb31fb4af56892a25e32cfc43de717950c9278", // AAVE
    "0x4200000000000000000000000000000000000042" // OP
];

export const STABLE_COINS_OPTIMISM: string[] = [
    "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" // DAI
];

export const MINIMUM_USD_LOCKED_OPTIMISM = BigDecimal.fromString("2000");

// matic
export const WHITELIST_TOKENS_MATIC: string[] = [
    "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", // WBTC
    "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // WETH
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
    "0x0000000000000000000000000000000000001010", // MATIC
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7", // BUSD
    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
    "0xb33eaad8d922b1083446dc23f610c2567fb5180f", // UNI
    "0xb0897686c545045afc77cf20ec7a532e3120e0f1", // LINK
    "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39", // LINK Bridged
    "0xc3c7d422809852031b44ab29eec9f1eff2a58756", // LDO
    "0x172370d5cd63279efa6d502dab29171933a610af", // CRV
    "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3", // BAL
    "0xd6df932a45c0f255f85145f286ea0b292b21c90b" // AAVE
];

export const STABLE_COINS_MATIC: string[] = [
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063" // DAI
];

export const MINIMUM_USD_LOCKED_MATIC = BigDecimal.fromString("2000");
