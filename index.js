"use strict";

var stream = require("stream");
var util = require("util");

var Transform = stream.Transform;

var NL = 10;
var CR = 13;

function asBuffer(obj) {
  if (Buffer.isBuffer(obj)) return obj;
  if (Buffer.from) return Buffer.from(obj);
  return new Buffer(String(obj));
}

function WholeLineStream(prefix) {
  Transform.call(this);
  this.prefix = prefix ? asBuffer(prefix) : null;
  this.queued = null;
  this.tail = null;
}

util.inherits(WholeLineStream, Transform);

function mergeTail(tail, buf, start, end) {
  if (tail && tail.length > end - start)
    return Buffer.concat([buf.slice(start, end), tail.slice(end - start)]);
  else
    return buf.slice(start, end);
}

WholeLineStream.prototype._transform = function(chunk, encoding, done) {
  if (!Buffer.isBuffer(chunk)) throw new Error("Only accepting buffers");
  if (this.queued) {
    chunk = Buffer.concat([this.queued, chunk]);
    this.queued = null;
  }
  var bol = 0, eol = 0;
  while (eol < chunk.length) {
    var chr = chunk[eol++];
    if (chr === CR) {
      this.tail = mergeTail(this.tail, chunk, bol, eol - 1);
      bol = eol;
    }
    if (chr === NL) {
      if (this.prefix)
        this.push(this.prefix);
      if (this.tail) {
        this.push(mergeTail(this.tail, chunk, bol, eol - 1));
        bol = eol - 1; // emit the \n
        this.tail = null;
      }
      this.push(chunk.slice(bol, eol));
      bol = eol;
    }
  }
  if (bol !== eol)
    this.queued = chunk.slice(bol);
  done();
};

WholeLineStream.prototype._flush = function(done) {
  if(this.queued)
    this._transform(asBuffer("\n"), null, done);
  else
    done();
}

module.exports = WholeLineStream;
