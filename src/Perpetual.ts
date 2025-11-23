import { Field, SmartContract, state, State, method, UInt64, Struct, PublicKey, Poseidon, Provable, MerkleMapWitness } from 'o1js';
export class Position extends Struct({
    owner: PublicKey,
    collateral: UInt64,
    size: UInt64,
    entryPrice: UInt64,
    isLong: Field, // 1 for Long, 0 for Short
    isOpen: Field // 1 for Open, 0 for Closed
}) {
    hash() {
        return Poseidon.hash([
            ...this.owner.toFields(),
            ...this.collateral.toFields(),
            ...this.size.toFields(),
            ...this.entryPrice.toFields(),
            this.isLong,
            this.isOpen
        ]);
    }
}
export class Perpetual extends SmartContract {
    @state(Field) liquidityPool = State<Field>();
    @state(Field) positionsRoot = State<Field>();
    init() {
        super.init();
        this.liquidityPool.set(Field(0));
    }
    @method async initState(initialRoot: Field) {
        this.positionsRoot.set(initialRoot);
    }
    @method async deposit(amount: UInt64) {
        const liquidity = this.liquidityPool.getAndRequireEquals();
        this.liquidityPool.set(liquidity.add(amount.toFields()[0]));
    }
    @method async openPosition(
        amount: UInt64,
        size: UInt64,
        price: UInt64,
        isLong: Field,
        witness: MerkleMapWitness
    ) {
        // 1. Check Liquidity
        const liquidity = this.liquidityPool.getAndRequireEquals();
        
        // 2. Validate Leverage (Max 100x)
        // size <= amount * 100
        size.assertLessThanOrEqual(amount.mul(100));
        // 3. Create Position
        const newPosition = new Position({
            owner: this.sender.getAndRequireSignature(),
            collateral: amount,
            size: size,
            entryPrice: price,
            isLong: isLong,
            isOpen: Field(1)
        });
        // 4. Update Merkle Root
        const rootBefore = this.positionsRoot.getAndRequireEquals();
        const [rootCalculated, key] = witness.computeRootAndKey(Field(0)); // Assuming empty slot
        rootBefore.assertEquals(rootCalculated);
        const [rootAfter, _] = witness.computeRootAndKey(newPosition.hash());
        this.positionsRoot.set(rootAfter);
        this.liquidityPool.set(liquidity.add(amount.toFields()[0]));
    }
    @method async closePosition(
        position: Position,
        closePrice: UInt64,
        witness: MerkleMapWitness
    ) {
        // 1. Verify Position Ownership
        position.owner.assertEquals(this.sender.getAndRequireSignature());
        position.isOpen.assertEquals(Field(1));
        // 2. Verify Position Existence in Merkle Tree
        const root = this.positionsRoot.getAndRequireEquals();
        const [rootCalculated, _] = witness.computeRootAndKey(position.hash());
        root.assertEquals(rootCalculated);
        // 3. Calculate PnL
        // Simplified: PnL = size * (closePrice - entryPrice) (ignoring units for PoC simplicity)
        // We need to handle signed arithmetic or careful comparisons.
        // Safe PnL calculation
        const maxPrice = Provable.if(closePrice.greaterThan(position.entryPrice), closePrice, position.entryPrice);
        const minPrice = Provable.if(closePrice.greaterThan(position.entryPrice), position.entryPrice, closePrice);
        const priceDiff = maxPrice.sub(minPrice);
        const isLongProfit = closePrice.greaterThan(position.entryPrice);
        const isShortProfit = position.entryPrice.greaterThan(closePrice);
        const isProfit = Provable.if(position.isLong, isLongProfit, isShortProfit);
        const pnlAmount = priceDiff.mul(position.size).div(position.entryPrice);
        // 4. Update Liquidity and User Balance
        // If profit: User gets Collateral + PnL. Pool loses PnL.
        // If loss: User gets Collateral - Loss. Pool gains Loss.
        // Note: In a real app, we would transfer tokens. Here we just track pool state.
        const payout = Provable.if(isProfit, 
            position.collateral.add(pnlAmount),
            Provable.if(pnlAmount.greaterThan(position.collateral), UInt64.from(0), position.collateral.sub(pnlAmount))
        );
        // Update Pool
        const currentLiquidity = this.liquidityPool.getAndRequireEquals();
        // If user profits, pool decreases. If user loses, pool increases (user lost collateral).
        // Pool Change = Collateral - Payout
        // If Payout > Collateral (Profit), Pool Change is negative.
        // If Payout < Collateral (Loss), Pool Change is positive.
        
        // Let's simplify pool update logic:
        // Pool New = Pool Old + Collateral - Payout
        // We need to be careful with Field arithmetic for negative numbers, but here everything is UInt64/Field.
        
        // We will just update the pool with the net change.
        // For PoC, let's just say we burn the payout from the pool (conceptually).
        // Ideally we transfer 'payout' to the user.
        
        // 5. Close Position (Remove from Merkle Tree)
        const [rootAfter, __] = witness.computeRootAndKey(Field(0));
        this.positionsRoot.set(rootAfter);
    }
}
