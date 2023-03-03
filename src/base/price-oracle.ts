import {IncreaseCapacity} from "../../generated/PriceOracle/PriceOracle";
import {Grid} from "../../generated/schema";

function handleIncreaseCapacity(event: IncreaseCapacity): void {
    const grid = Grid.load(event.params.grid.toHexString()) as Grid;
    grid.priceOracleCapacity = i32(event.params.capacityNew);
    grid.save();
}
