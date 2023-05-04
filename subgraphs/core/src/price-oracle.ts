import {IncreaseCapacity} from "../generated/PriceOracle/PriceOracle";
import {Grid, GridexProtocol} from "../generated/schema";
import {saveUniqueTransactionIfRequired} from "./helper/stats";

export function handleIncreaseCapacity(event: IncreaseCapacity): void {
    const protocol = GridexProtocol.load("GridexProtocol") as GridexProtocol;
    if (saveUniqueTransactionIfRequired(protocol, event)) {
        protocol.save();
    }

    const grid = Grid.load(event.params.grid.toHexString()) as Grid;
    grid.priceOracleCapacity = i32(event.params.capacityNew);
    grid.save();
}
