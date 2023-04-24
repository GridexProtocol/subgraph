// loadOrCreateUser is used to load a unique user if it exists, or create a new one if it doesn't
//
// protocol.userCount is incremented if the user is new and saved, caller SHOULD NOT save protocol
import {GridexProtocol, UniqueTransaction, UniqueUser} from "../../generated/schema";
import {Address, BigInt, ethereum} from "@graphprotocol/graph-ts";
import {BIG_INT_ONE, BIG_INT_ZERO} from "./consts";

export function loadOrCreateUser(
    protocol: GridexProtocol,
    address: Address,
    block: BigInt,
    timestamp: BigInt
): UniqueUser {
    let uniqueUser = UniqueUser.load(address.toHexString());
    if (uniqueUser == null) {
        protocol.userCount = protocol.userCount.plus(BIG_INT_ONE);
        protocol.save();

        uniqueUser = new UniqueUser(address.toHexString());
        uniqueUser.orderCount = BIG_INT_ZERO;
        uniqueUser.flashCount = BIG_INT_ZERO;
        uniqueUser.swapCount = BIG_INT_ZERO;
        uniqueUser.createdBlock = block;
        uniqueUser.createdTimestamp = timestamp;
    }
    return uniqueUser as UniqueUser;
}

// saveUniqueTransactionIfRequired is used to save a unique transaction if it doesn't already exist
//
// protocol.txCount is incremented if the transaction is new, but not saved, caller MUST save protocol
export function saveUniqueTransactionIfRequired(protocol: GridexProtocol, event: ethereum.Event): boolean {
    let uniqueTransaction = UniqueTransaction.load(event.transaction.hash.toHexString());
    if (uniqueTransaction == null) {
        protocol.txCount = protocol.txCount.plus(BIG_INT_ONE);

        uniqueTransaction = new UniqueTransaction(event.transaction.hash.toHexString());
        uniqueTransaction.block = event.block.number;
        uniqueTransaction.timestamp = event.block.timestamp;
        uniqueTransaction.save();

        return true;
    }
    return false;
}
