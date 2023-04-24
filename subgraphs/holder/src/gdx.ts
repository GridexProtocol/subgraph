import {Transfer as TransferEvent} from "../generated/GDX/GDX";
import {Holder, Overview} from "../generated/schema";
import {Address, BigDecimal, BigInt, store} from "@graphprotocol/graph-ts";
import {BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO} from "../../core/src/helper/consts";

export function handleTransfer(event: TransferEvent): void {
    const value = event.params.value;
    if (value == BIG_INT_ZERO) {
        return;
    }
    const from = event.params.from;
    const to = event.params.to;
    const amount = value.toBigDecimal().div(BigDecimal.fromString("1e18"));

    handleOverview(from, to, amount);
    handleHolder(from, amount.neg());
    handleHolder(to, amount);
}

function handleOverview(from: Address, to: Address, amount: BigDecimal): void {
    if (from != Address.zero() && to != Address.zero()) {
        return;
    }
    let overview = loadOrNewOverview();
    if (from == Address.zero()) {
        overview.totalSupply = overview.totalSupply.plus(amount);
    }
    if (to == Address.zero()) {
        overview.totalSupply = overview.totalSupply.minus(amount);
    }
    overview.save();
}

function loadOrNewOverview(): Overview {
    let overview = Overview.load("GDX");
    if (overview == null) {
        overview = new Overview("GDX");
        overview.totalSupply = BIG_DECIMAL_ZERO;
        overview.holders = BIG_INT_ZERO;
    }
    return overview;
}

function handleHolder(address: Address, amount: BigDecimal): void {
    if (address == Address.zero()) {
        return;
    }
    let holder = Holder.load(address);
    let delta = BIG_INT_ZERO;
    if (holder == null) {
        delta = BIG_INT_ONE;
        holder = new Holder(address);
        holder.amount = BIG_DECIMAL_ZERO;
    }
    holder.amount = holder.amount.plus(amount);
    if (holder.amount == BIG_DECIMAL_ZERO) {
        delta = BigInt.fromI32(-1);
        store.remove("Holder", address.toHexString());
    } else {
        holder.save();
    }
    if (delta == BigInt.zero()) {
        return;
    }
    let overview = loadOrNewOverview();
    overview.holders = overview.holders.plus(delta);
    overview.save();
}
