/**
 * @module structs
 */

import {
  AbstractItem,
  AbstractItemRef,
  getItemCleanEnd,
  getItemCleanStart,
  getItemType,
  Transaction, ID, AbstractType // eslint-disable-line
} from '../internals.js'

import * as encoding from 'lib0/encoding.js'
import * as decoding from 'lib0/decoding.js'

export const structEmbedRefNumber = 3

export class ItemEmbed extends AbstractItem {
  /**
   * @param {ID} id
   * @param {AbstractItem | null} left
   * @param {AbstractItem | null} right
   * @param {AbstractType<any>} parent
   * @param {string | null} parentSub
   * @param {Object} embed
   */
  constructor (id, left, right, parent, parentSub, embed) {
    super(id, left, right, parent, parentSub)
    this.embed = embed
  }
  /**
   * @param {ID} id
   * @param {AbstractItem | null} left
   * @param {AbstractItem | null} right
   * @param {AbstractType<any>} parent
   * @param {string | null} parentSub
   */
  copy (id, left, right, parent, parentSub) {
    return new ItemEmbed(id, left, right, parent, parentSub, this.embed)
  }
  /**
   * @param {encoding.Encoder} encoder
   * @param {number} offset
   */
  write (encoder, offset) {
    super.write(encoder, offset, structEmbedRefNumber)
    encoding.writeVarString(encoder, JSON.stringify(this.embed))
  }
}

export class ItemEmbedRef extends AbstractItemRef {
  /**
   * @param {decoding.Decoder} decoder
   * @param {ID} id
   * @param {number} info
   */
  constructor (decoder, id, info) {
    super(decoder, id, info)
    /**
     * @type {ArrayBuffer}
     */
    this.embed = JSON.parse(decoding.readVarString(decoder))
  }
  /**
   * @param {Transaction} transaction
   * @return {ItemEmbed}
   */
  toStruct (transaction) {
    const y = transaction.y
    const store = y.store
    return new ItemEmbed(
      this.id,
      this.left === null ? null : getItemCleanEnd(store, transaction, this.left),
      this.right === null ? null : getItemCleanStart(store, transaction, this.right),
      // @ts-ignore
      this.parent === null ? y.get(this.parentYKey) : getItemType(store, this.parent).type,
      this.parentSub,
      this.embed
    )
  }
}
