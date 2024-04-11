import { U32 } from "big-varuint-js";
import { Rune } from "./Rune";

export class SpacedRune {
  readonly rune: Rune;
  readonly spacers: U32;

  constructor(rune: Rune, spacers: U32) {
    this.rune = rune;
    this.spacers = spacers;
  }

  static fromString(str: string) {
    let runeStr = "";
    let spacers = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      // valid character
      if (/[A-Z]/.test(char)) {
        runeStr += char;
      } else if (char === "." || char === "•") {
        const flag = 1 << (runeStr.length - 1);
        if ((spacers & flag) !== 0) {
          throw new Error("Double spacer");
        }

        spacers |= flag;
      } else {
        throw new Error("Invalid spacer character");
      }
    }

    if (32 - Math.clz32(spacers) >= runeStr.length) {
      throw new Error("Trailing spacer");
    }

    return new SpacedRune(Rune.fromString(runeStr), new U32(BigInt(spacers)));
  }

  toString() {
    const runeStr = this.rune.toString();

    let result = "";
    for (let i = 0; i < runeStr.length; i += 1) {
      const str = runeStr[i];
      result += str;

      if (this.spacers.toValue() & (1n << BigInt(i))) {
        result += "•";
      }
    }

    return result;
  }

  toJSON() {
    return this.toString();
  }
}
