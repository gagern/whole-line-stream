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

});
