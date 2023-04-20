import {Grid, GridexProtocol, Token} from "../../../generated/schema";
import {Address} from "@graphprotocol/graph-ts";

export function mustLoadProtocol(): GridexProtocol {
    return GridexProtocol.load("GridexProtocol") as GridexProtocol;
}

export function mustLoadToken(address: string): Token {
    return Token.load(address) as Token;
}

export function mustLoadGrid(address: Address): Grid {
    return Grid.load(address.toHexString()) as Grid;
}
