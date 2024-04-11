import { U32, U64 } from "big-varuint-js";

export class RuneId {
  readonly block;
  readonly tx;

  constructor(block: U64, tx: U32) {
    this.block = block;
    this.tx = tx;
  }

  delta(next: RuneId) {
    const block = next.block.toValue() - this.block.toValue();
    let tx = next.tx.toValue();
    if (block === 0n) {
      tx -= this.tx.toValue();
    }

    return new RuneId(new U64(block), new U32(tx));
  }

  next(next: RuneId) {
    const block = this.block.toValue() + next.block.toValue();
    const tx =
      next.block.toValue() === 0n
        ? this.tx.toValue() + next.tx.toValue()
        : next.tx.toValue();

    return new RuneId(new U64(block), new U32(tx));
  }

  toJSON() {
    return {
      block: this.block.toString(),
      tx: this.tx.toString(),
    };
  }
}
