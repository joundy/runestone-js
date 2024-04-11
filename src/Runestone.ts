import { U128, U32, U64, U8 } from "big-varuint-js";
import { Edict, Etching, RunestoneParams } from "./types";
import { Tag, ValueType } from "./Tag";
import Flag, { FlagEnum } from "./Flag";
import TagPayload from "./Tag";
import { RuneId } from "./RuneId";

export default class Runestone {
  private edicts: Edict[];
  private etching?: Etching;
  private mint?: RuneId;
  private pointer?: U32;

  constructor(runestone: RunestoneParams) {
    this.edicts = runestone.edicts;
    this.etching = runestone.etching;
    this.mint = runestone.mint;
    this.pointer = runestone.pointer;
  }

  static dechiper(buff: Buffer) {
    const tagPayload = new TagPayload(buff);
    tagPayload.decode();

    let etching: Etching | undefined;
    const flagP = tagPayload.getValue(Tag.Flags, ValueType.U8) as U8;
    if (flagP) {
      const flag = new Flag(flagP);
      if (flag.hasFlag(FlagEnum.Etching)) {
        etching = {
          divisibility: tagPayload.getValue(
            Tag.Divisibility,
            ValueType.U8,
          ) as U8,
          premine: tagPayload.getValue(Tag.Premine, ValueType.U128) as U128,
          rune: tagPayload.getValue(Tag.Rune, ValueType.U128) as U128,
          spacers: tagPayload.getValue(Tag.Spacers, ValueType.U32) as U32,
          symbol: tagPayload.getValue(Tag.Symbol, ValueType.U8) as U128,
          terms: flag.hasFlag(FlagEnum.Terms)
            ? {
              amount: tagPayload.getValue(Tag.Amount, ValueType.U128) as U128,
              cap: tagPayload.getValue(Tag.Cap, ValueType.U128) as U128,
              height: {
                start: tagPayload.getValue(
                  Tag.HeightStart,
                  ValueType.U64,
                ) as U64,
                end: tagPayload.getValue(Tag.HeightEnd, ValueType.U64) as U64,
              },
              offset: {
                start: tagPayload.getValue(
                  Tag.OffsetStart,
                  ValueType.U64,
                ) as U64,
                end: tagPayload.getValue(Tag.OffsetEnd, ValueType.U64) as U64,
              },
            }
            : undefined,
        };
      }
    }
    const pointer = tagPayload.getValue(Tag.Pointer, ValueType.U32) as U32;
    const mint = new RuneId(
      tagPayload.getValue(Tag.Mint, ValueType.U64, 0) as U64,
      tagPayload.getValue(Tag.Mint, ValueType.U32, 1) as U32,
    );

    const edicts: Edict[] = [];
    const edictsP = tagPayload.edicts;
    if (edictsP.length) {
      if (edictsP.length && edictsP.length % 4) {
        throw new Error("Edict data length is not valid");
      }

      let next = new RuneId(new U64(0n), new U32(0n));
      for (let i = 0; i < edictsP.length / 4; i++) {
        const eI = i * 4;

        const runeId = next.next(
          new RuneId(new U64(edictsP[eI]), new U32(edictsP[eI + 1])),
        );
        const amount = edictsP[eI + 2];
        const output = edictsP[eI + 3];

        edicts.push({
          id: runeId,
          amount: new U128(amount),
          output: new U32(output),
        });

        next = runeId;
      }
    }

    return new Runestone({
      etching: etching,
      edicts,
      pointer,
      mint,
    });
  }

  enchiper(): Buffer {
    const tag = new TagPayload();

    if (this.etching !== undefined) {
      const etching = this.etching;

      const flag = new Flag(new U8(0n));
      flag.set(FlagEnum.Etching);
      if (etching.terms) {
        flag.set(FlagEnum.Terms);
      }
      tag.encodeTagPush(Tag.Flags, flag.toValue());

      tag.encodeTagPush(Tag.Rune, etching.rune);
      tag.encodeTagPush(Tag.Divisibility, etching.divisibility);
      tag.encodeTagPush(Tag.Spacers, etching.spacers);
      tag.encodeTagPush(Tag.Premine, etching.premine);
      tag.encodeTagPush(Tag.Symbol, etching.symbol);

      if (etching.terms) {
        const terms = etching.terms;

        tag.encodeTagPush(Tag.Amount, terms.amount);
        tag.encodeTagPush(Tag.Cap, terms.cap);

        if (terms.height) {
          tag.encodeTagPush(Tag.HeightStart, terms.height.start);
          tag.encodeTagPush(Tag.HeightEnd, terms.height.end);
        }

        if (terms.offset) {
          tag.encodeTagPush(Tag.OffsetStart, terms.offset.start);
          tag.encodeTagPush(Tag.OffsetEnd, terms.offset.end);
        }
      }
    }

    tag.encodeTagPush(Tag.Pointer, this.pointer);
    if (this.mint !== undefined) {
      tag.encodeTagPush(Tag.Mint, this.mint.block, this.mint.tx);
    }

    if (this.edicts.length) {
      tag.payloads.push(Tag.Body);

      this.edicts.sort((a, b) => {
        return Number(
          a.id.block.toValue() - b.id.block.toValue() ||
          a.id.tx.toValue() - b.id.tx.toValue(),
        );
      });

      let delta = new RuneId(new U64(0n), new U32(0n));
      for (let i = 0; i < this.edicts.length; i += 1) {
        const edict = this.edicts[i];

        const runeId = delta.delta(edict.id);
        tag.encodeMultiplePush([
          runeId.block,
          runeId.tx,
          edict.amount,
          edict.output,
        ]);

        delta = edict.id;
      }
    }

    return tag.toBuffer();
  }
}
