import {
  U128,
  U16,
  U32,
  U64,
  U8,
  Varuint,
  decodeBigVaruint,
} from "big-varuint-js";
export enum Tag {
  Body = 0,
  Flags = 2,
  Rune = 4,
  Premine = 6,
  Cap = 8,
  Amount = 10,
  HeightStart = 12,
  HeightEnd = 14,
  OffsetStart = 16,
  OffsetEnd = 18,
  Mint = 20,
  Pointer = 22,
  Cenotaph = 126,

  Divisibility = 1,
  Spacers = 3,
  Symbol = 5,
  Nop = 127,
}

export enum ValueType {
  U8,
  U16,
  U32,
  U64,
  U128,
}

export default class TagPayload {
  payloads: number[] = [];
  edicts: bigint[] = [];

  tagMap = new Map<number, bigint[]>();

  constructor(buff?: Buffer) {
    if (!buff) {
      return;
    }
    this.payloads.push(...buff);
  }

  decode() {
    const arr: bigint[] = [];
    let startI = -1;
    for (let i = 0; i < this.payloads.length; i += 1) {
      const byte = this.payloads[i];
      // maximum varuint per byte value is 127
      if ((byte & 0b1000_0000) === 0) {
        if (startI !== -1) {
          arr.push(
            decodeBigVaruint(Buffer.from(this.payloads.slice(startI, i + 1))),
          );
          startI = -1;
        } else {
          arr.push(BigInt(byte));
        }
        continue;
      }
      if (startI === -1) {
        startI = i;
      }
    }

    for (let i = 0; i < arr.length / 2; i++) {
      const keyI = i * 2;
      const key = arr[keyI];
      // split the edicts data, edict has different data format
      if (Number(key) === Tag.Body) {
        this.edicts = arr.slice(keyI + 1);
        break;
      }

      const valueI = i * 2 + 1;
      if (valueI >= arr.length) {
        throw new Error("Buffer length is not valid");
      }
      const value = arr[valueI];
      const mapValue = this.tagMap.get(Number(key));

      if (mapValue) {
        this.tagMap.set(Number(key), mapValue.concat(value));
        continue;
      }
      this.tagMap.set(Number(key), [value]);
    }
  }

  getValue(
    tag: Tag,
    valueType: ValueType,
    index: number = 0,
  ): Varuint | undefined {
    const valueArr = this.tagMap.get(tag);
    if (!valueArr) {
      return undefined;
    }
    const value = valueArr[index];

    switch (valueType) {
      case ValueType.U8:
        return new U8(value);
      case ValueType.U16:
        return new U16(value);
      case ValueType.U32:
        return new U32(value);
      case ValueType.U64:
        return new U64(value);
      case ValueType.U128:
        return new U128(value);
    }
  }

  private pushVaruint(varuint: Varuint) {
    const bytes = varuint.toVaruint();
    for (let i = 0; i < bytes.length; i += 1) {
      this.payloads.push(bytes[i]);
    }
  }

  encodeTagPush(tag: Tag, ...ns: (Varuint | undefined)[]) {
    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];

      if (n === undefined) {
        continue;
      }

      this.payloads.push(tag);
      this.pushVaruint(n);
    }
  }

  encodeMultiplePush(ns: (Varuint | undefined)[]) {
    if (!ns.length) {
      return;
    }

    for (let i = 0; i < ns.length; i++) {
      const n = ns[i];

      if (n === undefined) {
        continue;
      }
      this.pushVaruint(n);
    }
  }

  toBuffer() {
    return Buffer.from(this.payloads);
  }
}
