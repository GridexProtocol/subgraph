import {Transfer as TransferEvent} from "../generated/GDX/GDX";
import {Holder, TotalSupply} from "../generated/schema";
import {Address, BigDecimal, BigInt, store} from "@graphprotocol/graph-ts";

export function handleTransfer(event: TransferEvent): void {
    const value = event.params.value;
    if (value == BigInt.zero()) {
        return;
    }
    const from = event.params.from;
    const to = event.params.to;
    const amount = value.toBigDecimal().div(BigDecimal.fromString("1e18"));

    handleTotalSupply(from, to, amount);
    handleHolder(from, amount.neg());
    handleHolder(to, amount);
}

function handleTotalSupply(from: Address, to: Address, amount: BigDecimal): void {
    if (from != Address.zero() && to != Address.zero()) {
        return;
    }
    let totalSupply = TotalSupply.load("GDX");
    if (totalSupply == null) {
        totalSupply = new TotalSupply("GDX");
        totalSupply.amount = BigDecimal.zero();
    }
    if (from == Address.zero()) {
        totalSupply.amount = totalSupply.amount.plus(amount);
    }
    if (to == Address.zero()) {
        totalSupply.amount = totalSupply.amount.minus(amount);
    }
    totalSupply.save();
}

function handleHolder(address: Address, amount: BigDecimal): void {
    if (address == Address.zero()) {
        return;
    }
    let holder = Holder.load(address);
    if (holder == null) {
        holder = new Holder(address);
        holder.amount = BigDecimal.zero();
    }
    holder.amount = holder.amount.plus(amount);
    if (holder.amount == BigDecimal.zero()) {
        store.remove("Holder", address.toHexString());
    } else {
        holder.save();
    }
}
