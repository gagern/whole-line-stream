"use strict";

var WholeLineStream = require("../");
var expect = require("chai").expect;
var bl = require("bl");

describe("WholeLineStream", function() {

  it("caches incomplete lines", function() {
    var out = bl();
    var wls = new WholeLineStream();
    wls.pipe(out);
    wls.write("foo");
    expect(out).to.have.length(0);
    wls.write("bar\nbaz");
    expect(out.toString()).to.equal("foobar\n");
    wls.write("\n");
    expect(out.toString()).to.equal("foobar\nbaz\n");
  });

  it("completes last line", function() {
    var out = bl();
    var wls = new WholeLineStream();
    wls.pipe(out);
    wls.write("foo");
    expect(out).to.have.length(0);
    wls.end();
    expect(out.toString()).to.equal("foo\n");
  });

  it("turns \\r\\n into \\n", function() {
    var out = bl();
    var wls = new WholeLineStream();
    wls.pipe(out);
    wls.end("foo\r\nbar\r\n");
    expect(out.toString()).to.equal("foo\nbar\n");
  });

  it("allows \\r to overwrite the complete line", function() {
    var out = bl();
    var wls = new WholeLineStream();
    wls.pipe(out);
    wls.write("foo\r");
    wls.end("bar\n");
    expect(out.toString()).to.equal("bar\n");
  });

  it("allows \\r to overwrite part of the line", function() {
    var out = bl();
    var wls = new WholeLineStream();
    wls.pipe(out);
    wls.write("foo and baz\r");
    wls.end("bar\nqux\n");
    expect(out.toString()).to.equal("bar and baz\nqux\n");
  });

  it("appends a prefix to each line", function() {
    var out = bl();
    var wls = new WholeLineStream("[foo] ");
    wls.pipe(out);
    wls.write("bar\nbaz");
    wls.end("\rqu\n");
    expect(out.toString()).to.equal("[foo] bar\n[foo] quz\n");
  });

  it("allows passing a buffer as prefix", function() {
    var out = bl();
    var prefix = new Buffer("[foo] ");
    var wls = new WholeLineStream(prefix);
    wls.pipe(out);
    wls.write("bar\nbaz");
    wls.end("\rqu\n");
    expect(out.toString()).to.equal("[foo] bar\n[foo] quz\n");
  });

});
