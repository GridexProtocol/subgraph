import {Redeem as RedeemEvent, Stake as StakeEvent, Unstake as UnstakeEvent} from "../generated/Staking/Staking";
import {Staker, Staking} from "../generated/schema";
import {Address, BigDecimal, BigInt, Bytes} from "@graphprotocol/graph-ts";
import {BIG_DECIMAL_ZERO, BIG_INT_ZERO} from "../../core/src/helper/consts";

export function handleStake(event: StakeEvent): void {
    const owner = event.params.owner;
    const amount = event.params.amount.toBigDecimal().div(BigDecimal.fromString("1e18"));
    const staking = createStaking(event.params.id.toString(), event);
    staking.owner = owner;
    staking.amount = amount;
    staking.save();

    addStakingAmountFor(Address.zero(), amount);
    addStakingAmountFor(owner, amount);
}

export function handleUnstake(event: UnstakeEvent): void {
    const staking = Staking.load(event.params.id.toString())!;
    staking.unstakedBlock = event.block.number;
    staking.unstakedTimestamp = event.block.timestamp;
    staking.unstakedTxHash = event.transaction.hash;
    staking.redeemableTime = event.params.redeemableTime;
    staking.status = "Unstaking";
    staking.save();
}

export function handleRedeem(event: RedeemEvent): void {
    const staking = Staking.load(event.params.id.toString())!;
    const amount = staking.amount;
    staking.redeemedBlock = event.block.number;
    staking.redeemedTimestamp = event.block.timestamp;
    staking.redeemedTxHash = event.transaction.hash;
    staking.status = "Redeemed";
    staking.save();

    addStakingAmountFor(Address.zero(), amount.neg());
    addStakingAmountFor(Address.fromBytes(staking.owner), amount.neg());
}

function createStaking(id: string, event: StakeEvent): Staking {
    const result = new Staking(id);
    result.stakingId = BigInt.fromString(id);
    result.stakedBlock = event.block.number;
    result.stakedTimestamp = event.block.timestamp;
    result.stakedTxHash = event.transaction.hash;
    result.unstakedBlock = BIG_INT_ZERO;
    result.unstakedTimestamp = BIG_INT_ZERO;
    result.unstakedTxHash = Bytes.empty();
    result.redeemableTime = BIG_INT_ZERO;
    result.redeemedBlock = BIG_INT_ZERO;
    result.redeemedTimestamp = BIG_INT_ZERO;
    result.redeemedTxHash = Bytes.empty();
    result.status = "Staking";
    return result;
}

function addStakingAmountFor(address: Address, amount: BigDecimal): void {
    let staker = Staker.load(address);
    if (staker == null) {
        staker = new Staker(address);
        staker.stakingAmount = BIG_DECIMAL_ZERO;
    }
    staker.stakingAmount = staker.stakingAmount.plus(amount);
    staker.save();
}
